const { spawn } = require("child_process")
const EventEmitter = require("events")

require("dotenv").config()

const USERNAME = process.env.USER
const PASSWORD = process.env.PASSWORD

class Handler extends EventEmitter {
  constructor() {
    super()
    // spawen emulator child process
    this.emulator = spawn("./x3270/ws3270", ["-xrm", "s3270.unlockDelay: False"])

    // set alises for emulator stdin stdout
    this.input = this.emulator.stdin
    this.output = this.emulator.stdout
    // set for stdout so its easier
    this.output.setEncoding("utf-8")

    // property for checking locked state
    this.locked = false
    // buffer for commands, takes strings and functions
    this.buffer = []

    // read stream when readable 
    this.output.on("readable", this._readStream.bind(this))

    // property for status, is null before stream is read, 
    this.status = null
    this.statusLine = ''

    // property of current menu location
    this.location = ''

    // bind methods so they don't break if they're called outside this instance
    this.connect = this.connect.bind(this)
    this.getToRegistration = this.getToRegistration.bind(this)
    this.login = this.login.bind(this)
    this.queue = this.queue.bind(this)
    this.queueEnter = this.queueEnter.bind(this)
    this.queueString = this.queueString.bind(this)
    this.queueTab = this.queueTab.bind(this)
    this.exec = this.exec.bind(this)


    // properties of status
    this
    this.keyboardLocked = false
    this.keyboardOverflow = false
    this.screenFormatted = false
    this.fieldProtected = false
    this.connected = false
    this.host = null
    this.emulatorMode = 'N'
    this.modelNumber = 0
    this.rows = 24
    this.columns = 80
    this.cursorRow = 0
    this.cursorColumn = 0
    this.execTime = 0

    // start status loop : both status loop and buffered exec
    this.statusLoop = setInterval(() => {
      this._updateState()
      this._execFromBuffer()
    }, 10);

    this.execLoop = setInterval(() => {
    }, 10)

    setTimeout(() => {
      this.connect(process.env.HOST)
      this.login(USERNAME, PASSWORD)
      this.queue(this.getToRegistration)
    }, 100);
    setTimeout(() => {
      clearInterval(this.statusLoop)
    }, 1000);
  }

  connect(host) {
    this.queue("connect " + host)

  }

  login(username, password) {
    this.queue("home")
    this.queueString(username)
    this.queueTab()
    this.queueString(password)
    this.queueEnter()

  }

  queue(command) {
    this.buffer.push(command)
  }

  queueEnter() {
    this.buffer.push("enter")
  }

  queueString(string) {
    this.buffer.push("string " + string)
  }

  queueTab() {
    this.buffer.push("tab")
  }

  _execFromBuffer() {
    if (!this.locked & this.buffer.length > 0) {
      // get first command from buffer
      this.locked = true
      let command = this.buffer.shift()

      this.emit("command", command)
      // lock buffer to prevent more commands from executing

      if (typeof (command) === "string") {
        this.exec(command);
      } else if (typeof (command) === "function") {
        let unshiftArr = command()
        this._queueMacroElems(unshiftArr);
      }
    } else if (this.buffer.length != 0) {
      console.log("*****BLOCKED***** " + this.buffer + " " + this.statusLine);

    } else if (this.buffer.length === 0) {
      this.emit("clear")
    }
  }

  _queueMacroElems(unshiftArr) {
    for (let i = unshiftArr.length; i--; i >= 0) {

      if (unshiftArr[i].substring(0, 3) === ":::") {
        // treats the :: indicator as literal, unshifts buffer as string
        this.buffer.unshift("string " + unshiftArr[i].substring(1))
      } else if (unshiftArr[i].substring(0, 2) === "::") {

        // treats :: as a command indicator, unshifts buffer as command
        this.buffer.unshift(unshiftArr[i].substring(2))
      } else {
        // if no indicator, unshift buffer as string
        this.buffer.unshift("string " + unshiftArr[i])
      }
    }
  }

  exec(command) {
    this.input.write(command + "\n");
  }

  _readStream() {
    let string = ''
    while (this.output.readableLength > 0) {
      let char = this.output.read(1)
      if (char !== '\n' && char !== "\r") {
        string += char
      }

      if (char === '\n') {
        // console.log(string);

        let re = /(?<keyboardState>U|L|E) (?<screenFormatting>F|U) (?<fieldProtection>P|U) (?<connectionState>N|C\(.+\)) (?<emulatorMode>I|L|C|P|N) (?<modelNumber>[2-5]) (?<rows>\d+) (?<columns>\d+) (?<cursorRow>\d+) (?<cursorColumn>\d+) 0x0 (?<execTime>-|[\d\.]+)/gm
        let statusMatch = re.exec(string)
        if (statusMatch) {

          // console.log(string + " " + this.location);
          this.statusLine = string

          this._setState(statusMatch.groups)
        }

        if (string === "ok") {
          this.status = "ok"
        } else if (string === "error") {
          console.log(string);
          console.log("ERROR");

          this.status = "error"
        }

        if (string.substring(0, 5) === "data:") {
          console.log(string);

          this._dataHandler(string)
        }
        string = ''
      }
    }

  }

  _updateState() {
    // updateState loop keeps state up to date
    this.exec("ansitext")
    this.exec("ascii")
  }

  _setState({ keyboardState, screenFormatting, fieldProtection, connectionState, emulatorMode, modelNumber, rows, columns, cursorRow, cursorColumn, execTime }) {
    // setState from status line

    switch (keyboardState) {
      case "U": {
        this.keyboardLocked = false
        this.keyboardOverflow = null
      }
      case "L": {
        this.keyboardLocked = true
        this.keyboardOverflow = false
      }
      case "E": {
        this.keyboardLocked = true
        this.keybardOverflow = true
      }
    }

    switch (screenFormatting) {
      case "F": {
        this.screenFormatted = true
      }
      case "U": {
        this.screenFormatted = false
      }
    }

    switch (fieldProtection) {
      case "P": {
        this.fieldProtected = true
      }
      case "U": {
        this.fieldProtected = false
      }
    }

    switch (connectionState) {
      case "N": {
        this.connected = false
        this.host = null
      }
      default: {
        this.connected = true
        this.host = connectionState.substring(2, connectionState.length - 1)
      }

    }

    this.emulatorMode = emulatorMode

    this.modelNumber = Number(modelNumber)

    this.rows = Number(rows)
    this.columns = Number(columns)

    this.cursorColumn = Number(cursorColumn)
    this.cursorRow = Number(cursorRow)

    switch (execTime) {
      case "-": {
        this.execTime = 0
      }
      default: {
        this.execTime = Number(execTime)
      }
    }

    if (execTime === "-" && screenFormatting === "F") {
      this.locked = false
    }
  }

  _dataHandler(data) {
    let locationRe = /(BOSTON COLLEGE INFORMATION SERVICES)|(SYSTEM CONTROL SCREEN)|(SYSTEM MENU)|(YOUR PERSONAL RECORD MENU)|(UVIEW STUDENT INFORMATION)|(REGISTRATION)|(Registration)/gm
    let locationMatch = locationRe.exec(data)

    let registrationRe = /([0-9]{4})_{6} (\w+) (\d+) (.{22}) (.{10}) ((.{7}) (.{10})|(.{10}))/gm
    let registrationMatch = registrationRe.exec(data)

    if (locationMatch) {
      this._getLocation(locationMatch[0])
    } else if (registrationMatch) {
      console.log(registrationMatch);

      // this.registrationHandler(data)
    }

  }

  _getLocation(location) {

    switch (location) {
      case "BOSTON COLLEGE INFORMATION SERVICES": {
        this.location = "login"
        break
      }
      case "SYSTEM CONTROL SCREEN": {
        this.location = "systemControl"
        break
      }
      case "SYSTEM MENU": {
        this.location = "systemMenu"
        break
      }
      case "YOUR PERSONAL RECORD MENU": {
        this.location = "recordMenu"
        break
      }
      case "UVIEW STUDENT INFORMATION": {
        this.location = "uview"
        break
      }
      case "REGISTRATION": {
        this.location = "registration"
        break
      }
      case "Registration": {
        this.location = "registration"
        break
      }
      default: {
        throw new Error("unknown location")
      }

    }
  }
  registrationErrors(data) {

  }

  getToRegistration() {
    console.log("gettoRegistration\t" + this.location);

    if (this.location === "login") {
      throw Error("not logged in")
    } else if (this.location === "systemMenu") {
      return ["7", "::enter", "2", "::enter", "r", "::enter"]
    } else if (this.location === "recordMenu") {
      return ["2", "::enter", "r", "::enter"]
    } else if (this.location === "uview") {
      return ["r", "::enter"]
    } else {
      console.log("dont know what to do: ", this.location);

    }
  }


}

let test = new Handler()
// test.on("command", (command) => {
//   console.log("\t\t\t\t\t\t\t\t\t\t\t\t\t" + command)
//   console.log("\t\t\t\t\t\t\t\t\t\t\t\t\tqueue: " + test.buffer.slice(0, 4))

// })

process.stdin.pipe(test.input)
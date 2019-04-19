const { spawn } = require("child_process")
const EventEmitter = require("events")
const Screen = require("./screen")
const Status = require("./status")


class Handler extends EventEmitter {
  constructor(url) {
    super()

    this.counter = 0
    // spawen emulator child process
    this.emulator = spawn("./x3270/ws3270", ["-xrm", "s3270.unlockDelay: False"])

    this.screenBuffer = []
    // set alises for emulator stdin stdout
    this.input = this.emulator.stdin
    this.output = this.emulator.stdout

    // set for stdout so its easier
    this.output.setEncoding("utf-8")


    this.on("lock", () => {
      this.locked = true
    })

    this.status = new Status()
    this.screen = new Screen()

    this.buffer = []

    this.execLoop = setInterval(() => {
      this._execFromBuffer()
    }, 5);

    this.disconnect = this.disconnect.bind(this)

    if (url) {
      this.queueConnect(url)
    }
  }

  exec(command) {
    this.buffer.unshift(command)
  }

  _exec(command) {
    if (typeof command == "function") {

      let commandArr = command()
      if (typeof commandArr == "string") {
        command = commandArr
      } else {

        commandArr.reverse().forEach((each) => {

          let strEach = String(each)

          if (strEach.substring(0, 3) === ":::") {

            this.buffer.unshift(strEach.substring(1))
          } else if (strEach.substring(0, 2) === "::") {
            this.buffer.unshift(strEach.substring(2))
          } else if (typeof each == "function") {
            this.buffer.unshift(each)
          } else {
            this.buffer.unshift("String " + strEach)
          }

        })
      }
    } else {
      this.locked = true
      this.emit("lock")
      this.input.write(command + "\n")
      if (command === "ascii") {
        this._getScreen()
      } else {
        this._getStatus()
        this.buffer.unshift("ascii")
      }
    }
  }


  queue(command) {
    this.buffer.push(command)
  }

  queueEnter() {
    this.buffer.push("enter")
  }

  queueString(command) {
    this.buffer.push("String " + command)
  }

  queueTab() {
    this.buffer.push("tab")
  }

  queueConnect(url) {
    this.buffer.push("connect  " + url)
  }

  queueMacro(commandArray) {
    if (typeof commandArray === "function") {
      // if macro is a function add it to buffer
      this.buffer.push(commandArray)

    } else {
      // if macro is an array add elements to buffer
      commandArray.slice().forEach((each) => {
        let strEach = String(each)

        if (strEach.substring(0, 3) === ":::") {
          this.queueString(strEach.substring(1))
        } else if (strEach.substring(0, 2) === "::") {
          this.queue(strEach.substring(2))
        } else if (typeof each == "function") {
          this.queue(each)
        } else {
          this.queueString(strEach)
        }

      })

    }

  }

  _execFromBuffer() {
    if (!this.locked && this.buffer.length > 0) {
      let command = this.buffer.shift()
      this._exec(command)
    }
  }

  ascii(first) {
    if (first) {
      this.buffer.unshift("ascii")
    }
    this.queue("ascii")
  }

  _getStatus() {
    let buffer = []
    let read = setInterval(() => {
      if (this.output.readableLength > 0) {
        while (this.output.readableLength > 0) {
          let line = this._getLine()
          buffer.push(line)

        }
        this.status = buffer
        clearInterval(read)
        this.locked = false
        this.emit("unlock")
        this.emit("NEW_STATUS", this.status)
        if (this.buffer.length == 0) {
          this.emit("empty")
        }

      }
    }, 100);

  }

  _getScreen() {
    let screenBuffer = []
    let read = setInterval(() => {
      if (this.output.readableLength > 0) {
        while (this.output.readableLength > 0) {
          let line = this._getLine()
          screenBuffer.push(line)

        }
        this.screen.setScreen(screenBuffer.slice(0, 24))
        this.status = screenBuffer.slice(24)
        clearInterval(read)
        this.locked = false
        this.emit("unlock")
        this.emit("NEW_STATUS", this.status)
        if (this.buffer.length == 0) {
          this.emit("empty")
        }

      }
    }, 100);


  }

  _getLine() {
    let string = '';
    while (this.output.readableLength > 0) {
      let char = this.output.read(1);
      if (char !== "\n" && char !== "\r") {
        string += char;
      }
      if (char === "\n") {
        return string;
      }
    }
    return string
  }

  disconnect() {
    this.removeAllListeners()
    this.screen.removeAllListeners()
    clearInterval(this.execLoop)
    this.input.write("quit\n")
  }
}


module.exports = Handler



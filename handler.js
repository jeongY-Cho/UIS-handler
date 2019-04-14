const { spawn } = require("child_process")
const EventEmitter = require("events")

require("dotenv").config()

const USERNAME = process.env.USER
const PASSWORD = process.env.PASSWORD

class Screen extends EventEmitter {
  constructor() {
    super()
    this.screenArr = []
    this.screenMatrix = []
    this.screenString = ''

    this.setScreen = this._setScreen.bind(this)
  }

  _setScreen(arr) {
    this.screenMatrix = []
    this.screenArr = []
    for (let each of arr) {
      const subEach = each.substring(5);

      this.screenMatrix.push(subEach.split(""))
      this.screenArr.push(subEach)
    }
    this.screenString = this.screenArr.join("\n")
    this.emit("update", this)

  }

}

class Handler extends EventEmitter {
  constructor() {
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

    this.screen = new Screen()

    this.buffer = []

    setInterval(() => {
      this.execFromBuffer()
    }, 5);
  }

  exec(command) {
    this.buffer.unshift(command)
  }

  _exec(command) {
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
    // this.locked = true
    commandArray.slice().forEach((each) => {
      each = String(each)

      if (each.substring(0, 3) === ":::") {

        this.buffer.push(each.substring(1))
      } else if (each.substring(0, 2) === "::") {
        this.buffer.push(each.substring(2))
      } else {
        this.queueString(each)
      }

    })
    // this.locked = false
  }

  execFromBuffer() {
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
        this.screen._setScreen(screenBuffer.slice(0, 24))
        this.status = screenBuffer.slice(24)
        clearInterval(read)
        this.locked = false
        this.emit("unlock")
        this.emit("NEW_STATUS", this.status)
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
}


module.exports = { Handler }



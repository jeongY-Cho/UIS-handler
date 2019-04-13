const { spawn } = require("child_process")
const EventEmitter = require("events")

require("dotenv").config()

const USERNAME = process.env.USER
const PASSWORD = process.env.PASSWORD

class Screen {
  constructor() {
    this.screenArr = []
    this.screenMatrix = []

    this.setScreen = this.setScreen.bind(this)
  }

  setScreen(screenArr) {
    this.screenMatrix = []
    for (let each of screenArr) {
      this.screenMatrix.push(each.substring(6).split())
    }
    console.log(this.screenMatrix);

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
    this.output.on("readable", () => {
      console.log(`readable bytes ${this.output.readableLength}`)
      console.log(this.counter++);
      this._readStream()
    })

    this.output.on("end", () => console.log("end"))

    this.screen = new Screen()
  }

  exec(command) {
    this.input.write(command + "\n")
  }

  _readStream() {
    let string = ''

    while (this.output.readableLength > 0) {
      let char = this.output.read(1)

      if (char !== "\n" && char !== "\r") {
        string += char
      }

      if (char === "\n") {

        if (string.substring(0, 5) === "data:") {

          this.screenBuffer.push(string)
        }
        string = ''
      }
      if (this.screenBuffer.length > 22) {
        this.screen.setScreen(this.screenBuffer)

        this.screen = []
      }
    }

  }
}
let test = new Handler()
test.exec("ascii")
console.log(test.screen.screenMatrix)

process.stdin.pipe(test.input)
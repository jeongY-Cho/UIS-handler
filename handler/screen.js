const EventEmitter = require("events")
const fs = require("fs")

const logFile = fs.createWriteStream("./log.log")

class Screen extends EventEmitter {
  constructor() {
    super()
    this.screenArr = []
    this.screenString = ''

    this.setScreen = this._setScreen.bind(this)
    this.clearScreen = this.clearScreen.bind(this)

  }

  _setScreen(arr) {
    this.screenArr = []
    for (let each of arr) {
      const subEach = each.substring(5);

      this.screenArr.push(subEach)
    }
    this.screenString = this.screenArr.join("\n")
    console.log(this.screenArr);
    logFile.write(new Date(Date.now()).toISOString() + "\n" + this.status + "\n" + "-----------------------------------------------------------" + "\n" + this.screenString + "\n" + "----------------------------------------------------" + "\n\n")

    this.emit("update", this)

  }

  clearScreen() {
    this.screenArr = []
    this.screenString = ''
  }

  includes(query) {
    return this.screenString.includes(query)
  }

  indexOf(query) {
    return this.screenString.indexOf(query)
  }
}


module.exports = Screen
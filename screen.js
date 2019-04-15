const EventEmitter = require("events")

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
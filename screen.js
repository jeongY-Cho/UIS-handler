const EventEmitter = require("events")

class Screen extends EventEmitter {
  constructor() {
    super()
    this.screenArr = []
    this.screenMatrix = []
    this.screenString = ''

    this.setScreen = this._setScreen.bind(this)
    this.clearScreenSnapshot = this.clearScreenSnapshot.bind(this)
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

  clearScreenSnapshot() {
    this.screenMatrix = []
    this.screenArr = []
    this.screenString = ''
  }

}

module.exports = Screen
const EventEmitter = require("events")


class Status extends EventEmitter {
  constructor() {
    super()

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

  }

  setState(statusArr) {
    // setState from status line
    let { keyboardState, screenFormatting, fieldProtection, connectionState, emulatorMode, modelNumber, rows, columns, cursorRow, cursorColumn, execTime } = statusArr
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
}

module.exports = Status
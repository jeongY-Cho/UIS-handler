const Handler = require("./handler")

class UisHandler extends Handler {
  constructor() {
    super("n:bcvmcms.bc.edu")

    this.location = ''
    this.getToRegistration = this.getToRegistration.bind(this)
    this.getLocation = this.getLocation.bind(this)
    this.registerOne = this.registerOneByIndex.bind(this)
    this.readCourses = this.readCourses.bind(this)
    this.clearRegistration = this.clearRegistration.bind(this)
    this.cancelChanges = this.cancelChanges.bind(this)
  }

  getLocation() {
    let oldLoc = this.location
    let newLoc = ''

    if (this.screen.includes("BOSTON COLLEGE INFORMATION SERVICES")) {
      newLoc = "login"
    } else if (this.screen.includes("SYSTEM MENU")) {
      newLoc = "systemMenu"
    } else if (this.screen.includes("YOUR PEROSONAL RECORD MENU")) {
      newLoc = "recordMenu"
    } else if (this.screen.includes("UVIEW STUDENT INFORMATION")) {
      newLoc = "uview"
    } else if (this.screen.includes("Registration") || this.screen.includes("REGISTRATION")) {
      newLoc = "registration"
    } else if (this.screen.includes("ACCESS CODE")) {
      newLoc = "accessCode"
    } else {
      newLoc = "unknown"
      // throw new Error(`Unknown Location\nSnapshot:\n=============================================\n${this.screen.screenString}\n=============================================`)
    }

    if (oldLoc != newLoc) {
      this.emit("new_location", this.location)
    }
    this.location = newLoc
    return this.location

  }
  getToRegistration() {
    return new Promise((resolve, reject) => {

      let location = this.getLocation()

      if (location == "registration") {

      } else if (location == "login") {
        throw new Error("not logged in")
      } else if (location == "systemMenu") {
        this.queueMacro([7, "::enter", 2, "::enter", "R", "::enter"])
      } else if (location == "recordMenu") {
        this.queueMacro([2, "::enter", "R", "::enter"])
      } else if (location == "uview") {
        this.queueMacro(["R", "::enter"])
      }

      this.on("empty", () => {
        resolve()
      })
    })

  }

  login(username, password) {
    return new Promise((resolve, reject) => {
      this.queueMacro([username, "::tab", password, "::enter"])
      this.once("empty", () => {
        resolve()
      })
    })
  }

  readCourses() {
    if (this.getLocation() !== "registration") { throw new Error("not on registration page") }
    // console.log("readCourses", this.getLocation());

    return this.screen.screenArr.slice(10, 22)    // get slice of courses
      .map((each) => {
        let index = each.slice(4, 8)
        let course = ''
        let error = ''
        if (index !== "____") {
          course = each.slice(15, 25)
        }
        if (each[63] === "<") {
          error = each.slice(64)
        }
        return { index, course, error }                 // reduce slice to just the index numbers
      })

  }

  registerOneByIndex(index) {
    return new Promise((resolve, reject) => {
      if (this.getLocation() !== "registration") { throw new Error("not on registration page") }
      // find first open slot
      let courses = this.readCourses()
      let i
      for (i = 0; i < courses.length; i++) {
        if (courses[i].index === "____") {
          break
        }
      }
      // enter index
      this.queue("home")
      this.queueMacro(Array(i).fill("::tab"))
      this.queueMacro([index, "::enter"])
      // check for errors
      this.once("empty", async () => {

        let course = this.readCourses()[i]

        if (course.error === "COREQ REQUIRED   ") {
          reject(new Error(course.error))
        } else if (course.error) {
          await this.clearRegistration(i)
          reject(new Error(course.error))
        } else {
          reject
        }

      })

    })
  }

  registerAll(courseArr) {
    return new Promise(async (resolve, reject) => {
      let coursesRegistered = []
      let coursesFailed = []
      let coreqs = []
      for (let each of courseArr) {
        try {
          await this.registerOneByIndex(each.index)

          coursesRegistered.push(each)
        } catch (err) {
          if (err.message = "COREQ REQUIRED   ") {
            this.registerOneByIndex(each.coreq)
          }
          coursesFailed.push({ course: each, reason: err.message })
        }
      }

      resolve({ coursesRegistered, coursesFailed })
    })
  }

  clearRegistration(input) {
    return new Promise((resolve, reject) => {
      this.queue("home")

      if (input <= 12) {
        // if position (ie. a number at max length 12) clear line of the position
        this.queueMacro(Array(input).fill("::tab"))
      } else if (input > 100) {
        let courses = this.readCourses()
        var i
        for (i = 0; i < courses.length; i++) {

          if (courses[i].index == input) {
            break
          }
        }
        this.queueMacro(Array(i).fill("::tab"))
      }
      this.queueMacro(Array(4).fill("::delete"))
      this.queue("enter")

      this.on("empty", () => {
        resolve()
      })
    })
    // input is either position or index number

  }

  cancelChanges() {
    return new Promise((resolve) => {
      this.queue("home")
      this.queueString("back")
      this.queueEnter()
      this.once("empty", () => {
        resolve()
      })
    })
  }

  clearAll() {
    return new Promise((resolve, reject) => {
      this.queue("eraseInput")
      this.queue("enter")
      this.once("empty", () => {
        resolve()
      })
    })
  }
}

module.exports = UisHandler
const Handler = require("./handler/handler")

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
    // this.disconnect = this.disconnect.bind(this)
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
    } else if (this.screen.includes("New password:") || this.screen.includes("NEW PASSWORD:")) {
      newLoc = "uisClosed"
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
      } else {
        reject(new Error("Unknown Location"))
      }

      this.once("empty", () => {
        resolve(this.getLocation())
      })
    })

  }

  login(username, password) {
    return new Promise((resolve, reject) => {

      this.queueMacro(["::home", username, "::tab", password, "::enter"])
      this.once("empty", () => {

        let loc = this.getLocation()
        console.log(loc);
        if (loc == "login") {
          reject(new Error("Incorrect Username/Password"))
        } else if (loc === "uisClosed") {
          reject(new Error("UIS Closed"))
        } else {
          resolve()
        }
      })
    })
  }

  enterAccessCode(accessCode) {
    return new Promise((resolve, reject) => {

      this.once("empty", () => {
        let loc = this.getLocation()
        if (loc === "registration") {
          console.log("uisHandler.js");
          resolve()
        } else {
          reject(new Error("Wrong Access Code"))
        }
      })
      this.queueMacro(["::home", "::DeleteField", accessCode, "::enter"])
    })
  }


  readCourses() {
    if (this.getLocation() !== "registration") { throw new Error("not on registration page") }
    // console.log("readCourses", this.getLocation());

    return this.screen.screenArr.slice(10, 22)    // get slice of courses
      .map((each) => {
        let courseIndex = each.slice(4, 8)
        let code = ''
        let error = ''
        if (courseIndex !== "____") {
          code = each.slice(15, 25)
        }
        if (each[63] === "<") {
          error = each.slice(64)
        }
        return { courseIndex, code, error }                 // reduce slice to just the index numbers
      })

  }

  registerOneByIndex(courseIndex) {
    return new Promise((resolve, reject) => {
      if (this.getLocation() !== "registration") { throw new Error("not on registration page") }
      // find first open slot
      let courses = this.readCourses()

      let i
      for (i = 0; i < courses.length; i++) {
        if (courses[i].courseIndex === "____") {
          break
        }
      }
      // enter index
      this.queue("home")
      this.queueMacro(Array(i).fill("::tab"))
      this.queueMacro([courseIndex, "::enter"])
      // check for errors
      this.once("empty", async () => {

        let course = this.readCourses()[i]

        if (course.error === "COREQ REQUIRED   ") {
          this.emit("registrationSuccess", courseIndex)
          reject(new Error(course.error))
        } else if (course.error) {
          await this.clearRegistration(i)
          this.emit("registrationFailure", courseIndex)

          reject(new Error(course.error))
        } else {
          resolve()
        }

      })

    })
  }

  registerAll(courseArr) {
    return new Promise(async (resolve, reject) => {
      this.once("cancel", () => {
        courseArr = []
        reject()
      })
      let coursesRegistered = []
      let coursesFailed = []
      let coreqs = {}
      for (let each of courseArr) {
        try {
          await this.registerOneByIndex(each.courseIndex)
          console.log("registered: ", each.courseIndex);

          coursesRegistered.push(each)
        } catch (err) {
          if (err.message == "COREQ REQUIRED   ") {
            coreqs[each.courseIndex] = { course: each, reason: err.message }
          } else {
            coursesFailed.push({ course: each, reason: err.message })
          }
        }
      }

      // resolve coreqs. check that all coreqs have been registered
      let courses = this.readCourses()

      for (let course of courses) {
        if (Object.keys(coreqs).includes(course.courseIndex) && course.error == '') {
          coursesRegistered.push(coreqs[course.courseIndex].course)
          delete coreqs[course.courseIndex]

        }
      }
      for (let coreq of Object.values(coreqs)) {
        coursesFailed.push({ course: coreq.course, reason: coreq.reason })
      }

      resolve({ coursesRegistered, coursesFailed })

    })

  }

  cancel() {
    this.emit("cancel")
  }
  /*
  clearRegistration accepts either a position or course index number
  and clears that line from the registration screen.
  input type is determined by size: 
    if its less than or equal to 12, input is interpreted as a positional value
    if its greater than 12, input is interpreted as a course index 
  */
  clearRegistration(input) {
    // input is either position or index number
    return new Promise((resolve, reject) => {
      if (this.getLocation() !== "registration") { reject(new Error("not in registration")) }  // check position
      this.queue("home")                            // place on home field

      if (input <= 12) {
        // if position (ie. a number at max length 12) clear line of the position
        this.queueMacro(Array(input).fill("::tab"))
      } else if (input > 100) {
        // if import is a large number find then clear that index 
        let courses = this.readCourses()            // get current courses
        var i                                       // index var
        // loop to locate index
        for (i = 0; i < courses.length; i++) {
          if (courses[i].index == input) {
            break                                   // break if input equals the position index
          }
        }
        this.queueMacro(Array(i).fill("::tab"))     // move to position
      }
      this.queue("DeleteField")    // clear that field
      this.queue("enter")                           // stage change

      this.once("empty", () => {
        resolve()                                   // resolve promise once queue clears
      })
    })

  }

  cancelChanges() {
    return new Promise((resolve) => {
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

  saveChanges() {
    return new Promise((resolve, reject) => {
      this.queueMacro(["save", "::enter"])
      this.once("empty", () => {
        resolve()
      })
    })
  }

  logout() {
    return new Promise((resolve, reject) => {
      this.queueMacro(["done", "::enter", "::enter", "L", "::enter"])
      this.once("empty", () => {
        resolve()
      })

    })
  }


  // disconnect() {
  //   return new Promise((resolve, reject) => {
  //     this.once("empty", () => {
  //       resolve()
  //     })

  //     this.queueMacro(["::disconnect", "::quit"])
  //   })
  // }
}

module.exports = UisHandler
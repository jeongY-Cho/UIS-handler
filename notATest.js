require("dotenv").config()
const fs = require("fs")
const UisHandler = require("./uisHandler")

const PASS = process.env.PASSWORD
const USER = process.env.USER

const UIS = new UisHandler()

const log = fs.createWriteStream("./log.log")
UIS.screen.on("update", (screen) => {
  log.write("=================================================================================\n" + screen.screenString + "\n");
})

var course1 = {
  code: "ECON328201",
  course: "ECON3282",
  section: "01",
  courseIndex: '1254',
  corequisites: 'ECON3382'
}
var course2 = {
  code: "ECON338201",
  course: "ECON3382",
  section: "01",
  courseIndex: '1244',
  corequisites: ''
}
var course3 = {
  code: "",
  course: "",
  section: "",
  courseIndex: '1256',
  corequisites: ''
}
var course4 = {
  code: "",
  course: "",
  section: "",
  courseIndex: '1502',
  corequisites: ''
}
var course5 = {
  code: "",
  course: "",
  section: "",
  courseIndex: '8737',
  corequisites: ''
}
var course6 = {
  code: "",
  course: "",
  section: "",
  courseIndex: '1234',
  corequisites: ''
}

async function main() {
  try {
    await UIS.login(USER, PASS)

    // console.log(UIS.readCourses())
    // await UIS.clearAll()
    // let things = await UIS.registerAll([course1, course2, course3, course4, course5, course6])


    // console.log("things ", things);

    // await UIS.cancelChanges()
    // await UIS.logout()
    // UIS.screen.removeAllListeners()
    await UIS.disconnect()
    return
    // console.log(UIS.readCourses())
  } catch (err) {
    console.log(UIS.location)
    console.log(err);

  }
}

main()
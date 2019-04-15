require("dotenv").config()
const UisHandler = require("./uisHandler")

const PASS = process.env.PASSWORD
const USER = process.env.USER

const UIS = new UisHandler()

// handler.queueConnect("n:bcvmcms.bc.edu")


let time = Date.now()
// handler.on("lock", () => {
//   let now = Date.now()
//   console.log(now - time + " buffer locked");
//   time = now
// })
// handler.on("unlock", () => {
//   let now = Date.now()
//   console.log(now - time + " buffer unlocked");
//   time = now
// })
// UIS.screen.on("update", (screen) => {
//   console.log("==================================================================\n" + screen.screenString + "\n=====================================================");
// })

async function main() {
  try {
    await UIS.login(USER, PASS)
    await UIS.getToRegistration()

    console.log(UIS.readCourses())
    await UIS.clearAll()
    let things = await UIS.registerAll([{ index: 1254 }])
    console.log("things ", things);

    await UIS.cancelChanges()
    // console.log(UIS.readCourses())
  } catch (err) {
    console.log(UIS.location)
    console.log(err);

  }
}

main()
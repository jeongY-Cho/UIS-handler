require("dotenv").config()
const Handler = require("./handler")

const PASS = process.env.PASSWORD
const USER = process.env.USER

const handler = new Handler("n:bcvmcms.bc.edu")

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
handler.screen.on("update", (screen) => {
  console.log("==================================================================\n" + screen.screenString + "\n=====================================================\n" + handler.status);

})
handler.queueMacro([USER, "::tab", PASS, "::enter", 7, "::enter", 2, "::enter", "R", "::enter"])
// handler.exec("ascii")
setTimeout(() => {
  console.log("exec");

  handler.exec("ascii")
}, 500);
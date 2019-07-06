const Handler = require("./handler/handler2")

let handler = new Handler()



handler.queueConnect("n:bcvmcms.bc.edu")
// handler.queueString("chodr")
// handler.queue("tab")
// handler.queueString("East6sea")
handler.queueMacro(["chodr", "::tab", "East6sea", "::enter", "7", "::enter", "2", "::enter", "R", "::enter"])

setTimeout(() => {
  console.log(new Date(Date.now()).toISOString() + "\n" + handler.status)

  handler.queue("ascii")
  handler.queue("disconnect")
  handler.queue("ascii")
}, 1000)
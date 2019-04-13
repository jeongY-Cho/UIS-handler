const { spawn } = require("child_process")

const test = spawn("./x3270/ws3270", ["-xrm", "s3270.unlockDelay: False"])

const USER = "chodr@bc.edu"
const PASS = "East6sea"

test.stdout.setEncoding("utf8")

let counter = 1

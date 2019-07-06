import Handler from "./handler";

let handler = new Handler()


handler.connect("n:bcvmcms.bc.edu")

setTimeout(() => {
  console.log(handler.status);

  console.log(handler.screen.get());

}, 3000)

// process.stdin.pipe(handler.input)

// handler.output.pipe(process.stdout)
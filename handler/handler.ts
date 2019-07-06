import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import EventEmitter from "events";
import { Writable, Readable } from "stream";
import Screen from "./screen";

type MacroArray = Array<string | MacroResolver | any[]>;
type MacroResolver =
  | (() => MacroArray)
  | (() => MacroResolver)
  | (() => string);
type Command = string | MacroResolver | MacroArray;

export default class Handler extends EventEmitter {
  // emulator is the child process instantiated in constructor of x3270
  emulator: ChildProcessWithoutNullStreams;

  //
  buffer: Command[] = [];
  input: Writable;
  output: Readable;

  screen = new Screen();
  status: string[] = [];

  //
  private locked = false;

  constructor(url?: string) {
    super();

    if (process.platform === "win32") {
      this.emulator = spawn("./x3270/ws3270", [], { cwd: process.cwd() });
    } else {
      throw new Error("not win32");
    }

    // alias for stdin for child process
    this.input = this.emulator.stdin;

    // alias for stdout for child process
    this.output = this.emulator.stdout;
    // set output encoding to utf-8 so its easier
    this.output.setEncoding("utf-8");

    this.on("unlock", () => {

      if (this.buffer.length) {
        this._exec(this.buffer.shift()!);
      } else {

        this.emit("empty")
      }
    });

    this.on("newCommand", (command: Command) => {
      if (command) {
        this.buffer.push(command)
        if (!this.lock) {
          this._exec(this.buffer.shift()!);
        }
      }
    });
  }

  connect(url: string): void {
    this.queue("connect " + url)
  }

  private _exec = (command: Command): void => {

    this.lock = true;

    if (typeof command === "string") {
      this.output.once("readable", () => {
        setTimeout(() => {
          this.getScreen()
        }, 100);
      })
      if (command.substring(0, 3) === ":::") {
        this.input.write(command.substring(1) + "\n");
      } else if (command.substring(0, 2) === "::") {
        this.input.write("String " + command.substring(2) + "\n");
      } else {
        this.input.write(command + "\n");
      }
      if (command !== "ascii") {
        this.buffer.unshift("ascii")
      }

    } else if (typeof command === "function") {
      let macroReturn = command();
      this.buffer.unshift(macroReturn)
      this.lock = false
    } else if (command instanceof Array) {
      this.buffer = command.concat(this.buffer)
      this.lock = false
    } else {
      throw new Error("invalid commanad");
    }
  };

  private getScreen = () => {
    let screenBuffer = [];
    while (this.output.readableLength) {
      let line = this.getLine();
      screenBuffer.push(line);
    }

    if (screenBuffer.length === 2) {
      this.status = screenBuffer
    } else {
      this.screen.set(screenBuffer.slice(0, 24).map(line => line.substring(5)));
      this.status = screenBuffer.slice(24);
    }
    this.lock = false;
  };

  private getLine = () => {
    let string = "";
    while (this.output.readableLength > 0) {
      let char = this.output.read(1);
      if (char !== "\n" && char !== "\r") {
        string += char;
      }
      if (char === "\n") {

        return string;
      }
    }

    return string;
  };

  queue = (command: Command) => {
    this.emit("newCommand", command);
  };

  get lock() {
    return this.locked;
  }
  set lock(val: boolean) {
    this.locked = val;
    if (val) {
      this.emit("lock");
    } else {
      this.emit("unlock");
    }
  }

  pause() {
    this.lock = true
  }
  continue() {
    this.lock = false
  }
}

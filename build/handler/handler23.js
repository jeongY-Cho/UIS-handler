"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var handler_1 = __importDefault(require("./handler"));
var handler = new handler_1.default();
handler.connect("n:bcvmcms.bc.edu");
setTimeout(function () {
    console.log(handler.status);
    console.log(handler.screen.get());
}, 3000);
// process.stdin.pipe(handler.input)
// handler.output.pipe(process.stdout)

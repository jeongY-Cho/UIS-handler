"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var handler_1 = __importDefault(require("./handler"));
test("test handler.connect", function (done) {
    var handler = new handler_1.default();
    handler.connect("n:bcvmcms.bc.edu");
    setTimeout(function () {
        console.log(handler.status);
        expect(handler.status).toEqual(['U F U C(bcvmcms.bc.edu) I 4 24 80 6 45 0x0 -', 'ok']);
        done();
    }, 2000);
});

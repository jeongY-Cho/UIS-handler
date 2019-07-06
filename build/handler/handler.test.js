"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var handler_1 = __importDefault(require("./handler"));
var events_1 = __importDefault(require("events"));
var mockSpawn;
var mockInput;
var commands = [];
var MockOutput = /** @class */ (function (_super) {
    __extends(MockOutput, _super);
    function MockOutput() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.stdout = {
            setEncoding: function () { },
            readableLength: 0,
            once: function () { }
        };
        _this.stdin = {
            write: function (input) { commands.push(input); _this.emit("readable"); }
        };
        return _this;
    }
    return MockOutput;
}(events_1.default));
var dd = new MockOutput();
dd.stdin.write;
jest.mock("child_process", function () {
    mockInput = jest.fn(function (input) { return commands.push(input); });
    mockSpawn = jest.fn(function () {
        return dd;
    });
    return {
        _esModule: true,
        spawn: mockSpawn
    };
});
beforeEach(function () {
    commands = [];
});
test("test Handler.constructor", function () {
    var handler = new handler_1.default();
    console.log(mockSpawn);
    expect(mockSpawn.mock.calls.length).toBe(1);
});
test('test Handler._exec', function () {
    var handler = new handler_1.default();
    // command of string leading ":::"
    handler["_exec"](":::string");
    expect(commands).toStrictEqual(["::string\n"]);
    expect(handler.buffer).toStrictEqual(["ascii"]);
    commands = [];
    handler.buffer = [];
    //command of string leading "::"
    handler["_exec"]("::string");
    expect(commands).toStrictEqual(["String string\n"]);
    expect(handler.buffer).toStrictEqual(["ascii"]);
    handler.buffer = [];
    commands = [];
    //command of string no lead
    handler["_exec"]("string");
    expect(commands).toStrictEqual(["string\n"]);
    expect(handler.buffer).toStrictEqual(["ascii"]);
    handler.buffer = [];
    commands = [];
    // command of MacroArray
    handler["_exec"](["string1", "::string2", ":::string3"]);
    expect(commands).toStrictEqual(["string1\n", "ascii\n", "String string2\n", "ascii\n", "::string3\n", "ascii\n"]);
    handler.buffer = [];
    commands = [];
    //command of MacroResolver returning string
    handler["_exec"](function () { return "string"; });
    expect(commands).toStrictEqual(["String string\n", "ascii\n"]);
    handler.buffer = [];
    commands = [];
    // command of MacroResolver returning another macroResolver
    handler["_exec"](function () {
        return function () { return "string"; };
    });
    expect(commands).toStrictEqual(["String string\n", "ascii\n"]);
    handler.buffer = [];
    commands = [];
    // command of MacroResoler returning macroArray
    handler["_exec"](function () { return ["a", "b", "c"]; });
    expect(commands).toStrictEqual(["String a\n", "ascii\n", "String b\n", "ascii\n", "String c\n", "ascii\n"]);
});
test("test ");
test("test handlder.queue", function (done) {
    var handler = new handler_1.default();
    var lockSpy = jest.spyOn(handler, "lock", "set");
    var testResolver = function () { return "::b"; };
    handler.pause();
    handler.queue("::a");
    handler.queue(testResolver);
    handler.queue(["::c", "::d"]);
    expect(handler.buffer).toStrictEqual(["::a", testResolver, ["::c", "::d"]]);
    handler.on("empty", function () {
        expect(commands).toStrictEqual(["String a\n", "ascii\n", "String b\n", "ascii\n", "String c\n", "ascii\n", "String d\n", "ascii\n"]);
        expect(lockSpy.mock.calls.filter(function (call) {
            return call[0];
        }).length).toBe(7);
        expect(lockSpy.mock.calls.filter(function (call) {
            return !call[0];
        }).length).toBe(7);
        done();
    });
    handler.continue();
});
test("test handler.lock", function (done) {
    var handler = new handler_1.default();
    handler.on("lock", function () {
        expect(handler["locked"]).toBe(true);
        handler.on('unlock', function () {
            expect(handler["locked"]).toBe(false);
            done();
        });
        handler.lock = false;
    });
    handler.lock = true;
});

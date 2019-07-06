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
var child_process_1 = require("child_process");
var events_1 = __importDefault(require("events"));
var screen_1 = __importDefault(require("./screen"));
var Handler = /** @class */ (function (_super) {
    __extends(Handler, _super);
    function Handler(url) {
        var _this = _super.call(this) || this;
        //
        _this.buffer = [];
        _this.screen = new screen_1.default();
        _this.status = [];
        //
        _this.locked = false;
        _this._exec = function (command) {
            _this.lock = true;
            if (typeof command === "string") {
                _this.output.once("readable", function () {
                    setTimeout(function () {
                        _this.getScreen();
                    }, 100);
                });
                if (command.substring(0, 3) === ":::") {
                    _this.input.write(command.substring(1) + "\n");
                }
                else if (command.substring(0, 2) === "::") {
                    _this.input.write("String " + command.substring(2) + "\n");
                }
                else {
                    _this.input.write(command + "\n");
                }
                if (command !== "ascii") {
                    _this.buffer.unshift("ascii");
                }
            }
            else if (typeof command === "function") {
                var macroReturn = command();
                _this.buffer.unshift(macroReturn);
                _this.lock = false;
            }
            else if (command instanceof Array) {
                _this.buffer = command.concat(_this.buffer);
                _this.lock = false;
            }
            else {
                throw new Error("invalid commanad");
            }
        };
        _this.getScreen = function () {
            var screenBuffer = [];
            while (_this.output.readableLength) {
                var line = _this.getLine();
                screenBuffer.push(line);
            }
            if (screenBuffer.length === 2) {
                _this.status = screenBuffer;
            }
            else {
                _this.screen.set(screenBuffer.slice(0, 24).map(function (line) { return line.substring(5); }));
                _this.status = screenBuffer.slice(24);
            }
            _this.lock = false;
        };
        _this.getLine = function () {
            var string = "";
            while (_this.output.readableLength > 0) {
                var char = _this.output.read(1);
                if (char !== "\n" && char !== "\r") {
                    string += char;
                }
                if (char === "\n") {
                    return string;
                }
            }
            return string;
        };
        _this.queue = function (command) {
            _this.emit("newCommand", command);
        };
        if (process.platform === "win32") {
            _this.emulator = child_process_1.spawn("./x3270/ws3270", [], { cwd: process.cwd() });
        }
        else {
            throw new Error("not win32");
        }
        // alias for stdin for child process
        _this.input = _this.emulator.stdin;
        // alias for stdout for child process
        _this.output = _this.emulator.stdout;
        // set output encoding to utf-8 so its easier
        _this.output.setEncoding("utf-8");
        _this.on("unlock", function () {
            if (_this.buffer.length) {
                _this._exec(_this.buffer.shift());
            }
            else {
                _this.emit("empty");
            }
        });
        _this.on("newCommand", function (command) {
            if (command) {
                _this.buffer.push(command);
                if (!_this.lock) {
                    _this._exec(_this.buffer.shift());
                }
            }
        });
        return _this;
    }
    Handler.prototype.connect = function (url) {
        this.queue("connect " + url);
    };
    Object.defineProperty(Handler.prototype, "lock", {
        get: function () {
            return this.locked;
        },
        set: function (val) {
            this.locked = val;
            if (val) {
                this.emit("lock");
            }
            else {
                this.emit("unlock");
            }
        },
        enumerable: true,
        configurable: true
    });
    Handler.prototype.pause = function () {
        this.lock = true;
    };
    Handler.prototype.continue = function () {
        this.lock = false;
    };
    return Handler;
}(events_1.default));
exports.default = Handler;

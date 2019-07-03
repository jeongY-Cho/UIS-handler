"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EmulatorScreen = /** @class */ (function () {
    function EmulatorScreen() {
        var _this = this;
        this.screenArr = [];
        this.screenString = "";
        this.set = function (screenArr) {
            for (var _i = 0, screenArr_1 = screenArr; _i < screenArr_1.length; _i++) {
                var line = screenArr_1[_i];
                _this.screenArr.push(line);
            }
            _this.screenString = _this.screenArr.join(" ");
        };
        this.get = function () {
            return _this.screenArr;
        };
        this.clear = function () {
            _this.screenArr = [];
            _this.screenString = "";
        };
        this.includes = function (query) {
            return _this.screenString.includes(query);
        };
        this.indexOf = function (query, fromRow, fromColumn) {
            for (var i = fromRow || 0; i < _this.screenArr.length; i++) {
                var j = _this.screenArr[i].indexOf(query, fromColumn);
                if (j > -1) {
                    return [i, j];
                }
            }
            return [-1, -1];
        };
        this.findAll = function (query, fromRow, fromColumn) {
            // call indexof function repeatedly till returns [-1,-1]
            // at each call adds one to returned column index and calls
        };
    }
    EmulatorScreen.prototype.WordAt = function (rowOrCoords, columnOrCustomBreak, customWordBreak) {
        var startCoords;
        var wordBreak = " ";
        if (typeof rowOrCoords === "number" &&
            typeof columnOrCustomBreak === "number") {
            startCoords = [rowOrCoords, columnOrCustomBreak];
            if (customWordBreak) {
                wordBreak = customWordBreak;
            }
        }
        else if (Array.isArray(rowOrCoords)) {
            startCoords = rowOrCoords;
            if (typeof columnOrCustomBreak === "string") {
                wordBreak = columnOrCustomBreak;
            }
        }
        else {
            throw new Error("improper arguments");
        }
        // start at supplied indexes
        // iterates forward not back from index
        // iterate row till space, EOL or custom
        var word = "";
        for (var i = startCoords[1]; i < this.screenArr.length; i++) {
            var char = this.screenArr[startCoords[0]][i];
            if (char === wordBreak) {
                return word;
            }
            else {
                word += char;
            }
        }
        return word;
    };
    return EmulatorScreen;
}());
exports.default = EmulatorScreen;

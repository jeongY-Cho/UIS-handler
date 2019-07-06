"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EmulatorScreen = /** @class */ (function () {
    function EmulatorScreen() {
        var _this = this;
        this.history = [];
        this.screenArr = [];
        this.screenString = "";
        this.set = function (screenArr) {
            if (_this.screenArr.length) {
                _this.clear();
            }
            _this.screenArr = screenArr;
            _this.screenString = _this.screenArr.join("\n");
        };
        this.get = function () {
            return _this.screenArr;
        };
        this.clear = function () {
            _this.pushToHistory(_this.screenArr);
            _this.screenArr = [];
            _this.screenString = "";
        };
        this.pushToHistory = function (screen) {
            if (_this.history.length === 100) {
                _this.history.shift();
            }
            _this.history.push(screen);
        };
        this.includes = function (query) {
            return _this.screenString.toLowerCase().includes(query.toLowerCase());
        };
        this.indexOf = function (query, fromRow, fromColumn) {
            for (var i = fromRow || 0; i < _this.screenArr.length; i++) {
                if (fromRow && i === fromRow + 1) {
                    fromColumn = 0;
                }
                else if (!fromRow && i === 1) {
                    fromColumn = 0;
                }
                var j = _this.screenArr[i].toLowerCase().indexOf(query.toLowerCase(), fromColumn);
                if (j > -1) {
                    return [i, j];
                }
            }
            return [-1, -1];
        };
        this.findAll = function (query, fromRow, fromColumn) {
            // call indexof function repeatedly till returns [-1,-1]
            // at each call adds one to returned column index and calls
            var finds = [];
            var startRow = fromRow || 0;
            var startColumn = fromColumn || 0;
            while (true) {
                var coords = _this.indexOf(query, startRow, startColumn);
                if (coords[0] === -1 && coords[1] === -1) {
                    return finds;
                }
                else {
                    finds.push(coords);
                    startRow = coords[0];
                    startColumn = coords[1] + 1;
                }
            }
        };
        this.parse = function (customBreak) {
            if (customBreak) {
                var replaced_2 = _this.screenString.split(customBreak);
            }
            var replaced = _this.screenString.split(/ |\n/).filter(function (elem) { return elem; });
            var map = [];
            var startCoord = [0, 0];
            for (var _i = 0, replaced_1 = replaced; _i < replaced_1.length; _i++) {
                var word = replaced_1[_i];
                var returnCoord = _this.indexOf.apply(_this, [word].concat(startCoord));
                map.push(returnCoord);
                startCoord = [returnCoord[0], returnCoord[1] + 1];
            }
            return {
                words: replaced,
                map: map
            };
        };
    }
    EmulatorScreen.prototype.wordAt = function (rowOrCoords, columnOrCustomBreak, customWordBreak) {
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
        var line = this.screenArr[startCoords[0]];
        for (var i = startCoords[1]; i < line.length; i++) {
            var char = line[i];
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

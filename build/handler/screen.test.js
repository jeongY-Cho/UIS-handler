"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var screen_1 = __importDefault(require("./screen"));
var mockScreenArr = [
    "                                                                 SAT MAY 18, 2019",
    "                                                                                 ",
    "                                                                                 ",
    "                   BOSTON COLLEGE INFORMATION SERVICES                           ",
    "                                                                                 ",
    "                                                                                 ",
    "                   ENTER YOUR ID OR USERNAME: _________                          ",
    "                                                                                 ",
    "                   ENTER YOUR UNIV PASSWORD:                                     ",
    "                                                                                 ",
    "                                                                                 ",
    "                                                                                 ",
    "                                                                                 ",
    "                                                                                 ",
    "                 ACCESS IS LIMITED TO AUTHORIZED PERSONNEL                       ",
    "                 -----------------------------------------                       ",
    "                              PLEASE REMEMBER:                                   ",
    "                       LOG OFF UNATTENDED WORKSTATIONS                           ",
    "                                                                                 ",
    "                                                                                 ",
    '                 IF YOU WISH TO QUIT, PLEASE ENTER "YES": ___                    ',
    "                                                                        PROD     ",
    "                                                                        0566     ",
    "                                                                        TCP00566 ",
];
var mockScreenStr = mockScreenArr.join("\n");
test("is screen", function () {
    expect(new screen_1.default() instanceof screen_1.default).toBe(true);
});
test("test Screen.set()", function () {
    var testScreen = new screen_1.default();
    testScreen.set(["a b c d e f g"]);
    expect(testScreen.screenArr).toStrictEqual(["a b c d e f g"]);
    expect(testScreen.screenString).toBe("a b c d e f g");
    testScreen.set(["a b c d e f g", "h i j k l m"]);
    expect(testScreen.screenArr).toStrictEqual(["a b c d e f g", "h i j k l m"]);
    expect(testScreen.screenString).toBe("a b c d e f g\nh i j k l m");
    testScreen.set(mockScreenArr);
    expect(testScreen.screenArr).toStrictEqual(mockScreenArr);
    expect(testScreen.screenString).toStrictEqual(mockScreenStr);
});
test("test Screen.get()", function () {
    var testScreen = new screen_1.default();
    testScreen.set(["a b c d e f g"]);
    expect(testScreen.get()).toStrictEqual(["a b c d e f g"]);
    testScreen.set(mockScreenArr);
    expect(testScreen.get()).toStrictEqual(mockScreenArr);
});
test("test Screen.clear()", function () {
    var testScreen = new screen_1.default();
    testScreen.set(["a b c d e f g"]);
    expect(testScreen.get()).toStrictEqual(["a b c d e f g"]);
    testScreen.clear();
    expect(testScreen.screenArr).toStrictEqual([]);
    expect(testScreen.screenString).toBe("");
    expect(testScreen.get()).toStrictEqual([]);
});
test("test Screen.includes()", function () {
    var testScreen = new screen_1.default();
    testScreen.set(["a b c d e f g", "h i j k l m"]);
    expect(testScreen.includes("a")).toBe(true);
    expect(testScreen.includes("f")).toBe(true);
    expect(testScreen.includes("f g")).toBe(true);
    expect(testScreen.includes("g\nh")).toBe(true);
    expect(testScreen.includes("b h")).toBe(false);
    expect(testScreen.includes("z")).toBe(false);
    testScreen.set(mockScreenArr);
    expect(testScreen.includes("username")).toBe(true);
    expect(testScreen.includes("USERNAME")).toBe(true);
});
test("test Screen.indexOf()", function () {
    var testScreen = new screen_1.default();
    testScreen.set(["a b c d e f g", "h i j k l m"]);
    expect(testScreen.indexOf("a")).toEqual([0, 0]);
    expect(testScreen.indexOf("b")).toEqual([0, 2]);
    expect(testScreen.indexOf(" ")).toEqual([0, 1]);
    expect(testScreen.indexOf("j")).toEqual([1, 4]);
    expect(testScreen.indexOf("k l")).toEqual([1, 6]);
    testScreen.set(mockScreenArr);
    expect(testScreen.indexOf("username")).toEqual([6, 36]);
});
test("test Screen.findAll()", function () {
    var testScreen = new screen_1.default();
    testScreen.set(["a b c d e f g", "h i j k l m"]);
    expect(testScreen.findAll(" ")).toStrictEqual([
        [0, 1],
        [0, 3],
        [0, 5],
        [0, 7],
        [0, 9],
        [0, 11],
        [1, 1],
        [1, 3],
        [1, 5],
        [1, 7],
        [1, 9]
    ]);
    testScreen.set(mockScreenArr);
    expect(testScreen.findAll("enter")).toStrictEqual([
        [6, 19], [8, 19], [20, 45]
    ]);
    expect(testScreen.findAll("A")).toStrictEqual([[0, 66], [0, 70], [3, 40], [6, 41], [8, 36], [14, 17], [14, 38], [16, 33], [17, 33], [17, 48], [20, 41]]);
    expect(testScreen.findAll("A", 0, 67)).toHaveLength(10);
    expect(testScreen.findAll("A", 3, 41)).toHaveLength(8);
});
test("test wordAt()", function () {
    var testScreen = new screen_1.default();
    testScreen.set(["a b c d e f g", "h i j k l m"]);
    expect(testScreen.wordAt([0, 0])).toBe("a");
    expect(testScreen.wordAt([0, 0], "b")).toBe("a ");
    expect(testScreen.wordAt([0, 0], "g")).toBe("a b c d e f ");
    expect(testScreen.wordAt(0, 0)).toBe("a");
    expect(testScreen.wordAt(0, 0, "b")).toBe("a ");
    expect(testScreen.wordAt(0, 0, "g")).toBe("a b c d e f ");
    testScreen.set(mockScreenArr);
    expect(testScreen.wordAt([6, 19])).toBe("ENTER");
    expect(testScreen.wordAt([23, 72])).toBe("TCP00566");
});
test("test Screen.parse()", function () {
    var testScreen = new screen_1.default();
    testScreen.set(["a b c d e f g", "h i j k l m"]);
    expect(testScreen.parse()).toStrictEqual({ "map": [[0, 0], [0, 2], [0, 4], [0, 6], [0, 8], [0, 10], [0, 12], [1, 0], [1, 2], [1, 4], [1, 6], [1, 8], [1, 10]], "words": ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m"] });
    testScreen.set(mockScreenArr);
    expect(testScreen.parse()).toStrictEqual({
        words: ['SAT',
            'MAY',
            '18,',
            '2019',
            'BOSTON',
            'COLLEGE',
            'INFORMATION',
            'SERVICES',
            'ENTER',
            'YOUR',
            'ID',
            'OR',
            'USERNAME:',
            '_________',
            'ENTER',
            'YOUR',
            'UNIV',
            'PASSWORD:',
            'ACCESS',
            'IS',
            'LIMITED',
            'TO',
            'AUTHORIZED',
            'PERSONNEL',
            '-----------------------------------------',
            'PLEASE',
            'REMEMBER:',
            'LOG',
            'OFF',
            'UNATTENDED',
            'WORKSTATIONS',
            'IF',
            'YOU',
            'WISH',
            'TO',
            'QUIT,',
            'PLEASE',
            'ENTER',
            '"YES":',
            '___',
            'PROD',
            '0566',
            'TCP00566'],
        map: [[0, 65],
            [0, 69],
            [0, 73],
            [0, 77],
            [3, 19],
            [3, 26],
            [3, 34],
            [3, 46],
            [6, 19],
            [6, 25],
            [6, 30],
            [6, 33],
            [6, 36],
            [6, 46],
            [8, 19],
            [8, 25],
            [8, 30],
            [8, 35],
            [14, 17],
            [14, 24],
            [14, 27],
            [14, 35],
            [14, 38],
            [14, 49],
            [15, 17],
            [16, 30],
            [16, 37],
            [17, 23],
            [17, 27],
            [17, 31],
            [17, 42],
            [20, 17],
            [20, 20],
            [20, 24],
            [20, 29],
            [20, 32],
            [20, 38],
            [20, 45],
            [20, 51],
            [20, 58],
            [21, 72],
            [22, 72],
            [23, 72]]
    });
});
test("test Screen.history", function () {
    var testScreen = new screen_1.default();
    testScreen.set(["a"]);
    expect(testScreen.history).toHaveLength(0);
    testScreen.set(["a"]);
    expect(testScreen.history).toHaveLength(1);
    testScreen.set(["a"]);
    expect(testScreen.history).toHaveLength(2);
    testScreen.set(["a"]);
    expect(testScreen.history).toHaveLength(3);
    testScreen.clear();
    expect(testScreen.history).toHaveLength(4);
});

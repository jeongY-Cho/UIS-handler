import Handler from "./handler"
import EventEmitter from "events"

var mockSpawn: jest.Mock
var mockInput: jest.Mock
var commands: any[] = []

class MockOutput extends EventEmitter {
  stdout = {
    setEncoding: () => { },
    readableLength: 0,
    once: () => { }
  }
  stdin = {
    write: (input: string) => { commands.push(input); this.emit("readable") }
  }
}

let dd = new MockOutput()
dd.stdin.write

jest.mock("child_process", () => {
  mockInput = jest.fn((input) => commands.push(input))
  mockSpawn = jest.fn(() => {
    return dd
  })
  return {
    _esModule: true,
    spawn: mockSpawn
  }
})

beforeEach(() => {
  commands = []
})
test("test Handler.constructor", () => {
  let handler = new Handler()

  console.log(mockSpawn);

  expect(mockSpawn.mock.calls.length).toBe(1)


})

test('test Handler._exec', () => {
  let handler = new Handler()

  // command of string leading ":::"
  handler["_exec"](":::string")
  expect(commands).toStrictEqual(["::string\n"])
  expect(handler.buffer).toStrictEqual(["ascii"])

  commands = []
  handler.buffer = []
  //command of string leading "::"
  handler["_exec"]("::string")
  expect(commands).toStrictEqual(["String string\n"])
  expect(handler.buffer).toStrictEqual(["ascii"])

  handler.buffer = []
  commands = []
  //command of string no lead
  handler["_exec"]("string")
  expect(commands).toStrictEqual(["string\n"])
  expect(handler.buffer).toStrictEqual(["ascii"])

  handler.buffer = []
  commands = []
  // command of MacroArray
  handler["_exec"](["string1", "::string2", ":::string3"])
  expect(commands).toStrictEqual(["string1\n", "ascii\n", "String string2\n", "ascii\n", "::string3\n", "ascii\n"])

  handler.buffer = []
  commands = []
  //command of MacroResolver returning string
  handler["_exec"](() => "string")
  expect(commands).toStrictEqual(["String string\n", "ascii\n"])

  handler.buffer = []
  commands = []
  // command of MacroResolver returning another macroResolver
  handler["_exec"](() => {
    return () => "string"
  })
  expect(commands).toStrictEqual(["String string\n", "ascii\n"])

  handler.buffer = []
  commands = []
  // command of MacroResoler returning macroArray
  handler["_exec"](() => ["a", "b", "c"])
  expect(commands).toStrictEqual(["String a\n", "ascii\n", "String b\n", "ascii\n", "String c\n", "ascii\n"])

})

test("test ")


test("test handlder.queue", (done) => {
  let handler = new Handler()

  let lockSpy = jest.spyOn(handler, "lock", "set")

  let testResolver = () => "::b"
  handler.pause()
  handler.queue("::a")
  handler.queue(testResolver)
  handler.queue(["::c", "::d"])
  expect(handler.buffer).toStrictEqual(["::a", testResolver, ["::c", "::d"]])

  handler.on("empty", () => {
    expect(commands).toStrictEqual(["String a\n", "ascii\n", "String b\n", "ascii\n", "String c\n", "ascii\n", "String d\n", "ascii\n"])
    expect(lockSpy.mock.calls.filter(call => {
      return call[0]
    }).length).toBe(7)
    expect(lockSpy.mock.calls.filter(call => {
      return !call[0]
    }).length).toBe(7)
    done()
  })

  handler.continue()

})

test("test handler.lock", (done) => {
  let handler = new Handler()

  handler.on("lock", () => {
    expect(handler["locked"]).toBe(true)

    handler.on('unlock', () => {
      expect(handler["locked"]).toBe(false)
      done()
    })
    handler.lock = false
  })

  handler.lock = true
})


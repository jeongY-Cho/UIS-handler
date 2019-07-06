import Handler from "./handler";

test("test handler.connect", done => {
  let handler = new Handler()
  handler.connect("n:bcvmcms.bc.edu")
  setTimeout(() => {
    console.log(handler.status);

    expect(handler.status).toEqual(['U F U C(bcvmcms.bc.edu) I 4 24 80 6 45 0x0 -', 'ok'])
    done()
  }, 2000);
})

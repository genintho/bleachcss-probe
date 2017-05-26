var Probe = require("../probe");

describe("Probe._sendbuffer", () => {
    let open;
    let send;
    let p;
    let probeKey = "probeKey";
    beforeEach(() => {
        p = new Probe();

        p._buffer = [".a", ".b", ".c"];
        p._allSelectors = {
            ".a": {
                files: ["url1"]
            },
            ".b": {
                files: ["url2"]
            },
            ".c": {
                files: ["url1"]
            },
            ".notSend": {
                files: ["nothing"]
            }
        };

        p.resume = jest.fn();
        p.start({ key: probeKey, debug: false });

        open = jest.fn();
        send = jest.fn();
        const xhrMockClass = () => {
            return {
                open,
                send
            };
        };
        global.XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass);
    });

    test("should do nothing if buffer is empty", () => {
        p._buffer = [];
        p._sendBuffer();
        expect(open).not.toHaveBeenCalled();
        expect(send).not.toHaveBeenCalled();
    });

    test("use the options url", () => {
        var fakeUrl = "something" + new Date().getTime();
        p.start({ url: fakeUrl });

        p._sendBuffer();
        expect(open).toHaveBeenCalledWith("POST", fakeUrl);
    });

    test("should empty the buffer array", () => {
        p._sendBuffer();
        expect(p._buffer).toHaveLength(0);
    });

    test("is sending the correct data structure", () => {
        p._sendBuffer();
        expect(send).toHaveBeenCalledWith(
            JSON.stringify({
                v: "0.1",
                k: probeKey,
                f: {
                    url1: [".a", ".c"],
                    url2: [".b"]
                }
            })
        );
    });
});

var Probe = require("../probe");

describe("Probe.start", () => {
    test("should call resume", () => {
        var p = new Probe();
        p.resume = jest.fn();
        p.start({ key: "a" });
        expect(p.resume).toHaveBeenCalled();
    });

    test("should copy over options", () => {
        var p = new Probe();
        expect(p.options.chunkSize).toBe(250);

        p.resume = jest.fn();
        p.start({ key: "a", chunkSize: 340 });
        expect(p.options.chunkSize).toBe(340);
    });

    test("must require a key", () => {
        expect(() => {
            var p = new Probe();
            p.start({ chunkSize: 340 });
        }).toThrow("BleachCSS require an API key");
    });
});

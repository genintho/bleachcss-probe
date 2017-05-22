var Probe = require("../probe");

describe("_processCssRules", () => {
    test("_processCssRules should do nothing when nothing is passed", () => {
        const p = new Probe();
        p._addSelector = jest.fn();
        p._processCssRules("a", []);
        expect(p._addSelector).not.toHaveBeenCalled();
    });

    test("_processCssRules should insert element", () => {
        const p = new Probe();
        p._addSelector = jest.fn();
        p._processCssRules("url", [{ selectorText: ".a" }]);
        expect(p._addSelector).toHaveBeenCalledWith("url", ".a", true);
    });

    test("_processCssRules should insert element", () => {
        const p = new Probe();
        p._addSelector = jest.fn();
        p._processCssRules("url", [
            {
                selectorText: ".a"
            },
            {
                selectorText: ".b"
            }
        ]);
        expect(p._addSelector).toHaveBeenCalledTimes(2);
        expect(p._addSelector).toHaveBeenCalledWith("url", ".a", true);
        expect(p._addSelector).toHaveBeenCalledWith("url", ".b", true);
    });

    test("_processCssRules should insert element", () => {
        const p = new Probe();
        p._addSelector = jest.fn();
        p._processCssRules("url", [
            {
                selectorText: ".a"
            },
            {
                selectorText: null
            },
            {
                selectorText: ".c"
            }
        ]);
        expect(p._addSelector).toHaveBeenCalledTimes(2);
    });
});

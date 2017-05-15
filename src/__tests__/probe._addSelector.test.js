var Probe = require("../probe");

describe("_addSelector", () => {
    test("basic test", () => {
        var p = new Probe();
        p._findChecker = jest.fn();
        p._findParentSelector = jest.fn();

        p._addSelector("u", ".aaa", true);

        expect(p._findChecker).toHaveBeenCalledWith(".aaa");
        expect(p._findParentSelector).toHaveBeenCalledWith(".aaa");
        expect(p._allSelectors).toMatchObject({
            ".aaa": {
                checked: false,
                exists: true,
                files: ["u"],
                seen: false
            }
        });
    });

    test("should handle parent selector correctly", () => {
        var p = new Probe();
        // p._addSelector = jest.fn();
        const spy = jest.spyOn(p, "_addSelector");
        p._extractSelectors("u", ".aaa .bbb {color:red;}");

        expect(p._unseenSelectors).toEqual({ ".aaa .bbb": true });
        expect(p._allSelectors).toMatchObject({
            ".aaa .bbb": {
                exists: true,
                checked: false,
                seen: false,
                parent: ".aaa",
                files: ["u"]
            },
            ".aaa": {
                exists: false,
                checked: false,
                seen: false,
                files: [],
                parent: null
            }
        });
        expect(spy).toBeCalledWith("u", ".aaa .bbb", true);
        expect(spy).toBeCalledWith(null, ".aaa", false);
    });

    // ===================================================================================================
    // strictInferior: {
    // input: "li > ul, li > ol { margin-bottom: 0; }",
    // selectors: ["li"]
    // }

    test("should handle  strict parent selector correctly", () => {
        var p = new Probe();
        // p._addSelector = jest.fn();
        const spy = jest.spyOn(p, "_addSelector");
        p._extractSelectors("u", ".aaa > .bbb {color:red;}");

        expect(p._allSelectors).toMatchObject({
            ".aaa > .bbb": {
                parent: ".aaa"
            },
            ".aaa": {
                parent: null
            }
        });
        expect(spy).toBeCalledWith("u", ".aaa > .bbb", true);
        expect(spy).toBeCalledWith(null, ".aaa", false);
    });

    test("set the exits value", () => {
        var p = new Probe();

        p._addSelector("u", ".aaa", false);

        expect(p._allSelectors).toMatchObject({
            ".aaa": {
                exists: false
            }
        });
    });

    test("add new url to existing selector", () => {
        var p = new Probe();
        p._allSelectors = {
            ".aaa": {
                checked: false,
                exists: true,
                files: ["u1"],
                seen: false
            }
        };
        p._addSelector("u2", ".aaa", false);

        expect(p._allSelectors).toMatchObject({
            ".aaa": {
                files: ["u1", "u2"]
            }
        });
    });

    test("reject font-face", () => {
        var p = new Probe();
        p._addSelector("u", "@font-face", true);
        expect(Object.keys(p._allSelectors)).toHaveLength(0);
    });
});

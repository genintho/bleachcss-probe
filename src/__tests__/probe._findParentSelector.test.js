var Probe = require("../probe");

var testInputs = {
    ".a": [null],
    ".a.b": [null],
    ".a.b.c": [null],

    ".a .b": [".a"],
    ".a .b .c": [".a .b", ".a"],
    ".a.b .c": [".a.b"],
    ".a .b.c": [".a"],

    ".a > .b": [".a"],
    ".a > .b > .c": [".a > .b", ".a"],

    ".a ~ .b": [".a"],
    ".a ~ .b~.c": [".a ~ .b", ".a"],

    ".a + .b": [".a"],
    ".a + .b + .c": [".a + .b", ".a"],
    ".a + .b ~ .c": [".a + .b", ".a"],

    ".a+.b ~ .c.d > .e": [".a+.b ~ .c.d", ".a+.b", ".a"]
};

describe("PostCSS _findParentSelector", () => {
    describe("extraction test", () => {
        Object.keys(testInputs).forEach((selector, idx) => {
            const expectedParentSelector = testInputs[selector][0];
            test(selector, () => {
                var p = new Probe();
                var spy = jest.spyOn(p, "_findParentSelector");
                const ret = p._findParentSelector(selector);
                expect(ret).toBe(expectedParentSelector);
                if (expectedParentSelector !== null) {
                    // Test that we have detected all the parents
                    expect(spy).toHaveBeenCalledTimes(testInputs[selector].length + 1);

                    // Test that we find them correctly
                    testInputs[selector].forEach(inn => {
                        expect(spy).toHaveBeenCalledWith(inn);
                    });
                }
            });
        });
    });
});

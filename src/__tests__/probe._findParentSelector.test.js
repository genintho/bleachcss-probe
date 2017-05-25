var Probe = require("../probe");

var testInputs = {
    ".a": null,
    ".a .b": ".a",
    ".a.b": null,
    ".a.b .c": ".a.b",
    ".a .b.c": ".a",
    ".a > .b": ".a",
    ".a ~ .b": ".a",
    ".a + .b": ".a"
};

describe("PostCSS _findParentSelector", () => {
    Object.keys(testInputs).forEach((selector, idx) => {
        const expectedParentSelector = testInputs[selector];
        test("_findParentSelector " + selector, () => {
            var p = new Probe();
            p._addSelector = jest.fn();
            const ret = p._findParentSelector(selector);
            expect(ret).toBe(expectedParentSelector);
        });
    });
});

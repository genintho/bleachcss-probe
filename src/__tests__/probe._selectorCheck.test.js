var Probe = require("../probe");

describe("Probe._selectorCheck", () => {
    test("should marked as checked the selector being processed", () => {
        const selector = ".aaa";
        const returnValue = Math.random();

        var p = new Probe();
        p.__selectorCheck = jest.fn().mockImplementation(() => {
            return returnValue;
        });
        p._allSelectors[selector] = {
            checked: false
        };

        var ret = p._selectorCheck(selector);

        expect(p.__selectorCheck).toHaveBeenCalledWith(selector);
        expect(p._allSelectors[selector]).toBeTruthy();
        expect(ret).toBe(returnValue);
    });
});

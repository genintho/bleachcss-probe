var Probe = require("../probe");

describe("Probe.__selectorCheck", () => {
    test("should return seen value if selector was already checked", () => {
        var selector = ".aaa";
        var testRetVal = Math.random();
        var p = new Probe();
        p._allSelectors[selector] = {
            checked: true,
            seen: testRetVal
        };
        var ret = p.__selectorCheck(selector);
        expect(ret).toBe(testRetVal);
    });

    test("should not query the DOM if parent is not seen", () => {
        var selector = ".aaa .bbb";
        var parentSelector = ".aaa";
        var p = new Probe();
        p._selectorCheck = jest.fn().mockImplementation(() => {
            return false;
        });
        p._allSelectors[selector] = {
            checked: false,
            seen: null,
            parent: parentSelector
        };

        var ret = p.__selectorCheck(selector);
        expect(ret).toBeFalsy();
        expect(p._selectorCheck).toHaveBeenCalledWith(parentSelector);
    });

    test("should return false if selector can not be found", () => {
        var selector = ".aaa .bbb";
        var p = new Probe();
        var mockFcn = jest.fn().mockImplementation(() => {
            return false;
        });
        p._allSelectors[selector] = {
            checked: false,
            seen: null,
            fcn: mockFcn
        };
        var ret = p.__selectorCheck(selector);
        expect(mockFcn).toHaveBeenCalledWith(selector);
        expect(ret).toBeFalsy();
    });

    test("should return true if selector can be found", () => {
        var selector = ".aaa .bbb";
        var p = new Probe();
        p._unseenSelectors[selector] = true;
        var mockFcn = jest.fn().mockImplementation(() => {
            return true;
        });
        p._allSelectors[selector] = {
            checked: false,
            seen: null,
            exists: true,
            fcn: mockFcn
        };
        var ret = p.__selectorCheck(selector);
        expect(mockFcn).toHaveBeenCalledWith(selector);
        expect(ret).toBeTruthy();
        expect(p._unseenSelectors).toEqual({});
        expect(p._buffer).toEqual([selector]);
        expect(p._allSelectors[selector].seen).toBeTruthy();
    });
});

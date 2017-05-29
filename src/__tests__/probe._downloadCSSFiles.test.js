var Probe = require("../probe");

describe("Probe._downloadCSSFiles", () => {
    test("makes a GET request to load CSS files", () => {
        var p = new Probe();

        var callbackFct = jest.fn();
        var testURL = "aaaa";

        const xhrMockClass = function() {
            this.open = jest.fn();
            this.send = () => {
                this.readyState = 4;
                this.status = 200;
                this.onreadystatechange();
                expect(this.open).toHaveBeenCalledWith("GET", testURL, true);
            };
        };

        global.XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass);

        p._downloadCSSFiles([testURL], callbackFct);

        expect(p._cssFilesURLs).toEqual([testURL]);
        expect(callbackFct).toHaveBeenCalledTimes(1);
    });

    test("does not load a file already loaded", () => {
        var testURL = "aaa";
        var callbackFct = jest.fn();
        var p = new Probe();
        p._cssFilesURLs = [testURL, "bbb"];
        p._downloadCSSFiles([testURL], callbackFct);
        expect(callbackFct).not.toHaveBeenCalled();
    });

    test("does not load CSS data uri", () => {
        var testURL = "data:text/css,something";
        var callbackFct = jest.fn();
        var p = new Probe();
        p._downloadCSSFiles([testURL], callbackFct);
        expect(callbackFct).not.toHaveBeenCalled();
    });
});

var Probe = require("../probe");

describe("_processStyleSheets", () => {
    beforeEach(() => {
        document.styleSheets = [];
    });
    test("should extract url if no rules is used", () => {
        document.styleSheets = [];
        document.styleSheets.push({
            href: "https://grid.fr/a.css",
            rules: null
        });

        const p = new Probe();
        p._processCssRules = jest.fn();
        var urls = p._processStyleSheets();
        expect(urls).toEqual(["https://grid.fr/a.css"]);
        expect(p._cssFilesURLs).toEqual([]);
    });

    test("should ignore chrome-exension url", () => {
        document.styleSheets = [];
        document.styleSheets[0] = {
            href: "https://grid.fr/a.css",
            rules: null
        };

        document.styleSheets[1] = {
            href: "chrome-extension://kbfnbcaeplbcioakkpcpgfkobkghlhen/src/css/styl/checkbox.css",
            rules: null
        };

        const p = new Probe();
        p._processCssRules = jest.fn();
        var urls = p._processStyleSheets();
        expect(urls).toEqual(["https://grid.fr/a.css"]);
        expect(p._cssFilesURLs).toEqual([]);
    });
});

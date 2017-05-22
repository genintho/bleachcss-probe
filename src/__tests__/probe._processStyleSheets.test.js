var Probe = require("../probe");

describe("_processStyleSheets", () => {
    beforeEach(() => {
        document.styleSheets = [];
    });

    test("should handle null href value", () => {
        document.styleSheets.push({
            href: null,
            cssRules: null
        });

        const p = new Probe();
        var urls = p._processStyleSheets();
        expect(urls).toEqual([]);
        expect(p._cssFilesURLs).toEqual([]);
    });

    test("should extract url if no rules is used", () => {
        document.styleSheets.push({
            href: "https://grid.fr/a.css",
            cssRules: null
        });

        const p = new Probe();
        var urls = p._processStyleSheets();
        expect(urls).toEqual(["https://grid.fr/a.css"]);
        expect(p._cssFilesURLs).toEqual([]);
    });

    test("should ignore chrome-exension url", () => {
        document.styleSheets[0] = {
            href: "https://grid.fr/a.css",
            cssRules: null
        };

        document.styleSheets[1] = {
            href: "chrome-extension://kbfnbcaeplbcioakkpcpgfkobkghlhen/src/css/styl/checkbox.css",
            cssRules: null
        };

        const p = new Probe();
        var urls = p._processStyleSheets();
        expect(urls).toEqual(["https://grid.fr/a.css"]);
        expect(p._cssFilesURLs).toEqual([]);
    });

    test("should process CSS rules", () => {
        document.styleSheets = [];

        const mockUrl = "https://grid.fr/a.css";
        const mockRules = { a: 4 };

        document.styleSheets[0] = {
            href: mockUrl,
            cssRules: mockRules
        };

        const p = new Probe();
        p._processCssRules = jest.fn();
        var urls = p._processStyleSheets();
        expect(urls).toEqual([]);
        expect(p._cssFilesURLs).toEqual([mockUrl]);
        expect(p._processCssRules).toHaveBeenCalledWith(mockUrl, mockRules);
    });
});

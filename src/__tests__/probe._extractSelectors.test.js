var Probe = require("../probe");
var fs = require("fs");
var path = require("path");
var postCssExtractor = require("../postCssExtractor");

const inputs = {
    simple: {
        input: ".aaa {color: #6e788b;}",
        selectors: [".aaa"]
    },
    multiple: {
        input: ".bbb {color: #6e788b;} .ccc {color: blue;}",
        selectors: [".bbb", ".ccc"]
    },
    /// ===================================================================================================
    hover: {
        input: ".aaa-item:hover {margin-right: 3px}",
        selectors: [".aaa-item"]
    },
    /// ===================================================================================================
    "nth-child": {
        input: ".aaa-item>div:nth-child(1) {margin-right: 3px}",
        selectors: [".aaa-item>div:nth-child(1)"]
    },
    // ===================================================================================================
    "media queries": {
        input: `
        @media (max-width: 550px) {
    .aaa .bbb {
        width:50%;
    }
}
`,
        selectors: [".aaa .bbb"]
    },
    // ===================================================================================================
    supports: {
        input: `@media (min-width:1200px) and (max-width:1330px){.in{color:red}}@supports(-ms-ime-align:auto){.insideSupport{display:block}}.outside{color:#6e788b}`,
        selectors: [ ".in", ".insideSupport", ".outside"]
    },
    // ===================================================================================================
    commentStart: {
        input: `
        /* .comment */
        .aaa { color: red;}
        `,
        selectors: [".aaa"]
    },
    // ===================================================================================================
    commentEnd: {
        input: `
        .aaa { color: red;}
        /* .comment */
        `,
        selectors: [".aaa"]
    },
    // ===================================================================================================
    commentMiddle: {
        input: `
        .aaa { color: red;}
        /* .comment */
        .bbb { color: red;}
        `,
        selectors: [".aaa", ".bbb"]
    },
    // ===================================================================================================
    commentInRules: {
        input: `
        .aaa { color: red; /* something */}
        /* .comment */
        `,
        selectors: [".aaa"]
    },
    // ===================================================================================================
    inlineMediaKeyframe: {
        input: "@media (max-width:700px){.aaa{max-width:calc(100vw - 50px)}}@-webkit-keyframes slide-in{0%{-webkit-transform:translateX(400px);}}.bbb{margin:8px 0;position:relative}",
        selectors: [".aaa", ".bbb"]
    },
    // ===================================================================================================
    oKeyframes: {
        input: ".a1{color:red}@-o-keyframes f1{to{opacity:.9}}.a2{color:red2}@-webkit-keyframes f2{0%{opacity:0}to{opacity:1}}.a3{color:red3}@keyframes f3{0%{opacity:1}}.a4{color:red4}@-webkit-keyframes f4{0%{opacity:0}}.a5{color:red5}@keyframes f5{0%{opacity:1}}.a6{display:flex}",
        selectors: [".a1", ".a2", ".a3", ".a4", ".a5", ".a6"]
    }
};

// @keyframes nprogress-spinner{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}.App__heading{margin-bottom:20px;font-size:30px;text-align:center;font-weight:400;color:#163f5e}
describe("PostCSS Selector Extraction", () => {
    for (var name in inputs) {
        const t = inputs[name];
        test("postCSS parser " + name, async () => {
            const results = await postCssExtractor(t.input);
            expect(Array.from(results.values())).toEqual(t.selectors);
        });
    }
});

describe("Probe._extractSelectors", () => {
    for (var name in inputs) {
        const t = inputs[name];
        test("probe parser " + name, () => {
            var p = new Probe();
            p._extractSelectors("u", t.input);
            expect(Object.keys(p._unseenSelectors)).toEqual(t.selectors);
            expect(Object.keys(p._unseenSelectors)).toHaveLength(t.selectors.length);
        });
    }
});

describe("PostCSS vs Probe parsing", () => {
    var dataFolder = path.resolve(__dirname, "real_site_example");
    var files = fs.readdirSync(dataFolder);
    files.forEach(async file => {
        test("vs " + file, async () => {
            var srcpath = path.resolve(__dirname, "real_site_example", file);
            var cssSrc = fs.readFileSync(srcpath, { encoding: "utf-8" });
            var probeInstance = new Probe();
            probeInstance._extractSelectors("u", cssSrc);

            const probeSelectors = new Set();

            Object.keys(probeInstance._unseenSelectors).forEach((sel)=>{
                if (['}', '{'].includes(sel.substr(0,1))) {
                    expect(sel).toBe(sel.substr(1));
                }
                probeSelectors.add(sel);
            });

            const postcssSelectors = await postCssExtractor(cssSrc);

            let foundError = false;
            postcssSelectors.forEach(selector => {
                if (!probeSelectors.has(selector)) {
                    foundError = true;
                    console.error("PostCSS selector not seen in probe results", selector);
                }
            });
            probeSelectors.forEach(selector => {
                if (!postcssSelectors.has(selector)) {
                    foundError = true;
                    console.error("Probe selector not seen in postCSS results", selector);
                }
            });

            expect(postcssSelectors.size).toBe(probeSelectors.size);
            expect(foundError).toBeFalsy();
        });
    });
});

describe("Probe._extractSelectors", () => {
    test(" should do nothing with empty source", () => {
        var p = new Probe();
        p._addSelector = jest.fn();
        var spyExtractor = jest.spyOn(p, "_extractSelectors");
        p._extractSelectors("u", "");
        expect(spyExtractor).toHaveBeenCalledTimes(1);
        expect(p._addSelector).not.toHaveBeenCalled();
    });

    test("Probe._extractSelectors should do nothing with empty source", () => {
        var p = new Probe();
        p._addSelector = jest.fn();
        var spyExtractor = jest.spyOn(p, "_extractSelectors");
        p._extractSelectors("u", null);
        expect(spyExtractor).toHaveBeenCalledTimes(1);
        expect(p._addSelector).not.toHaveBeenCalled();
    });

    test("Probe._extractSelectors should do nothing with empty source", () => {
        var p = new Probe();
        p._addSelector = jest.fn();
        var spyExtractor = jest.spyOn(p, "_extractSelectors");
        p._extractSelectors("u", undefined);
        expect(spyExtractor).toHaveBeenCalledTimes(1);
        expect(p._addSelector).not.toHaveBeenCalled();
    });
});

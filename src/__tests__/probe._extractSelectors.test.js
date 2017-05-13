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
    // ==
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

describe("Probe Selector Extraction", () => {
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
            // fs.readFileSync(path.resolve(__dirname, "src/probe.js"), { encoding: "utf-8" });
            var p = new Probe();
            p._extractSelectors("u", cssSrc);

            const probeSelectors = new Set(Object.keys(p._unseenSelectors));
            const postcssSelectors = await postCssExtractor(cssSrc);

            postcssSelectors.forEach(selector => {
                if (!probeSelectors.has(selector)) {
                    console.log("PostCSS selector not seen in probe results", selector);
                }
            });
            probeSelectors.forEach(selector => {
                if (!postcssSelectors.has(selector)) {
                    console.log("Probe selector not seen in postCSS results", selector);
                }
            });

            expect(postcssSelectors.size).toBe(probeSelectors.size);
        });
    });
});

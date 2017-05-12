var Probe = require("../probe");
var fs = require("fs");
var path = require("path");
const postcss = require("postcss");

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
    }
};

// @keyframes nprogress-spinner{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}.App__heading{margin-bottom:20px;font-size:30px;text-align:center;font-weight:400;color:#163f5e}

describe("Probe Selector Extraction", () => {
    describe("parser", () => {
        for (var name in inputs) {
            const t = inputs[name];
            test(name, () => {
                var p = new Probe();
                p._addSelector = jest.fn();
                p._extractSelectors("u", t.input);

                t.selectors.forEach(item => {
                    expect(p._addSelector).toBeCalledWith("u", item, true);
                });
                expect(p._addSelector).toHaveBeenCalledTimes(t.selectors.length);
            });
        }
    });

    describe("compare to postCSS", () => {
        var dataFolder = path.resolve(__dirname, "real_site_example");
        var files = fs.readdirSync(dataFolder);
        files.forEach(file => {
            test(file, () => {
                var srcpath = path.resolve(__dirname, "real_site_example", file);
                var cssSrc = fs.readFileSync(srcpath, { encoding: "utf-8" });
                // fs.readFileSync(path.resolve(__dirname, "src/probe.js"), { encoding: "utf-8" });
                var p = new Probe();
                p._extractSelectors("u", cssSrc);
                const probeSelectors = new Set(Object.keys(p._unseenSelectors));
                return postcss().process(cssSrc, {}).then(function postCSSProcessResult(postCSSResult) {
                    const postCssSelectors = new Set();
                    postCSSResult.root.walkRules(function(rule) {
                        if (rule.parent && rule.parent.name && rule.parent.name.indexOf("keyframes") !== -1) {
                            return;
                        }
                        rule.selectors.forEach(item => {
                            var splits = item.split(":");
                            var selector = item;
                            if (splits[splits.length - 1] !== "first-child") {
                                selector = splits[0];
                            }
                            selector = selector.trim();
                            if (selector === "40%") {
                                // console.log(rule.parent.type);
                                console.log(rule.parent.name);
                            }
                            postCssSelectors.add(selector);
                        });
                    });

                    postCssSelectors.forEach(selector => {
                        if (!probeSelectors.has(selector)) {
                            console.log("PostCSS selector not seen in probe results", selector);
                        }
                    });
                    probeSelectors.forEach(selector => {
                        if (!postCssSelectors.has(selector)) {
                            console.log("Probe selector not seen in postCSS results", selector);
                        }
                    });
                    expect(probeSelectors.size).toBe(postCssSelectors.size);
                });
            });
        });

        // expect(Object.keys(p._allSelectors)).toHaveLength(4836);

        // const rules = new Set();

        // console.log(rules);
        // expect(rules.size).toBe(3955);
        // console.log(Object.keys(p._allSelectors));
    });
});

var Probe = require("../probe");

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

    describe("", () => { });
});

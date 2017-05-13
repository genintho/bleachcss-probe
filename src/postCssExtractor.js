const postcss = require("postcss");

module.exports = function(cssSrc) {
    return new Promise((resolve, reject) => {
        postcss().process(cssSrc, {}).then(function postCSSProcessResult(postCSSResult) {
            const selectors = new Set();
            postCSSResult.root.walkRules(function(rule) {
                if (rule.parent && rule.parent.name && rule.parent.name.indexOf("keyframes") !== -1) {
                    return;
                }
                rule.selectors.forEach(item => {
                    var splits = item.split(":");

                    var selector = item;
                    if (splits[splits.length - 1].indexOf("-child") === -1) {
                        selector = splits[0];
                    }
                    selector = selector.trim();
                    if (selector.length) {
                        selectors.add(selector);
                    }
                });
            });

            resolve(selectors);
        });
    });
};

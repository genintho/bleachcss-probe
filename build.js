// @ts-check

console.log("Start Build", new Date());
const fs = require("fs");
const UglifyJS = require("uglify-js");
const path = require("path");

let probeSource = fs.readFileSync(path.resolve(__dirname, "src/probe.js"), { encoding: "utf-8" });

// Find and replace a few value in the code source that make dev works much easier
const findAndReplace = [["PING_FREQUENCY = 500;", "PING_FREQUENCY = 5000;"], ["debug: true,", "debug: false,"]];

findAndReplace.forEach(item => {
    if (probeSource.indexOf(item[0]) === -1) {
        throw new Error('Can not find need "' + item[0] + '"');
    }
    probeSource = probeSource.replace(item[0], item[1]);
});

// Release node version
fs.writeFileSync(path.resolve(__dirname, "dist/node/probe.js"), probeSource);

// Browser Version
probeSource = probeSource.replace("module.exports = Probe;", "");
let browserSource = fs.readFileSync(path.resolve(__dirname, "src/browser.js"), { encoding: "utf-8" });

const source = browserSource.replace("/*@INSERT_CODE@*/", probeSource);
fs.writeFileSync(path.resolve(__dirname, "dist/browser/probe.js"), source);

const browserDistFile = path.resolve(__dirname, "dist/browser/probe-min.js");
let result = UglifyJS.minify(source, {
    outFileName: browserDistFile,
    screw_ie8: true,
    fromString: true,
    mangleProperties: {
        regex: /^_/
    }
});

fs.writeFileSync(browserDistFile, result.code);

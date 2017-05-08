// Singleton
(function (window) {
    // @ts-check

/**
 * @constructor
 */
function Probe() {
    this.options = {
        /**
         * Key generated by bleachcss.com
         * @type {string|null}
         */
        key: null,

        /**
         * Where the probe are being sent
         * @type {string}
         */
        url: "https://www.bleachcss.com/api/v1/probes/",

        /**
         * How many Selector will be used in each chunk tests
         * @type {number}
         */
        chunkSize: 250,

        /**
         * @type {boolean}
         */
        debug: false,

        /**
         * How frequently can the Probe check for results?
         * @type {number}
         */
        throttle: 200
    };

    /**
     * Store the URL of the CSS files we have fetched, usefull to avoid reprocessing the same files
     * @type {Array<string>}
     */
    this._cssFilesURLs = [];

    // Map of all the selectors we have found in the CSS files
    // Use following structure
    // "selector string": {
    //      files: [] -> array of files that contain the selector
    //      seen: true/false                -> indicate if the selector has been already seen
    //      fcn: document.getElementById    -> the method that will be call to detect usage of this selector
    //      parent: object                  -> point to the selector object, used to avoid checking dependent
    //                                          selector of something not in the DOM yet
    // }
    /**
     * @type {Object<string, *>}
     */
    this._allSelectors = {};

    /**
     * Map of the selector that have not been seend in the DOM yet
     * @type {Object<string, boolean>}
     */
    this._unseenSelectors = {};

    /**
     * List of selector that have been seen in the DOM but did not got send yet to the server.
     * @type {Array<string>}
     */
    this._buffer = [];

    /**
     * Timestamp of the last call to the function checking which selector are used.
     * @type {number}
     */
    this._timeMainLoopCall = 0;

    /**
     * Timestamp of the AJAX request flushing the buffer
     * @type {number}
     */
    this._timeBufferFlushCall = 0;

    /**
     * 
     */
    this._DOMObserver = null;
}

/**
 * Initialize the probe and start recording usage
 * @param {Object} userOptions User defined value for the options of the Probe
 */
Probe.prototype.start = function (userOptions) {
    // Copy over options
    for (var name in userOptions) {
        this.options[name] = userOptions[name];
    }

    if (!this.options.key) {
        throw Error("BleachCSS require an API key");
    }
    this._syncSelectors();
    this.resume();
};

/**
 * Stop observing DOM manipulation, but keep the state intact.
 */
Probe.prototype.stop = function () {
    if (this._DOMObserver) {
        this._DOMObserver.disconnect();
        this._DOMObserver = null;
    }
};

/**
 * Re-Start listening to DOM manipulation.
 */
Probe.prototype.resume = function () {
    var self = this;
    if (self._DOMObserver) {
        return;
    }
    self._DOMObserver = new MutationObserver(function (mutations) {
        self._log("Mutation", mutations);
        self._mainLoop();
    });
    self._DOMObserver.observe(document, { subtree: true, childList: true });
    self._mainLoop();
};

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
// PRIVATE
// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
Probe.prototype._log = function () {
    if (this.options.debug) {
        console.log.apply(console, arguments);
    }
};

/**
 * Master function controlling the detection of CSS
 */
Probe.prototype._mainLoop = function () {
    var self = this;
    var t1 = new Date().getTime();
    if (t1 - this._timeMainLoopCall < this.options.throttle) {
        return;
    }
    // console.profile("full detection");
    // console.time("full detection");
    this._timeMainLoopCall = t1;

    // New CSS files can be loaded dynamically.
    this._syncSelectors();

    for (var selector in self._allSelectors) {
        self._allSelectors[selector].checked = false;
    }
    this._checkSelectorsByChunk(Object.keys(this._unseenSelectors), function () {
        // console.profileEnd("full detection");
        // console.timeEnd("full detection");
        var t2 = new Date().getTime();
        var PING_FREQUENCY = 10000;
        if (t2 - self._timeBufferFlushCall > PING_FREQUENCY) {
            self._timeBufferFlushCall = t2;
            self._sendBuffer();
        }
    });
};

/**
 * Check 
 */
Probe.prototype._syncSelectors = function () {
    var self = this;
    var urls = this._processStyleSheets();
    this._downloadCSSFiles(urls, function (url, text) {
        self._extractSelectors(url, text);
        self._mainLoop();
    });
};

/**
 * 
 */
Probe.prototype._processStyleSheets = function () {
    /** @type {any} */
    var styleSheets = document.styleSheets;
    var urlsToLoad = [];
    for (var i = 0; i < styleSheets.length; i++) {
        /** @type {CSSStyleSheet} */
        var stylesheet = styleSheets[i];
        var href = stylesheet.href;
        var rules = stylesheet.cssRules;

        // if we have not processed the file already
        if (href && this._cssFilesURLs.indexOf(href) === -1) {
            // we find rule, it means we can process them directly
            if (rules) {
                this._cssFilesURLs.push(href);
                this._processCssRules(href, rules);
            } else {
                // we need to return the url, so the file can be processed
                urlsToLoad.push(href);
            }
        }
    }
    return urlsToLoad;
};

/**
 *  
 */
Probe.prototype._processCssRules = function (fileURL, rules) {
    for (var i = 0; i < rules.length; i++) {
        var selectorText = rules[i].selectorText;
        if (!selectorText) {
            return;
        }
        this._addSelector(fileURL, selectorText, true);
    }
};

/**
 * 
 * @param {string} source 
 */
Probe.prototype._extractSelectors = function (fileURL, source) {
    if (source === undefined) {
        return;
    }

    // Remove comments
    source = source.replace(new RegExp("(\\/\\*[\\s\\S]*?\\*\\/)", "gi"), "");

    // Remove Keyframe stuff
    var reg = new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})", "gi");
    source = source.replace(reg, "");

    // Handle regular selectors and media query selectors
    // Media Query capture = '((@media [\\s\\S]*?){([\\s\\S]*?}\\s*?)})';
    reg = new RegExp(
        "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})",
        "gi"
    );

    while (true) {
        var arr = reg.exec(source);
        if (arr === null) {
            break;
        }
        var selector = "";
        if (arr[2] === undefined) {
            selector = arr[5].split("\r\n").join("\n").trim();
        } else {
            selector = arr[2].split("\r\n").join("\n").trim();
        }

        // Never have more than a single line break in a row
        selector = selector.replace(/\n+/, "\n");

        //determine the type
        if (selector.indexOf("@media") !== -1) {
            this._extractSelectors(fileURL, arr[3] + "\n}");
        } else {
            this._addSelector(fileURL, selector, true);
        }
    }
};

/**
 * Create a record of a selector
 * @param {string} text 
 */
Probe.prototype._addSelector = function (url, text, existsInStyleSheet) {
    var self = this;
    text.split(",").forEach(function (selector) {
        var splits = selector.split(":");
        if (splits[splits.length - 1] !== "first-child") {
            selector = splits[0];
        }
        selector = selector.trim();
        if (selector.length) {
            if (!self._allSelectors[selector]) {
                self._allSelectors[selector] = {
                    files: [],
                    seen: false,
                    exists: false,
                    checked: false,
                    fcn: self._findChecker(selector),
                    parent: self._findParentSelector(selector)
                };
                self._unseenSelectors[selector] = true;
            }

            if (existsInStyleSheet) {
                self._allSelectors[selector].exists = true;
            }

            if (url && self._allSelectors[selector].files.indexOf(url) === -1) {
                self._allSelectors[selector].files.push(url);
            }
        }
    });
};

/**
 * 
 */
Probe.prototype._findParentSelector = function (selector) {
    // This find parent pattern with space seperated selector
    // @TODO extra suport
    // child >
    // attribute selector => blob[attribute=value]
    // multiple class selector => .red.square
    //      --> sort them?
    //      --> create a popularity sort?
    for (var i = selector.length; i; i--) {
        if (selector.charAt(i) == " ") {
            var parent = selector.substr(0, i);
            this._addSelector(null, parent, false);
            return parent;
        }
    }
    return null;
};

/**
 * Find used selectors from the list of unused selector we already have
 */
Probe.prototype._checkSelectorsByChunk = function (selectors, doneCb) {
    // console.time('detect');
    var ll = selectors.length;
    var limit = ll > this.options.chunkSize ? this.options.chunkSize : ll;

    for (var i = 0; i < limit; i++) {
        this._selectorCheck(selectors.pop());
    }
    // console.timeEnd('detect');

    // Nothing else to process, return
    if (selectors.length === 0) {
        return doneCb();
    }

    // Schedule an other batch of selector to process
    var self = this;
    setTimeout(function () {
        self._checkSelectorsByChunk(selectors, doneCb);
    }, 0);
};

/**
 * 
 */
Probe.prototype._selectorCheck = function (selectorText) {
    var a = this.__selectorCheck(selectorText);
    this._allSelectors[selectorText].checked = true;
    return a;
};

Probe.prototype.__selectorCheck = function (selectorText) {
    var item = this._allSelectors[selectorText];
    if (item.checked) {
        return item.seen;
    }

    if (item.seen) {
        return true;
    }

    if (item.parent) {
        // If we have not seen the parent, there is no way we can find the children
        if (!this._selectorCheck(item.parent)) {
            return false;
        }
    }

    if (item.fcn(selectorText)) {
        if (item.exists) {
            delete this._unseenSelectors[selectorText];
            this._buffer.push(selectorText);
        }
        item.seen = true;
        return true;
    }
    return false;
};

/**
 * Identify which function need to be used to check the existence of the element
 */
Probe.prototype._findChecker = function (selector) {
    if (/^#[^\s]+$/.test(selector)) {
        return this._fcnCheckByID;
    }

    if (/^\.[^\s]+$/.test(selector)) {
        return this._fcnCheckClass;
    }
    // @TODO get element by tag name
    return this._fcnCheckFallback;
};

/**
 * Detect if the ID is defined in the DOM
 * @param {string} selector
 * @return {boolean}
 */
Probe.prototype._fcnCheckByID = function (selector) {
    if (document.getElementById(selector.substr(1))) {
        return true;
    }
    return false;
};

/**
 * Detect if a class is defined in the DOM
 * @param {string} selector
 * @return {boolean}
 */
Probe.prototype._fcnCheckClass = function (selector) {
    if (document.getElementsByClassName(selector.substr(1)).length) {
        return true;
    }
    return false;
};

/**
 * Detect if 1 DOM element is matching the selector
 * @param {string} selector
 * @return {boolean}
 */
Probe.prototype._fcnCheckFallback = function (selector) {
    if (document.querySelector(selector)) {
        return true;
    }
    return false;
};

/**
 * Make a GET request to try to download the CSS files
 * @param {Array<string>} stylesheetURLs 
 * @param {function} callback What to do with the file content
 */
Probe.prototype._downloadCSSFiles = function (stylesheetURLs, callback) {
    var self = this;
    stylesheetURLs.forEach(function (url) {
        console.log("try to load", url);
        // Already fetched
        if (self._cssFilesURLs.indexOf(url) !== -1) {
            self._log("Stylesheets", url, " already downloaded");
            return;
        }
        self._cssFilesURLs.push(url);
        console.log("do load", url);
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function () {
            if (ajax.readyState === 4 && ajax.status === 200) {
                callback(url, ajax.responseText);
            }
        };

        // dont fetch that!
        var dataURl = "data:text/css";
        if (url.substr(0, dataURl.length) === dataURl) {
            return;
        }

        self._log("Download stylesheet at ", url);
        ajax.open("GET", url, true);
        ajax.send(null);
    });
};

/**
 * Send the results to the backend
 */
Probe.prototype._sendBuffer = function () {
    var self = this;
    var cloneBuffer = [].concat(this._buffer);
    // Reset the buffer so we do not send the same thing again and again
    this._buffer = [];
    this._log("buffer", cloneBuffer.length, cloneBuffer);
    if (cloneBuffer.length === 0) {
        return;
    }
    var data = {
        v: "0.1", // API_VERSION. Use by the server to know what to do with the payload
        k: this.options.key,
        f: {}
    };
    cloneBuffer.forEach(function (selector) {
        var files = self._allSelectors[selector].files;
        files.forEach(function (file) {
            if (!data.f[file]) {
                data.f[file] = [];
            }
            data.f[file].push(selector);
        });
    });

    var httpRequest = new XMLHttpRequest();
    httpRequest.open("POST", self.options.url + "?t=" + new Date().getTime());
    httpRequest.send(JSON.stringify(data));
};




    if (window.BleachCSS) {
        return;
    }

    window.BleachCSS = new Probe();
})(window);

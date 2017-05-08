// Singleton
(function (window) {
    /*@INSERT_CODE@*/

    if (window.BleachCSS) {
        return;
    }

    window.BleachCSS = new Probe();
})(window);

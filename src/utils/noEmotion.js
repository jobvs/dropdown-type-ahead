// tslint:disable
module.exports = {
    flush: () => {},
    hydrate: () => {},
    cx: () => {},
    merge: () => {},
    getRegisteredStyles: () => {},
    injectGlobal: () => undefined,
    keyframes: () => {},
    css: (arg) => {
        if(typeof arg === "string") {
            console.log("no-emotion, class", arg)
            return arg;
        }
        console.log("no-emotion"); return "";
    },
    sheet: () => {},
    caches: () => {}
};

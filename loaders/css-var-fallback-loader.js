const path = require('path');
const fs = require('fs');

module.exports = function(source) {
    this.cacheable();

    // get all variables in this file
    var cssvar_patt = /var\((--[^)]+)/g;
    var cssvars = [];
    var match;
    $NEXT_MATCH:
    while (match = cssvar_patt.exec(source)) {
        var cssvar = match[1];
        for (var i=0; i<cssvars.length; i++) {
            if (cssvars[i] === cssvar) continue $NEXT_MATCH;
        }
        cssvars.push(cssvar);
    }

    // do the replacements
    if (cssvars.length) {
        console.log('cssvars in ' + path.basename(this.resourcePath) + ': ', cssvars);

        var cssvarval = {};
        for (var i=0; i<cssvars.length; i++) {
            var cssvar = cssvars[i];
            cssvarval[cssvar] = undefined;
        }

        // find the values for the cssvar's
            // first check this css file
            // then check files in directory of this css file that have extension .default.css
            // then check parent dir of that and so on - stop when there are no more undefined values in object. if there are and have reached root, then throw error
        mergeToTarget(cssvarval, varsInRoot(source) || {});
        if (anyUndefined(cssvarval)) {
            var dirs = [path.dirname(this.resourcePath)];
            var rootpath = path.resolve();
            while (true) {
                var lastpath = dirs[dirs.length-1];
                if (lastpath === rootpath || lastpath === '') {
                    break;
                } else {
                    var nextpath = path.dirname(lastpath);
                    if (nextpath === lastpath || !nextpath) { // or empty string
                        break;
                    }
                    dirs.push(path.dirname(lastpath));
                }
            }

            // look for .default.css in these dirs
            console.log('search these dirs:', dirs);
            while (anyUndefined(cssvarval) && dirs.length) {
                var dirpath = dirs.shift();
                fs.readdirSync(dirpath).forEach(function(file) {
                    console.log('file:', file, 'dirpath:', dirpath);
                });
            }
        }
        var missing_varvals = anyUndefined(cssvarval);
        if (missing_varvals) throw new Error('No default value(s) found for CSS variable(s) of: "' + missing_varvals.join('", "') + '". Make sure you have a *.default.css file in same directory or parent directories of this CSS file. File: ' +  this.resourcePath);

        // do the replacements
        var cssname_cssvalue_patt = /([a-z\-]+)\s*?:([^;}]*?var\(--[^;}]+);/ig
        return source.replace(cssname_cssvalue_patt, function(match, cssname, cssvalue) {

            var cssfullvar_patt = /var\((--[^)]+)\)/g; // reinit as it has global flag, so i can reuse in case there are multiple cssvar's in this cssvalue
            var cssvalue_fallback = cssvalue.trim().replace(cssfullvar_patt, function(match, cssvar) {
                console.log('cssfullvar:', match, 'cssvar:', cssvar);
                return cssvarval[cssvar];
            });

            var cssfallback = cssname + ': ' + cssvalue_fallback + ';';
            console.log('cssorig:', match, 'cssname:', cssname, 'cssvalue:', cssvalue, 'cssfallback:', cssfallback);
            return cssfallback + ' ' + match;
        });
    } else {
        return source;
    }
}

function varsInRoot(source) {
    // soruce is string of a css file
    // this function looks for `:root {` and extracts all variables from there in a object/map
    // if it doesnt have :root it returns undefined
    let rootmatch = /:root[^{]*?\{[^}]+/i.exec(source);
    if (rootmatch) {
        var root = rootmatch[0];
        console.log('root:', root);
        let vars_vals_patt = /(--[^:\s]+)\s*?:([^;}]+)/g;
        let vars = {};
        var match;
        while (match = vars_vals_patt.exec(root)) {
            var cssvar = match[1];
            var cssvarval = match[2].trim();
            vars[cssvar] = cssvarval;
        }
        console.log('varsInRoot:', vars);
        return vars;
    }
}

function anyUndefined(obj) {
    // returns array of keys that are undefined. if all are NOT undefined, then returns false
    let undefineds = [];
    for (var key in obj) {
        if (!obj.hasOwnProperty(key)) continue; // skip loop if the property is from prototype
        if (obj[key] === undefined) {
            undefineds.push(key);
        }
    }
    return undefineds.length ? undefineds : false;
}

function mergeToTarget(target, source) {
    // by reference
    // if key is in target AND in source. target[key] value is to source[key] value
    for (var key in target) {
        if (!target.hasOwnProperty(key)) continue; // skip loop if the property is from prototype
        if (key in source) target[key] = source[key];
    }
}
const BRANCH = window.chrome ? window.chrome : window.browser;
const BRANCH_NAME = window.chrome ? 'chrome' : 'browser';

function promisifyLeaf(leaf, dotpath, ...args) {
    // if last argument is "ASYNC" then it turns it into a promise
    // console.log('polyfill\'s to dotpath:', dotpath, 'leaf:', leaf);
    if (args[args.length-1] === 'ASYNC') {
        args.pop();
        return new Promise(resolve => leaf(...args, resolve));
    } else {
        return leaf(...args);
    }
}

window.extension = new Proxy({}, {
    get: function(target, name) {
        console.log('name:', name, 'target:', target);
        // let leaf = BRANCH[name]; // unused
        // let dotpath = [BRANCH_NAME, name].join('.'); // unused
        if (!(name in target)) {
            target[name] = new Proxy({}, {
                get: function(subtarget, subname) {
                    // console.log('subname:', subname, 'subtarget:', subtarget);
                    let dotpath = [BRANCH_NAME, name, 'subname'].join('.');
                    let leaf = BRANCH[name][subname];
                    if (!(subname in subtarget)) {
                        if (subname.startsWith('on')) {
                            // on*** have another level deep on them
                            subtarget[subname] = new Proxy({}, {
                                get: function(subsubtarget, subsubname) {
                                    // console.log('subsubname:', subsubname, 'subsubtarget:', subsubtarget);
                                    let dotpath = [BRANCH_NAME, name, subname, subsubname].join('.');
                                    let leaf = BRANCH[name][subname][subsubname];
                                    if (!(subsubname in subsubtarget)) {
                                        subsubtarget[subsubname] = promisifyLeaf.bind(null, leaf, dotpath);
                                    }
                                    return subsubtarget[subsubname];
                                }
                            });
                        } else {
                            subtarget[subname] = promisifyLeaf.bind(null, leaf, dotpath);
                        }
                    }
                    return subtarget[subname];
                }
            });
        }
        return target[name];
    }
});
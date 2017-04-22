const BRANCH = window.chrome ? window.chrome : window.browser;

window.extension = new Proxy({}, {
    get: function(target, name, receiver) {
        // console.log('name:', name);
        if (!(name in target)) {
            target[name] = new Proxy({}, {
                get: function(subtarget, subname, subreceiver) {
                    // console.log('subname:', subname, 'subreceiver:', subreceiver);
                    let dotpath = name + '.' + subname;
                    if (!(subname in subtarget)) subtarget[dotpath] = BRANCH[name][subname];
                    return subtarget[dotpath];
                }
            });

        }
        return target[name];
    }
});
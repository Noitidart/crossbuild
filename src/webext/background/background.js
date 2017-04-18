const nub = {
	self: {
		id: '~ADDON_ID~',
		version: '~ADDON_VERSION~',
        // startup: string; enum[STARTUP, UPGRADE, DOWNGRADE, INSTALL] - startup_reason
	},
	stg: {
		// defaults - keys that present in here during `preinit` are fetched on startup and maintained whenever `storageCall` with `set` is done
            // "pref_" -
            // "mem_" - mem stands for extension specific "cookies"/"system memory"
            // "fs_" - filesystem-like stuff
		mem_lastversion: '-1' // '-1' indicates not installed - the "last installed version"
	}
}

console.error('nub.self:', nub.self);

console.log('Comm:', Comm);

const CommScope = {};
const gPortsComm = new Comm.server.webextports(CommScope); // eslint-disable-line no-unused-vars

async function init() {
    // generic init
    browser.browserAction.onClicked.addListener(btnClickHandler);

    // specific init

}

function btnClickHandler() {
    browser.tabs.create({url:'/app/app.html'});
}

CommScope.logit = function(what) { // eslint-disable-line no-unused-vars
    console.log('logit:', what);
}

init()
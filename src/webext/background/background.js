import '../common/extension-polyfill'

import { Server as PortsServer } from '../common/comm/webext-ports'
import { callInTemplate } from '../common/comm/comm'
import * as methods from './background.methods'

import { wait } from '../common/all'
import { getSelectedLocale } from '../common/background'


const nub = {
	self: {
		id: '~ADDON_ID~',
		version: '~ADDON_VERSION~',
        locales: ['en_US']
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

const gPortsComm = new PortsServer(methods, handlePortHandshake); // eslint-disable-line no-unused-vars
const callInPort = callInTemplate.bind(null, gPortsComm, null);
async function handlePortHandshake(portname) {
    await wait(5000);
    callInPort(portname, 'showAlert', 'hand shaken');
}

async function init() {
    // generic init
    extension.browserAction.onClicked.addListener(btnClickHandler);
    console.log('ok added click listener, will now get extlang');
    // specific init
    let extlang = await getSelectedLocale(nub.self.locales, 'addon_desc');
    console.log('extlang:', extlang);
}

function btnClickHandler() {
    extension.tabs.create({url:'/app/app.html'});
}

init()
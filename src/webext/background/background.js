import '../common/extension-polyfill'
import { Server as PortsServer } from '../common/comm/webext-ports'
import { callInTemplate } from '../common/comm/comm'

import { wait } from '../common/all'
import { getBrowser } from '../common/window'
import { getSelectedLocale } from '../common/background'

export const core = {
	self: {
		id: '~ADDON_ID~',
		version: '~ADDON_VERSION~',
        locales: ['en_US']
        // // startup: string; enum[STARTUP, UPGRADE, DOWNGRADE, INSTALL] - startup_reason
	},
    browser: getBrowser()
}

const store;

console.error('core.self:', core.self);

const gPortsComm = new PortsServer(exports, handlePortHandshake); // eslint-disable-line no-unused-vars
export const callInPort = callInTemplate.bind(null, gPortsComm, null);
export const callIn = (...args) => new Promise(resolve => exports['callIn' + args.shift()](...args, val=>resolve(val))); // must pass undefined for aArg if one not provided, due to my use of spread here. had to do this in case first arg is aMessageManagerOrTabId

async function handlePortHandshake(portname) {
    await wait(5000);
    callInPort(portname, 'showAlert', 'hand shaken');
}

async function init() {
    // generic init
    extension.browserAction.onClicked.addListener(btnClickHandler);
    console.log('ok added click listener, will now get extlang');
    // specific init

    await wait(5000);
    console.log('ok 5s up');

    let extlang = await getSelectedLocale(core.self.locales, 'addon_desc');
    console.log('extlang:', extlang);

    await wait(10000);
    core.mod = 'yep';
    console.log('ok modded core');
}

function btnClickHandler() {
    extension.tabs.create({url:'/app/app.html'});
}

export function logit(what) {
    console.log('logit:', what);
}

init()
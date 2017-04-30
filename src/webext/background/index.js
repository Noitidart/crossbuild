import '../common/extension-polyfill'
import { Server as PortsServer } from '../common/comm/webext-ports'
import { callInTemplate } from '../common/comm/comm'
import renderProxiedElement, { startProxyServer } from '../common/comm/redux'

import { wait } from '../common/all'

import BackgroundElement from './BackgroundElement'

const gPortsComm = new PortsServer(exports, handlePortHandshake); // eslint-disable-line no-unused-vars
export const callInPort = callInTemplate.bind(null, gPortsComm, null);
export const callIn = (...args) => new Promise(resolve => exports['callIn' + args.shift()](...args, val=>resolve(val))); // must pass undefined for aArg if one not provided, due to my use of spread here. had to do this in case first arg is aMessageManagerOrTabId

async function handlePortHandshake(portname) {
    await wait(5000);
    callInPort(portname, 'showAlert', 'hand shaken');
}

export function logit(what) {
    console.log('logit:', what);
}

startReduxServer();

renderProxiedElement(BackgroundElement, document.getElementById('root'), [
    'browser_action',
    'core'
]);
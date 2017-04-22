import { Client as FrameClient } from '../common/comm/frame'
import { callInTemplate } from '../common/comm/comm'
import * as methods from './appframe.methods'

const gParentFrameComm = new FrameClient(methods, handleHandshake);
const callInBackground = callInTemplate.bind(null, gParentFrameComm, 'callInBackground', null);
// let callIn = (...args) => new Promise(resolve => window['callIn' + args.shift()](...args, val=>resolve(val))); // must pass undefined for aArg if one not provided, due to my use of spread here. had to do this in case first arg is aMessageManagerOrTabId

function component () {
  var element = document.createElement('div');

  /* lodash is required for the next line to work */
  element.innerHTML = ['hi from appframe'].join(' ');

  return element;
}

function handleHandshake() {
    console.log('handhsake in client side is done');
    callInBackground('logit', 'logging it from appframe!');
}

document.body.appendChild(component());
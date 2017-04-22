import '../common/extension-polyfill'

import { Client as PortsClient } from '../common/comm/webext-ports'
import { Server as FrameServer } from '../common/comm/frame' // eslint-disable-line no-unused-vars
import { callInTemplate } from '../common/comm/comm'
import * as methods from './app.methods'

import './app.css'

const gBgComm = new PortsClient(methods, 'app');
const callInBackground = callInTemplate.bind(null, gBgComm, null, null);
methods.callInBackground = callInBackground; // so gFrameComm can call it
// let callIn = (...args) => new Promise(resolve => window['callIn' + args.shift()](...args, val=>resolve(val))); // must pass undefined for aArg if one not provided, due to my use of spread here. had to do this in case first arg is aMessageManagerOrTabId

function component () {
  const element = document.createElement('div');

  /* lodash is required for the next line to work */
  element.innerHTML = ['Hello','webpack'].join(' ');

  const iframe = document.createElement('iframe');
  iframe.addEventListener('load', handleChildframeLoad, false);
  iframe.src = 'appframe.html';

  document.body.appendChild(iframe);

  return element;
}

function handleChildframeLoad(e) {
  let frame = e.target;
  frame.removeEventListener('load', handleChildframeLoad, false);
  console.log('childframe loaded!');
  const gFrameComm = new FrameServer(frame.contentWindow, methods, ()=>console.log('handshake in server side is done')); // eslint-disable-line no-unused-vars
}

callInBackground('logit', 'hiiiii');

document.body.appendChild(component());

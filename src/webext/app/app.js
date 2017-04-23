import '../common/extension-polyfill'

import { Client as PortsClient } from '../common/comm/webext-ports'
import { Server as FrameServer } from '../common/comm/frame' // eslint-disable-line no-unused-vars
import { callInTemplate } from '../common/comm/comm'
import * as methods from './app.methods'

import './app.css'

const gBgComm = new PortsClient(methods, 'app', ()=>alert('client side handshake done'));
const callInBackground = methods.callInBackground = callInTemplate.bind(null, gBgComm, null, null); // add to methods so so gFrameComm can call it
// let callIn = (...args) => new Promise(resolve => window['callIn' + args.shift()](...args, val=>resolve(val))); // must pass undefined for aArg if one not provided, due to my use of spread here. had to do this in case first arg is aMessageManagerOrTabId

let gFrameComm;
let callInFrame;

function component () {
  const element = document.createElement('div');

  /* lodash is required for the next line to work */
  element.innerHTML = ['Hello','webpack'].join(' ');

  const iframe = document.createElement('iframe');
  iframe.addEventListener('load', handleChildframeLoad, false); // cannot use DOMContentLoaded as that is a document event - http://stackoverflow.com/a/24621957/1828637
  iframe.src = 'appframe.html';
  // const gFrameComm = new FrameServer(iframe.contentWindow, methods, ()=>console.log('handshake in server side is done')); // eslint-disable-line no-unused-vars // does not work MUST wait for load

  document.body.appendChild(iframe);

  return element;
}

function handleChildframeLoad(e) {
  let frame = e.target;
  frame.removeEventListener('load', handleChildframeLoad, false);
  console.log('childframe loaded!');
  gFrameComm = new FrameServer(frame.contentWindow, methods, ()=>console.log('Frame.Server handshake in server side is done')); // eslint-disable-line no-unused-vars
  callInFrame = methods.callInFrame = callInTemplate.bind(null, gFrameComm, null, null); // i add it to methods so background can call into frame
  callInFrame('text', 'rawwwwwwwr');
}

callInBackground('logit', 'hiiiii');

document.body.appendChild(component());

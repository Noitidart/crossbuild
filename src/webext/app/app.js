import './app.css'

const CommScope = this;
console.log('app CommScope:'. CommScope);

const gBgComm = new Comm.Comm.client.webextports(CommScope, 'tab');
const callInBackground = Comm.Comm.callInX2.bind(null, gBgComm, null, null);
// let callIn = (...args) => new Promise(resolve => window['callIn' + args.shift()](...args, val=>resolve(val))); // must pass undefined for aArg if one not provided, due to my use of spread here. had to do this in case first arg is aMessageManagerOrTabId

function component () {
  var element = document.createElement('div');

  /* lodash is required for the next line to work */
  element.innerHTML = ['Hello','webpack'].join(' ');

  return element;
}

callInBackground('logit', 'hiiiii');

document.body.appendChild(component());

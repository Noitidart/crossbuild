/* global extension:false */

import Base from './comm'

/*
RULES
* Handshake is multi triggered
* Handshake triggers every time a port connects. It first triggers server side, then triggers client side.
* Server onHandshake arguments - (portname) so can do in onHandshake, callIn(portname, ...)
* Client onHandshake arguments - nothing
* Earliest time can do callIn
  * Server - after port connection is made, so onHandshake
  * Client - soon after new Client() - this will trigger before onHandshake obviously
* Can do new PortsServer right away in background.js
* Can do new PortsClient right away in client
* PortsServer should only be done from backgrond.js - i didnt think of the implications of not doing it in background.js
*/

export class Server extends Base {
    // use from backgrond.js
    commname = 'WebextPorts.Server'
    ports = {}
    cantransfer = false
    getControllerReportProgress(payload) {
        let { cbid, portname } = payload;
        return this.reportProgress.bind({ THIS:this, cbid, portname });
    }
    getControllerSendMessageArgs(payload, val) {
        let { portname, cbid } = payload;
        return [ portname, cbid, val ];
    }
    getSendMessageArgs(...args) {
        console.log(`Comm.${this.commname} - in getSendMessageArgs, args:`, args);
        let [, aMethod, aArg, aCallback] = args;
        return { aMethod, aArg, aCallback };
    }
    doSendMessageMethod(aTransfers, payload, ...args) {
        // webext ports does not support transfering
        let [ portname ] = args;
        this.ports[portname].postMessage(payload);
    }
    reportProgress(aProgressArg) {
        let { THIS, cbid, portname } = this;
        aProgressArg.__PROGRESS = 1;
        THIS.sendMessage(portname, cbid, aProgressArg);
    }
    unregister() {
        super.unregister();

        extension.runtime.onConnect.removeListener(this.connector);

        for (let [, port] of Object.entries(this.ports)) {
            port.disconnect();
        }
    }
    getPort(aPortName) {
        return this.ports[aPortName];
    }
    connector = aPort => {
        console.log(`Comm.${this.commname} - incoming connect request, aPortName:`, aPort.name, 'aPort:', aPort);
        let portname = aPort.name;
        this.ports[portname] = aPort;
        aPort.onMessage.addListener(this.controller);
        aPort.onDisconnect.addListener(this.disconnector.bind(null, portname));
        this.sendMessage(portname, '__HANDSHAKE__');
        if (this.onHandshake) this.onHandshake(portname);
    }
    disconnector = aPortName => {
        console.log(`Comm.${this.commname} - incoming disconnect request, aPortName:`, aPortName);
        let port = this.ports[aPortName];
        port.onMessage.removeListener(this.controller); // probably not needed, as it was disconnected
        delete this.ports[aPortName];
    }
    constructor(aMethods, onHandshake) {
        super(null, aMethods, onHandshake);

        if (onHandshake) this.onHandshake = onHandshake // because can fire multiple times i override what the super does

        extension.runtime.onConnect.addListener(this.connector);
    }
}

export class Client extends Base {
    // use in any non-background.js
    commname = 'WebextPorts.Client.' // suffix added in constructor
    cantransfer = false
    groupname = null
    portname = null // must be unique
    // target = port
    doSendMessageMethod(aTransfers, payload) {
        // webext ports does not support transfering
        payload.portname = this.portname;
        this.target.postMessage(payload);
    }
    unregister() {
        super.unregister();
        this.target.onMessage.removeListener(this.listener); // i probably dont need this as I do `port.disconnect` on next line
        this.target.disconnect();
    }
    getPort() {
        return this.target;
    }
    disconnector() {
        // TODO: untested, i couldnt figure out how to get this to trigger. and i need to try to do a `port.disconnect()` from background.js
        console.log(`Comm.${this.commname} - incoming disconnect request`);
        this.target.onDisconnect.removeListener(this.disconnector);
        if(!this.isunregistered) this.unregister(); // if .disconnector triggered by this.unregister being called first, this second call here on this line will fail as in base unregister can only be called once otherwise it throws
    }
    constructor(aMethods, aPortGroupName='general', onHandshake=null) {
        // aPortGroupName is so server can broadcast a message to certain group
        let groupname = aPortGroupName;
        let portname = groupname + '-' + Date.now() + '-' + Math.random(); // portname must be unique across all ports

        let port = extension.runtime.connect({ name:portname });
        super(port, aMethods, onHandshake); // sets this.target = port

        this.commname += portname;
        this.portname = portname;
        this.groupname = groupname;

        this.target.onMessage.addListener(this.controller);
        this.target.onDisconnect.addListener(this.disconnector);
    }
}

/* global extension:false */

import Base from './comm'

/*
RULES
* Handshake is multi triggered
* Handshake triggers every time a port connects. It first triggers server side, then triggers client side.
* Server onHandshake arguments - (port) so can do in onHandshake, callIn(port, ...)
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
    // base config
    commname = 'WebextPorts.Server'
    cantransfer = false
    multiclient= true
    doSendMessageMethod(aTransfers, payload, aPortOrPortId) { // this defines what `aClientId` should be in crossfile-link183848 - so this defines what "...restargs" should be "a port OR a port id"
        // aClientId is aPortOrPortId
        // webext ports does not support transfering
        let port = typeof aPortOrPortId === 'object' ? aPortOrPortId : this.ports[aPortOrPortId];
        port.postMessage(payload);
    }
    getControllerSendMessageArgs(val, payload, message, port/*, sendResponse*/) {
        let { cbid } = payload;
        return [ port, cbid, val ];
    }
    getControllerReportProgress(payload, port/*, sendResponse*/) {
        let { cbid } = payload;
        return this.reportProgress.bind({ THIS:this, cbid, port });
    }
    reportProgress(aProgressArg) {
        let { THIS, cbid, port } = this;
        aProgressArg.__PROGRESS = 1;
        THIS.sendMessage(port, cbid, aProgressArg);
    }
    unregister() {
        super.unregister();

        extension.runtime.onConnect.removeListener(this.connector);

        for (let [, port] of Object.entries(this.ports)) {
            port.disconnect();
        }
    }
    constructor(aMethods, onHandshake) {
        super(null, aMethods, onHandshake);

        if (onHandshake) this.onHandshake = onHandshake // because can fire multiple times i override what the super does

        extension.runtime.onConnect.addListener(this.connector);
    }
    // custom config - specific to this class
    ports = {} // key is portid
    nextportid = 1
    static portid_groupname_splitter = '~~'
    broadcastMessage(aPortGroupName, aMethod, aArg, aCallback) {
        // aCallback triggers for each port
        for (let [portid, port] of Object.entries(this.ports)) {
            if (portid.startsWith(aPortGroupName + Server.portid_groupname_splitter)) {
                this.sendMessage(port, aMethod, aArg, aCallback);
            }
        }
    }
    getPort(aPortId) {
        return this.ports[aPortId];
    }
    getPortId(aPort) {
        for (let [portid, port] of Object.entries(this.ports)) {
            if (port === aPort) return portid;
        }
        console.error('portid for aPort not found!', 'aPort:', aPort, 'this.ports:', this.ports);
        throw new Error('portid for aPort not found!');
    }
    connector = aPort => {
        console.log(`Comm.${this.commname} - incoming connect request, aPortGroupName:`, aPort.name, 'aPort:', aPort);
        let groupname = aPort.name;
        let portid = groupname + Server.portid_groupname_splitter + this.nextportid++;
        this.ports[portid] = aPort;
        aPort.onMessage.addListener(this.controller);
        aPort.onDisconnect.addListener(this.disconnector);
        this.sendMessage(portid, '__HANDSHAKE__');
        if (this.onHandshake) this.onHandshake(aPort);
    }
    disconnector = aPort => {
        console.log(`Comm.${this.commname} - incoming disconnect request, static aPort:`, aPort, 'portid:', this.getPortId(aPort));
        let portid = this.getPortId(aPort);
        aPort.onMessage.removeListener(this.controller); // probably not needed, as it was disconnected
        delete this.ports[portid];
    }
}

export class Client extends Base {
    // use in any non-background.js
    // base config
    commname = 'WebextPorts.Client.' // suffix added in constructor
    cantransfer = false
    // target = port // set in constructore
    unregister() {
        super.unregister();
        this.target.onMessage.removeListener(this.listener); // i probably dont need this as I do `port.disconnect` on next line
        this.target.disconnect();
    }
    constructor(aMethods, aPortGroupName='general', onHandshake=null) {
        // aPortGroupName is so server can broadcast a message to certain group

        let port = extension.runtime.connect({ name:aPortGroupName });
        super(port, aMethods, onHandshake); // sets this.target = port

        this.commname += Math.random();
        this.groupname = aPortGroupName;

        this.target.onMessage.addListener(this.controller);
        this.target.onDisconnect.addListener(this.disconnector);
    }
    // custom config - specific to this class
    groupname = null
    getPort() {
        return this.target;
    }
    disconnector() {
        // TODO: untested, i couldnt figure out how to get this to trigger. and i need to try to do a `port.disconnect()` from background.js
        console.log(`Comm.${this.commname} - incoming disconnect request`);
        this.target.onDisconnect.removeListener(this.disconnector);
        if(!this.isunregistered) this.unregister(); // if .disconnector triggered by this.unregister being called first, this second call here on this line will fail as in base unregister can only be called once otherwise it throws
    }
}

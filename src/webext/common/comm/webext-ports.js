/* global extension:false */

import Base from './comm'

/*
RULES
Handshake triggers first server side
*/

export class Server extends Base {
    // use from backgrond.js
    commname = 'WebextPorts.Server'
    ports = {}
    cantransfer = false
    sendMessage(aPortName, aMethod, aArg, aCallback) {

    }
    unregister() {
        super();

        extension.runtime.onConnect.removeListener(this.connector);

        for (let [portname, port] of Object.entries(this.ports)) {
            port.disconnect();
        }
    }
    getPort(aPortName) {
        return this.ports[aPortName];
    }
    connector(aPort) {
        console.log(`Comm.${this.commname} - incoming connect request, aPortName:`, aPort.name, 'aPort:', aPort);
        ports[aPort.name] = aPort;
        aPort.onMessage.addListener(this.listener);
        aPort.onDisconnect.addListener(this.disconnector.bind(null, aPort.name));
        this.sendMessage(aPort.name, '__HANDSHAKE__');
        if (this.onHandshake) this.onHandshake();
    }
    disconnector(aPortName) {
        console.log(`Comm.${this.commname} - incoming disconnect request, aPortName:`, aPortName);
        let port = ports[aPortName];
        port.onMessage.removeListener(this.listenerPort); // probably not needed, as it was disconnected
        delete ports[aPortName];
    }
    constructor(aTarget, aMethods, onHandshake) {
        super(aTarget, aMethods, onHandshake);

        extension.runtime.onConnect.addListener(this.connector);
    }
}

export class Client extends Base {
    // use in any non-background.js
    commname = 'WebextPorts.Client.' // suffix added in constructor
    cantransfer = false
    groupname = null
    portname = null // must be unique
    port = null
    unregister() {
        super();
        port.onMessage.removeListener(this.listener); // i probably dont need this as I do `port.disconnect` on next line
        port.disconnect();
    }
    listenerGetPayload(payload) {
        return payload;
    }
    getPort() {
        return this.port;
    }
    disconnector() {
        // TODO: untested, i couldnt figure out how to get this to trigger. and i need to try to do a `port.disconnect()` from background.js
        console.log(`Comm.${this.commname} - incoming disconnect request`);
        port.onDisconnect.removeListener(this.disconnector);
        this.unregister();
    }
    constructor(aTarget, aMethods, aPortGroupName='general', onHandshake=null) {
        // aPortGroupName is so server can broadcast a message to certain group
        this.groupname = aPortGroupName;
        this.portname = this.groupname + '-' + Date.now() + '-' + Math.random();

        this.commname += this.portname;

        this.port = extension.runtime.connect({ name:this.portname });
        super(this.port, aMethods, onHandshake);
        this.port.onMessage.addListener(this.listener);
        this.port.onDisconnect.addListener(this.disconnector);
    }
}

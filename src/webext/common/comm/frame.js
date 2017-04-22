import Base, { isObject } from './comm'

/*
RULES
Handshake triggers first client side
*/

export class Server extends Base {
    // use from backgrond.js
    commname = 'Frame.Server'
    port = null
    framewindow = null
    cantransfer = true
    listenerGetPayload(e) {
        return e.data;
    }
    unregister() {
        super();
        framewindow = null;
    }
    constructor(aTarget, aMethods, aFrameWindow, onHandshake) {
        super(aTarget, aMethods, onHandshake);
        let port2;
        ({port2, port1:port} = new MessageChannel());

        framewindow = aFrameWindow;
        framewindow.postMessage({
            topic: '__PRIVATE_HANDSHAKE__',
            port2: port2
        }, '*', [ports.port2]);
    }
}

export class Client extends Base {
    // use from backgrond.js
    commname = 'Frame.Client'
    port = null
    cantransfer = true
    listenerGetPayload(e) {
        return e.data;
    }
    unregister() {
        super();
        window.removeEventListener('message', this.winListener, false); // in case urnegister while it is still attached
    }
    winListener(e) {
        var data = e.data;
        console.log(`Comm.${this.commname} - incoming window message, data:`, data);
        if (data && isObject(data)) {
            switch (data.topic) {
                case '__PRIVATE_HANDSHAKE__':
                    console.log(`Comm.${this.commname} - in handshake`);
                    window.removeEventListener('message', this.winListener, false);
                    port = data.port2;
                    port.onmessage = this.listener;
                    this.sendMessage('__HANDSHAKE__');
                    if (this.onHandshake) this.onHandshake();
                // no default
            }
        }
    }
    constructor() {
        super();

        window.addEventListener('message', this.winListener, false);
    }
}
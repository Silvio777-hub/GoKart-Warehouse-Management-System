import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { map } from 'rxjs/operators';
import * as SockJS from 'sockjs-client';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    private rxStomp: RxStomp;

    constructor() {
        this.rxStomp = new RxStomp();
        this.rxStomp.configure({
            // connection string
            brokerURL: 'ws://localhost:8081/ws',

            // Fallback to SockJS if native WS fails
            webSocketFactory: () => new SockJS('http://localhost:8081/ws'),

            // Debugging
            debug: (msg: string) => {
                console.log(new Date(), msg);
            },

            // Auto reconnect
            reconnectDelay: 200,
        });

        this.rxStomp.activate();
    }

    watch(topic: string) {
        return this.rxStomp.watch(topic).pipe(map(result => JSON.parse(result.body)));
    }
}

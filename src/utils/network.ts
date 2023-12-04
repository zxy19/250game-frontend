import { host } from "@/config/net";
import type { IPlayer } from "@/interfaces/game";

export class Room {
    ws?: WebSocket
    roomId: number
    player: IPlayer
    isOpen: boolean
    cb: (data: { type: string, [key: string]: any }) => void
    send(msg: string | Object) {
        if (this.ws) {
            let toSend: string;
            if (typeof msg != 'string') {
                (msg as any)["id"] = this.player.id;
                toSend = JSON.stringify(msg);
            } else {
                toSend = msg;
            }
            this.ws.send(toSend);
        }
    }
    reconnect(force?: boolean) {
        if(this.isOpen && !force) return;
        this.isOpen = true;
        if (this.ws) {
            try { this.ws.close(); } catch (e) { }
        }
        if (location.hostname == "127.0.0.1" || location.hostname == "localhost") {
            this.ws = new WebSocket(`ws://127.0.0.1:19981/`);
        } else this.ws = new WebSocket(host);
        this.ws.onopen = () => {
            this.send({
                type: 'reg',
                id: this.player.id,
                group: this.roomId,
                name: this.player.name
            });
        }
        let hasError = false;
        this.ws.onclose = this.ws.onerror = () => {
            if(hasError) return;
            hasError = true;
            this.ws!.onclose = this.ws!.onerror = null;
            this.cb({
                type: 'error',
                msg: '与服务器的连接断开，正在重连...'
            })
            setTimeout(() => {
                this.isOpen = false;
                this.reconnect();
            }, 1000);
        }
        this.ws.onmessage = (e) => {
            let data = JSON.parse(e.data);
            this.cb(data);
        }
    }
    constructor(id: number, player: IPlayer, cb: (data: { type: string, [key: string]: any }) => void) {
        this.roomId = id;
        this.player = player;
        this.cb = cb;
        this.isOpen = false;
        this.reconnect();
    }
}
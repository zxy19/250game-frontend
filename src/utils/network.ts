import type { IPlayer } from "@/interfaces/game";

export class Room {
    ws?: WebSocket
    roomId: number
    player: IPlayer
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
    reconnect() {
        if (this.ws) {
            try { this.ws.close(); } catch (e) { }
        }
        if (location.hostname == "127.0.0.1" || location.hostname == "localhost") {
            this.ws = new WebSocket(`ws://127.0.0.1:19981/`);
        } else this.ws = new WebSocket(`wss://250.xypp.cc:19981/`);
        this.ws.onopen = () => {
            this.send({
                type: 'reg',
                id: this.player.id,
                group: this.roomId,
                name: this.player.name
            });
        }
        this.ws.onclose = this.ws.onerror = () => {
            this.ws!.onclose = this.ws!.onerror = null;
            this.cb({
                type: 'error',
                msg: '与服务器的连接断开，正在重连...'
            })
            setTimeout(() => {
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
        this.reconnect();
    }
}
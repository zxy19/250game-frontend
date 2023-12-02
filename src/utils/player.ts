import type { IGame, IPlayer } from "@/interfaces/game.ts";
import { createDeck } from "@/utils/cardUtils";
import { v4 as uuidv4 } from 'uuid';

export function isPlayer(game:IGame,player:IPlayer):boolean{
    for(let i=0;i<game.players.length;i++){
        if(game.players[i].id == player.id){
            return game.stage.playerIndex==i;
        }
    }
    return false;
}
export function id2index(game:IGame,id:string):number{
    for(let i=0;i<game.players.length;i++){
        if(game.players[i].id == id){
            return i;
        }
    }
    return -1;
}
export function internalId2index(game:IGame,id:number):number{
    for(let i=0;i<game.players.length;i++){
        if(game.players[i].internalId == id){
            return i;
        }
    }
    return -1;
}
export function createPlayer():IPlayer{
    let id = uuidv4();
    return {
        id,
        name: "玩家"+(id.split('-')[0] as string),
        score: 0,
        mark: {},
        internalId: 0,
        stored:createDeck("",[]),
        hand:createDeck("",[]),
        ready:false,
        profile: {}
    }
}
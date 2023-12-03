import type { IDeck, IGame, IPlayer } from '@/interfaces/game';
import { createDeck } from '@/utils/cardUtils';
import { createPlayer } from '@/utils/player';
import { defineStore } from 'pinia';
export const useGameStore = defineStore('GameStore', {
    // state
    state: () => {
        let _: {
            game:IGame,
            self: IPlayer,
            viewDeck?: IDeck
        } = {
            self:createPlayer(),
            game:{
                players: [],
                stage: {
                  round: -1,
                  playerIndex: 0,
                  operate: 0,
                  data: {},
                },
                pinnedCard: [],
                lastOperatedCards: createDeck("", [{ id: "JOK", color: 2 }, { id: "JOK", color: 2 }, { id: "JOK", color: 2 }]),
                lastOperate: "等待玩家进入...",
                allCards: createDeck("all", []),
                allShown: createDeck("all", []),
                config: {
              
                }
              }
        };
        return _;
    },

    // actions
    actions: {}
});

export interface ICard {
    id: string,
    color: number,
    selected?: boolean,
    real?: ICard
}
export interface IDeck {
    id: number,
    name: string,
    cards: ICard[],
    noSort?: boolean
}
export interface IPlayer {
    id: string,
    internalId: number,
    name: string,
    score?: number,
    hand?: IDeck,
    stored?: IDeck,
    ready?: boolean,
    offline?: boolean,
    mark: Record<string, number>
    profile: Record<string, string>
}
export enum GAME_OPERATES {
    ROUND_START = 1,
    PUTCARD = 2,
    DRAWCARD = 3,
    DISCARD = 4,
    WAIT_CHA = 5,
    DO_CHA = 6,
    CALC = 7,
    AFTER_CHA = 8,
    SCORE=9
}
export interface IGame {
    stage: {
        round: number,
        playerIndex: number,
        operate: number,
        data: Record<string, any>
    },
    pinnedCard: ICard[],
    lastDiscard?: ICard,
    lastOperate: string,
    lastOperatedCards: IDeck,
    allShown: IDeck,
    players: IPlayer[],
    allCards: IDeck,
    config: Record<string, any>
}
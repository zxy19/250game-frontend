import { CARDS, CARD_COUNT, CARD_SORT } from "../config/cards";
import type { ICard, IDeck } from "../interfaces/game";

export function _sort(deck: IDeck) {
  deck.cards.sort((a, b) => {
    return CARD_SORT[a.id] - CARD_SORT[b.id];
  });
}
/**
 * 获取所有的卡
 * @returns 包含所有卡的数组
 */
export function getDeckAllCards(): ICard[] {
  let res: ICard[] = [];
  CARDS.forEach((card) => {
    for (let i = 0; i < CARD_COUNT[card]; i++) {
      let tmp: ICard = {
        id: card,
        color: i,
      };
      res.push(tmp);
    }
  });
  return res;
}

/**
 * 取出卡组中的卡。如果失败，则抛出错误并回滚操作。
 * @param deck 卡组
 * @param cards 要取出的卡片
 */
export function pickCardOrFail(deck: IDeck, cards: ICard[]) {
  let res = pickCard(deck, cards);
  if (res.length != cards.length) {
    addCards(deck, res);
    throw new Error("无法取出指定的卡");
  }
}
/**
 * 取出卡组中的卡。如果失败，则跳过。
 * @param deck 卡组
 * @param cards 要取出的卡片
 * @returns 成功取出的卡片
 */
export function pickCard(deck: IDeck, cards: ICard[]): ICard[] {
  let res: ICard[] = [];
  //可以优化
  cards.forEach((card) => {
    let idx = deck.cards.findIndex((c) => {
      return c.id == card.id && c.color == card.color;
    })
    if (idx != -1) {
      deck.cards.splice(idx, 1);
      res.push(card);
    }
  });
  return res;
}
/**
 * 随机抽取一张卡
 * @param deck 卡组
 * @returns 
 */
export function pickRandom(deck: IDeck): ICard {
  let index = Math.floor(Math.random() * deck.cards.length);
  let ret = deck.cards[index];
  deck.cards.splice(index, 1);
  return ret;
}
/**
 * 向卡组添加卡片
 * @param deck 要处理的卡组
 * @param card 要添加的卡片数组
 */
export function addCards(deck: IDeck, card: ICard[]) {
  card = card.map((c) => {
    c.selected = false;
    return c;
  })
  deck.cards = deck.cards.concat(card);
  if (!deck.noSort)
    _sort(deck);
}
export function toCleanCard(card: ICard) {
  return {
    id: card.id,
    color: card.color
  }
}
/**
 * 创建卡组
 * @param name 卡组名字
 * @param cards 卡牌
 * @returns 卡组
 */
export function createDeck(name: string, cards: ICard[], noSort?: boolean): IDeck {
  let res: IDeck = {
    id: Math.random(),
    name: name,
    cards: cards,
    noSort: noSort
  };
  if (!res.noSort)
    _sort(res);
  return res;
}

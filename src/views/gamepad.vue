<template>
  <main :style="{ backgroundImage: `url(${deskBackground})` }">
    <div :class="['msg-box', { hide: msgs.length == 0 }]">
      <div class="title">消息</div>
      <div v-for="msg in msgs" class="msg"><b>{{ msg.from }}:</b>{{ msg.msg }}</div>
    </div>

    <profileVue @change="showProfileBox = false; updateProfile(profile.webProfile);" v-if="showProfileBox"
      class="profile-box">
    </profileVue>
    <div :class="['float-overlap', { show: optSelections.length && optPromiseCB }]">
      <div>
        <h2>请从下方选项中选择</h2><br><br><br>
      </div>
      <div class="opt">
        <button @click="optPromiseCB!(opt.value)" v-for="opt in optSelections" class="btn" style="margin: 5px;">
          {{ opt.title }}
        </button>
      </div>
    </div>
    <div :class="['float-overlap', { show: (toSelectCards && toSelectCards.cards.length) }]">
      <div class="selectCards" v-if="toSelectCards && toSelectCards.cards.length">
        <div>
          <h2>{{ toSelectCards.name }}</h2>
        </div>
        <Deck :deck="toSelectCards" @select_change="makeSelect" :selectable="!noSelect" style="height: 170px;" />
        <div>
          <button @click="selectDone" class="btn" style="width: 90px;">
            确定
          </button>
        </div>
      </div>
    </div>
    <div :class="['float-overlap', { show: (!showGameOver && game.stage.operate == GAME_OPERATES.SCORE) }]">
      <h2>本局小结</h2>
      <table class="score-table">
        <thead>
          <tr>
            <th>操作</th>
            <th>玩家</th>
            <th>手牌</th>
            <th>摆牌</th>
            <th>加分</th>
            <th>总分</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for=" p, idx  in  game.players ">
            <td :class="{ calcPlayer: calcRole[idx] == '算账', antiCalcPlayer: calcRole[idx] == '反算' }">{{ calcRole[idx] }}
            </td>
            <td>[{{ p.ready ? '√' : 'X' }}]{{ p.name }}</td>
            <td>
              <Deck :deck="p.hand" class="hand" />
            </td>
            <td>
              <Deck :deck="p.stored" class="stored" v-if="p.stored?.cards.length" />
            </td>
            <td>{{ lastAddScore[idx] }}</td>
            <td>{{ p.score }}</td>
          </tr>
        </tbody>
      </table><br>
      <div class="score-table">
        <Deck :deck="{ name: '钉牌', cards: game.pinnedCard }" style="height: 70px;width: 300px;" />
      </div>

      <br>
      <button @click="sendReady" v-if="!self.ready" :class="['btn']">
        准备
      </button>
    </div>
    <div :class="['float-overlap', { show: showGameOver }]">
      <h2>游戏结束</h2>
      <table class="score-table">
        <thead>
          <tr>
            <th>玩家</th>
            <th>总分</th>
            <th>*</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for=" p, idx  in  game.players ">
            <td>[{{ p.ready ? '√' : 'X' }}]{{ p.name }}</td>
            <td>{{ p.score }}</td>
            <td>
              <span v-if="p.score! >= 250">
                🐢
              </span>
            </td>
          </tr>
        </tbody>
      </table><br>
      <button @click="game.stage.operate = 0; showGameOver = false" :class="['btn']">
        确定
      </button>
    </div>

    <div class="other-players">
      <player :id="'player-' + idx" :player="p" v-for=" p, idx  in  game.players " style="display: inline-block;"
        :class="['game-player', { current: game.stage.playerIndex == idx }]" />
    </div>
    <div class="notice">
      <div :class="['notice-msg', { show: noticeMsg && noticeLasting }]">
        {{ noticeMsg }}
      </div>
      <br>
      <div :class="['notice-deck', { show: noticeDeck && noticeLasting }]">
        <Deck :deck="noticeDeck" style="height: 60px;" />
      </div>
    </div>
    <div class="placed-cards">
      <Deck :deck="game.lastOperatedCards" style="height: 170px;"></Deck>
    </div>
    <div class="rest-cards">卡堆余 {{ game.allCards.cards.length }} 张</div>
    <div class="self-ops">

      <div class="tip-pin-ctr">
        <div class="tip">
          <div class="tip-msg">
            {{ tipMsg }}
          </div>
        </div>
        <div class="pinned-cards">
          <Deck :deck="{ cards: game.pinnedCard, name: '钉牌' }" style="height: 90px;display: inline-block;width: 150px;">
          </Deck>
        </div>
      </div>
      <div class="ops">
        <div class="ops-ctr">
          <a class="opt" @click="showProfileBox = true">🔧</a>
          <a class="opt" @click="showMsgBox = true">📣</a>
          <button @click="drawcard"
            :class="['btn', { show: selfTurn && (game.stage.operate == GAME_OPERATES.PUTCARD || game.stage.operate == GAME_OPERATES.AFTER_CHA) }]">
            摸牌
          </button>
          <button @click="discard" :class="['btn', { show: selfTurn && game.stage.operate == GAME_OPERATES.DISCARD }]">
            出牌
          </button>
          <button :class="['btn', { show: showPutCard && selfTurn && game.stage.operate == GAME_OPERATES.PUTCARD }]"
            @click="putcard">
            摆牌
          </button>
          <button
            :class="['btn', { show: !hasTakeAction && !selfTurn && !hasCha && game.stage.operate == GAME_OPERATES.WAIT_CHA }]"
            @click="cha">
            插牌
          </button>
          <button
            :class="['btn', { show: !hasTakeAction && !selfTurn && !hasCha && game.stage.operate == GAME_OPERATES.WAIT_CHA }]"
            @click="notcha">
            不插牌
          </button>
          <button :class="['btn', { show: showCalc && selfTurn && game.stage.operate == GAME_OPERATES.PUTCARD }]"
            @click="calc">
            算账
          </button>
          <button :class="['btn', { show: !hasTakeAction && !selfTurn && game.stage.operate == GAME_OPERATES.CALC }]"
            @click="antiCalc">
            反算
          </button>
          <button :class="['btn', { show: !hasTakeAction && !selfTurn && game.stage.operate == GAME_OPERATES.CALC }]"
            @click="notAntiCalc">
            不反算
          </button>
          <button @click="sendReady" :class="['btn', { show: !self.ready && game.stage.round == -1 }]">
            准备
          </button>
        </div>
      </div>
      <div class="deck">
        <Deck :deck="self.hand" @select_change="deckSelect" :selectable="true" style="height: 170px;" />
      </div>
    </div>
    <div :class="['msg-ops', { show: showMsgBox }]">
      <div style="text-align: center;font-weight: bold;">发送消息</div>
      <div>
        <input type="text" ref="msgInput" @keyup.enter.prevent.stop="sendMsg" v-model="toSendMsg" class="ipt-ctr" />
      </div>
      <div style="text-align: right;">
        <button @click="showMsgBox = false" class="btn" style="background-color: gray;margin-right: 20px;">取消</button>
        <button @click="sendMsg" class="btn">发送</button>
      </div>
      <div>
        快速表态:
        <span class="quick-act" v-for="msg in qaList" :key="msg" @click="toSendMsg = msg; sendMsg()">{{ msg }}</span>
      </div>
    </div>
    <div class="deck-hash">卡堆hash[{{ game.datas ? game.datas.deckHash : '暂无数据' }}]</div>
  </main>
</template>

<script setup lang="ts">
import Deck from "@/components/deck.vue";
import player from "@/components/player.vue";
import type { IGame, IPlayer, ICard, IDeck } from "@/interfaces/game";
import {
  addCards,
  createDeck,
  pickCard,
  pickCardOrFail,
  pickRandom,
} from "@/utils/cardUtils";
import { isPlayer, createPlayer, id2index, internalId2index } from "@/utils/player";
import { computed, onMounted, onUnmounted, ref, watch, type Ref } from "vue";
import { Room } from "@/utils/network";
import { GAME_OPERATES } from "@/interfaces/game";
import { initGame, putCard, isValidPutCard, drawCard, nxtPlayer, discardCard, canPutCard, canCalc } from "@/utils/game";
import Card from "@/components/card.vue";
import profileVue from "@/components/profile.vue";
import { useCardStore } from "@/stores/cardStore";
import { GetLocalUrl } from "@/utils/store";
import { storeToRefs } from "pinia";
import { useGameStore } from "@/stores/gameStore";
import { useProfileStore } from "@/stores/profileStore";
const CardStore = useCardStore();
const qaList = [
  '🥰', '👌', '👍', '😅', '🤔', '😎', '😭', '🤡', '😡', '🐶', '😨', '🤣'
];
const hasCha = ref(false);
const showProfileBox = ref(false);
const profile = useProfileStore();
const { self, game } = storeToRefs(useGameStore()) as { self: Ref<IPlayer>, game: Ref<IGame> };
const calcRole = ref([""]);
const lastAddScore = ref([0]);
const selfTurn = ref(false);
const hasTakeAction = ref(false);
const deskBackground: Ref<string | undefined> = ref();
async function updateDeskImage() {
  let url = (localStorage.getItem("changeDesk") || undefined);
  if (url && url.startsWith("local:")) {
    url = await GetLocalUrl(url);
  }
  deskBackground.value = url
}
function updateCardImage() {
  CardStore.useImage(profile.get("changeCard")).catch(() => {
    alert("卡面图片加载失败，检查设置");
    CardStore.useImage("svg-cards.svg");
  });
}
updateCardImage();
//附加选牌器
const toSelectCards = ref<IDeck>(createDeck("可供选择的卡", [])), noSelect = ref(false);
let makeSelectedCards: ICard[] = [], makeSelectPromiseCB: Function | null = null;
function makeSelect(e: ICard[]) {
  makeSelectedCards = e;
}
function selectDone() {
  toSelectCards.value.cards = [];
  if (makeSelectPromiseCB) {
    makeSelectPromiseCB();
  }
}
async function selectCard(cards: ICard[], prompt?: string, isNoSelect = false) {
  noSelect.value = isNoSelect
  if (prompt) {
    toSelectCards.value.name = prompt
  } else {
    toSelectCards.value.name = "可供选择的卡"
  }
  toSelectCards.value.cards = cards;
  await new Promise((resolve) => {
    makeSelectPromiseCB = resolve;
  });
  return makeSelectedCards;
}

const optSelections = ref<{ title: string, value: number }[]>([]);
let optPromiseCB: Function | null = null;
async function selectOpt(opts: { title: string, value: number }[]) {
  optSelections.value = opts;
  let value = await new Promise((resolve) => {
    optPromiseCB = resolve;
  });
  optSelections.value = [];
  return value;
}

function calc() {
  room.send({
    type: "calc",
  })
}
function antiCalc() {
  hasTakeAction.value = true;
  room.send({
    type: "antiCalc",
    do: true
  })
}
function notAntiCalc() {
  hasTakeAction.value = true;
  room.send({
    type: "antiCalc",
    do: false
  })
}
//玩家手牌选牌
let selectedCards: ICard[] = [];
function deckSelect(e: ICard[]) {
  selectedCards = e;
}

//抽牌，进入切牌阶段
function drawcard() {
  room.send({ type: "draw" })
}
//弃牌，并等待玩家插牌
function discard() {
  if (selectedCards.length != 1) {
    notice("你只能出一张牌");
    return;
  }
  let card = selectedCards[0];
  room.send({
    type: "discard", card: card
  })
}
//摆牌
function putcard() {
  if (selectedCards.length == 0) {
    notice("请先选择牌");
    return;
  }
  room.send({
    type: "putCard",
    cards: selectedCards
  });
}
//插牌
function cha() {
  if (selectedCards.length == 0) {
    notice("请先选择牌");
    return;
  }
  hasTakeAction.value = true;
  room.send({
    type: "cha",
    do: true,
    cards: selectedCards
  })
}
function notcha() {
  hasTakeAction.value = true;
  room.send({
    type: "cha",
    do: false
  });
}
//开始游戏
function sendReady() {
  room.send({
    type: "ready",
    ready: true
  })
}
//更新个人Profile
function updateProfile(profile?: any) {
  if (profile) {
    self.value.profile = profile;
  }
  updateCardImage();
  updateDeskImage();
  room.send({
    type: "setProfile",
    profile: self.value.profile
  })
}

//
function operateGame(data: IGame, oData: Record<string, any>) {
  let lastOperate = game.value.stage.operate;
  game.value = data;
  let findMe = false;
  game.value.players.forEach((player, idx) => {
    if (player.id == self.value.id) {
      self.value = player;
      selectedCards = [];
      if (idx == game.value.stage.playerIndex) {
        selfTurn.value = true;
      } else {
        selfTurn.value = false;
      }
      findMe = true;
    }
  });
  if (!findMe) {
    tip("正在观战");
  } else if (selfTurn.value) {
    if (game.value.stage.operate == GAME_OPERATES.WAIT_CHA) {
      tip("等待其他玩家选择是否插牌");
    } else if (game.value.stage.operate == GAME_OPERATES.PUTCARD) {
      if (lastOperate != GAME_OPERATES.PUTCARD) sendNotifaction("到你了", "现在是你的回合");
      tip("你的回合，请选择是否摆牌/算账，然后摸牌");
    } else if (game.value.stage.operate == GAME_OPERATES.DISCARD) {
      tip("你已经摸牌，请选择弃牌");
    } else if (game.value.stage.operate == GAME_OPERATES.AFTER_CHA) {
      tip("你已经插牌，请摸牌");
    }
  } else {
    if (game.value.stage.operate == GAME_OPERATES.WAIT_CHA) {
      if (hasTakeAction.value) tip("等待其他玩家选择是否插牌");
      else { tip("请选择是否插牌"); }
      if (lastOperate != GAME_OPERATES.WAIT_CHA && canPutCard(game.value, self.value.hand!, undefined, oData.card))
        sendNotifaction("到你了", "请选择是否插牌");
    } else if (game.value.stage.operate == GAME_OPERATES.CALC) {
      tip("请选择是否反算");
      if (lastOperate != GAME_OPERATES.CALC && canCalc(game.value, self.value))
        sendNotifaction("到你了", "请选择是否反算");
    } else {
      tip("等待其他玩家操作");
    }
  }
}

const msgs = ref<{ msg: string, time: number, from: string }[]>([]);
const msgInput = ref<HTMLInputElement>();
const noticeMsg = ref("");
const noticeDeck = ref(createDeck("", []));
const noticeLasting = ref(0);
const lastPingTime = ref(1000);
const tipMsg = ref("");
const toSendMsg = ref("");
const showCalc = ref(false), showPutCard = ref(false), showGameOver = ref(false), showMsgBox = ref(false);
function notice(msg: string, cards?: ICard[]) {
  noticeMsg.value = msg;
  if (cards !== undefined) {
    noticeDeck.value.cards = cards;
  }
  noticeLasting.value = 10;
}
function tip(msg: string) {
  tipMsg.value = msg;
}
function sendMsg() {
  room.send({
    type: "msg",
    msg: toSendMsg.value,
    from: self.value.name
  })
  toSendMsg.value = "";
  showMsgBox.value = false;
  msgInput.value?.blur();
}
let isConnected = false;
let room: Room;
let roomInterval: number;
const createRoomObj = () => {
  if (profile.get("showNotifaction") != "never") {
    if ('Notification' in window) {
      if (Notification.permission != "granted") {
        Notification.requestPermission();
      }
    }
  }
  if (localStorage.getItem("name")) {
    self.value.name = localStorage.getItem("name")!;
  } else {
    self.value.name = prompt("请输入你的名字", self.value.name)!;
    localStorage.setItem("name", self.value.name);
  }
  if (localStorage.getItem("id")) {
    self.value.id = localStorage.getItem("id")!;
  } else {
    localStorage.setItem("id", self.value.id);
  }
  room = new Room(localStorage['room'] || "1234", self.value, (data: any) => {
    if (data.game) {
      operateGame(data.game, data);
    }
    if (data.type == "cha") {
      notice(`玩家${data.game.players[data.game.stage.playerIndex].name}插牌`, data.cards);
    } else if (data.type == "draw") {
      notice(`玩家${data.game.players[data.game.stage.playerIndex].name}摸牌`, []);
    } else if (data.type == "discardCard") {
      notice(`玩家${data.game.players[data.game.stage.playerIndex].name}弃牌`, [data.card]);
      if (!selfTurn.value) {
        //自动处理不能插牌的情况
        if (!canPutCard(data.game, self.value.hand!, undefined, data.card)) {
          notcha();
        } else {
          hasTakeAction.value = false;
        }
      }
    } else if (data.type == "putCard") {
      notice(`玩家${data.game.players[data.game.stage.playerIndex].name}摆牌`, [...data.cards]);
    } else if (data.type == "putCardDone") {
      if (data.add) {
        notice(`玩家${data.game.players[data.game.stage.playerIndex].name}插牌`, [...data.cards]);
      } else {
        notice(`玩家${data.game.players[data.game.stage.playerIndex].name}摆牌`, [...data.cards]);
      }
      if (selfTurn.value) {
        showPutCard.value = canPutCard(data.game, self.value.hand!, self.value.stored);
        showCalc.value = canCalc(data.game, self.value);
      }
    } else if (data.type == "putCardSelect") {
      (async () => {
        while (true) {
          let card = await selectCard(data.selection, `请选择${data.count}张牌`);
          if (card.length == data.count) {
            room.send({
              type: "putCardSelect",
              selection: card
            })
            break;
          }
        }
      })();
    } else if (data.type == "optSelect") {
      (async () => {
        let value = await selectOpt(data.selections);
        data.orgData[data.key] = value;
        room.send(data.orgData)
      })();
    } else if (data.type == "calc") {
      notice(`玩家${data.game.players[data.game.stage.playerIndex].name}发起算账`, []);
      if (!selfTurn.value) {
        if (!canCalc(data.game, self.value)) {
          notAntiCalc();
        } else {
          hasTakeAction.value = false;
        }
      }
    } else if (data.type == "next") {
      notice(`${data.game.players[data.game.stage.playerIndex].name}`, []);
      if (selfTurn.value) {
        showPutCard.value = canPutCard(data.game, self.value.hand!, self.value.stored);
        showCalc.value = canCalc(data.game, self.value);
      }
    } else if (data.type == "calcDone") {
      lastAddScore.value = data.res;
      for (let i = 0; i < data.game.players.length; i++) {
        calcRole.value[i] = "";
      }
      calcRole.value[internalId2index(data.game, data.player)] = "算账";
      for (let id of data.antiCalc) {
        calcRole.value[internalId2index(data.game, id)] = "反算";
      }
      sendNotifaction("算账", `${game.value.players[internalId2index(data.game, data.player)].name}发起的算账已完成`);
    } else if (data.type == "ready") {
      if (!data.game) {
        game.value.players = data.player;
      }
    } else if (data.type == "error") {
      hasTakeAction.value = false;
      notice(data.msg);
    } else if (data.type == "hello") {
      updateProfile(profile.webProfile);
      if (!data.hasGame) {
        self.value.ready = false;
        game.value.stage.round = -1;
        game.value.lastOperatedCards.cards = [];
      }
    } else if (data.type == "join") {
      game.value.players = data.player;
      notice(`您已成功进入房间`, []);
    } else if (data.type == "leave") {
      if (!data.game) game.value.players = data.player;
    } else if (data.type == "start") {
      notice("游戏开始");
    } else if (data.type == "gameOver") {
      showGameOver.value = true;
      self.value.ready = false;
      game.value.stage.round = -1;
      game.value.lastOperatedCards.cards = [];
      game.value.players.forEach((player) => {
        player.ready = false;
      })
    } else if (data.type == "setProfile") {
      for (let player of game.value.players) {
        if (player.internalId == data.id) {
          player.profile = data.profile;
        }
      }
    } else if (data.type == "msg") {
      msgs.value.push({
        msg: data.msg,
        from: data.from,
        time: 7
      })
      sendNotifaction(data.from, data.msg);
    } else if (data.type == "ping") {
      room.send({
        type: "pong",
        tick: data.tick
      });
      lastPingTime.value = 20;
    } else if (data.type == "pingResult") {
      (data.ping as number[]).forEach((t, idx) => {
        game.value.players[idx].delay = t;
      })
    } else if (data.type == "firstCard") {
      selectCard([data.card], "第一张牌是", true);
    } else if (data.type == "disconnected") {
      notice(data.msg);
      if (isConnected) sendNotifaction("网络异常", data.msg);
      isConnected = false;
    } else if (data.type == "open") {
      isConnected = true;
    }
  });
  roomInterval = setInterval(() => {
    if (noticeLasting.value > 0) {
      noticeLasting.value--;
    }
    if (lastPingTime.value > 0) {
      lastPingTime.value--;
    } else {
      lastPingTime.value = 10000;
      if (room)
        room.reconnect(true);
    }
    msgs.value.forEach((msg) => {
      msg.time--;
    })
    while (msgs.value.length > 0 && msgs.value[0].time <= 0) {
      msgs.value.shift();
    }
  }, 1000);
}
let lastPlayerIndex = -1;
watch(() => game.value.stage.playerIndex, () => {
  let playerElem = document.getElementById(`player-${game.value.stage.playerIndex}`)!;
  (playerElem.parentNode as HTMLElement)!.scrollTo({ left: playerElem.offsetLeft, behavior: 'smooth' });
})

notice("等待其他玩家进入游戏");
const enterUp = (e: KeyboardEvent) => {
  if (e.key == "Enter") {
    if (!showMsgBox.value) {
      showMsgBox.value = true;
      msgInput.value?.focus();
    }
  }
}

let windowHidden = false;
const visibilityChange = () => {
  document.title = document.title.replaceAll('[后台]', '');
  if (document.hidden) {
    windowHidden = true;
    document.title = '[后台]' + document.title;
  } else {
    windowHidden = false;
    closeAllNotify();
  }
}
window.addEventListener("focus", () => {
  closeAllNotify();
})
let lastNotify: Notification | undefined;
const closeAllNotify = () => {
  if (!('Notification' in window)) return;
  if (lastNotify) {
    lastNotify.close();
    lastNotify = undefined;
  }
  navigator.serviceWorker.getRegistration().then((registration) => {
    registration?.getNotifications().then((notifications) => {
      notifications.forEach((notification) => {
        notification.close();
      })
    })
  });
}
const sendNotifaction = (title: string, content: string) => {
  if (!('Notification' in window)) return;
  if (!windowHidden && profile.get("showNotifaction") == "whenHidden") {
    return;
  } else if (profile.get("showNotifaction") == "noFocus" && document.hasFocus()) {
    return;
  } else if (profile.get("showNotifaction") == "never") {
    return;
  }

  if (Notification.permission == "granted") {
    closeAllNotify();
    navigator.serviceWorker.getRegistration().then((registration) => {
      registration!.showNotification(title, {
        body: content
      })
    }).catch((e) => {
      lastNotify = new Notification(title, {
        body: content
      })
    })
  } else if (Notification.permission != "denied") {
    Notification.requestPermission().then(() => {
      sendNotifaction(title, content);
    });
  }
}
onMounted(() => {
  window.addEventListener("keyup", enterUp);
  document.addEventListener('visibilitychange', visibilityChange);
  createRoomObj();
})
onUnmounted(() => {
  window.removeEventListener("keyup", enterUp);
  document.addEventListener('visibilitychange', visibilityChange);
  room.release();
  room = null!;
  clearInterval(roomInterval);
})


</script>
<style scoped>
main {
  height: 100%;
  width: 100%;
  margin: 0%;
  background-position: center;
  background-size: cover;
}

.btn {
  display: inline-block;
  border-radius: 100px;
  box-shadow: black 2px 2px 3px;
  border: none;
  background: #4db6ac;
  color: white;
  font-size: medium;
  font-weight: bold;
  padding: 5px;
}

.btn:active {
  box-shadow: black 2px 2px 3px inset;
}

.btn:hover {
  filter: brightness(0.9);
}

.other-players {
  text-align: center;
  border-bottom: 1px solid gray;
  overflow-x: auto;
  overflow-y: visible;
  max-width: 100%;
  white-space: nowrap;
  padding-bottom: 10px;
}

.placed-cards {}

.self-ops {
  display: grid;
  grid-row: 3;
  grid-column: 1;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 330px;
  z-index: 1000;
}

.self-ops .tip-pin-ctr {
  height: 90px;
  grid-column-start: 1;
  grid-row-start: 1;
}

.tip-pin-ctr .tip {
  display: inline-block;
  width: calc(100% - 180px);
}

.tip-msg {
  backdrop-filter: brightness(0.5);
  color: white;
  width: fit-content;
  padding: 10px;
  border-radius: 5px;
  display: inline-block;
}

.pinned-cards {
  display: inline-block;
  height: 50px;
  width: 180px;
}

.self-ops .deck {
  display: grid;
  grid-column-end: 1;
  grid-column-start: 1;
  grid-row-start: 3;
  grid-row-end: 3;
}

.ops-ctr {
  display: inline-block;
  height: 50px;
  background: linear-gradient(90deg, rgba(2, 0, 36, 0) 0%, rgba(144, 164, 174, 1) 17%, rgba(144, 164, 174, 1) 100%);
  padding-left: 30px;
}

.self-ops .ops {
  grid-column-end: 1;
  grid-column-start: 1;
  grid-row-start: 2;
  grid-row-end: 2;
  height: 50px;
  text-align: right;
  overflow: hidden;
}

.self-ops .ops .opt {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  background-color: #29b6f6;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.self-ops .ops button {
  display: inline-block;
  width: 0px;
  margin: 0px;
  overflow: hidden;
  transition: all 0.3s;
  padding: 0px;
  transform: translateY(200px);
  transition: transform 0.3s, width 0.3s;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .ops-ctr {
    width: calc(100% - 30px);
  }

  .self-ops .ops button.show {
    max-width: calc(25% - 20px);
    margin: 10px 3px !important;
  }

  .score-table .stored {
    width: 90px !important;
  }

  .score-table .hand {
    width: 110px !important;
  }
}

.self-ops .ops button.show {
  width: 150px;
  margin: 10px;
  transform: translateX(0);
  padding: 5px;
}

.float-overlap {
  position: fixed;
  bottom: 100%;
  width: 100%;
  left: 0;
  height: 100%;
  overflow-y: auto;
  transition: all 0.3s;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10005;
  text-align: center;
  padding-top: 100px;
  color: white;
}

.float-overlap.show {
  bottom: 0%;
}

.selectCards {
  padding: 100px;
  text-align: center;
}

.game-player {
  transition: all 0.3s;
  transform: scale(0.9) translateY(0);
  filter: brightness(0.5);
  z-index: 1;
}

.game-player.current {
  transform: scale(1.1) translateY(5px);
  filter: brightness(1);
  z-index: 100;
}

.rest-cards {
  background: #29b6f6;
  width: fit-content;
  transform-origin: top left;
  transform: rotate(90deg) translate(-92px, -20px);

}

.notice {
  padding-top: 40px;
  text-align: center;
  backdrop-filter: brightness(0.5);
  color: white;
}

.notice-msg {
  display: inline-block;
}

.notice-msg::before {
  content: "[";
  padding-right: 5px;
  color: #e91e63;
  font-weight: bold;
  font-size: large;
}

.notice-msg::after {
  content: "]";
  padding-left: 5px;
  color: #e91e63;
  font-weight: bold;
  font-size: large;
}

.notice-deck {
  width: 150px;
  display: inline-block;
}

.score-table {
  background: aliceblue;
  display: inline-block;
  border-radius: 6px;
  padding: 5px;
  color: #000;
  text-align: left;
}

.profile-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
}

@media (max-height: 767px) {
  .notice {
    padding-top: 0%;
  }
}

.score-table .hand,
.score-table .stored {
  height: 70px;
  width: 150px;
}

.calcPlayer {
  color: #e91e63;
  font-weight: bold;
}

.antiCalcPlayer {
  color: #1a237e;
  font-weight: bold;
}
</style>
<style scoped>
.msg-box {
  position: fixed;
  top: 220px;
  left: 0;
  width: 50%;
  z-index: 10004;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  max-width: 400px;
  border-radius: 0px 10px 10px 0px;
  padding: 10px;
  transition: left 0.3s;
}

.msg-box.hide {
  left: -420px;
}

.msg-box .title {
  font-weight: bold;
  text-align: center;
}

.msg-ops {
  position: fixed;
  bottom: -200px;
  height: 200px;
  width: 100%;
  left: 0;
  z-index: 1000000;
  transition: bottom 0.3s;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
}

.msg-ops.show {
  bottom: 0;
}

input.ipt-ctr {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  outline: 0;
  padding: 10px 8px;
  box-shadow: 0 0 2px 0px #4c4c4c;
  border-radius: 5px;
  border: gray 1px solid;
  width: calc(100% - 20px);
}

.quick-act {
  display: inline-block;
  padding: 6px;
  cursor: pointer;
}

.deck-hash {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 100000;
  font-size: 8px;
}
</style>
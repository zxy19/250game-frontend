<template>
  <div ref="deck_ctr" class="deck_ctr" v-if="props.deck!">
    <div class="deck-name" v-if="props.deck && props.deck.name">{{ props.deck!.name }}</div>
    <div v-for="(i, idx) in props.deck!.cards" :class="['card_ctr', {
      'select': (!!i.selected) != ((idx >= tx && idx <= sx) || (idx <= tx && idx >= sx))
    }]" :style="{ left: (22 + card_wid * idx) + 'px', zIndex: idx }"
      @dblclick="props.deck.cards = props.deck.cards.map((o) => { o.selected = false; return o; })">
      <card :card="i.id" :color="i.color" :size="card_size" style="float: left;max-height: 100%"
        :select="(!!i.selected) != ((idx >= tx && idx <= sx) || (idx <= tx && idx >= sx))"
        @mousedown="(isSelecting = true) && doSelect(idx)" @mouseup="(isSelecting = false) || doSelect(-1)"
        @mouseover="isSelecting && doSelect(idx)" :real="i.real"></card>
    </div>
  </div>
</template>
<script setup lang="ts">
import card from "@/components/card.vue";
import type { IDeck } from "@/interfaces/game";
import { nextTick, onMounted, onUnmounted, reactive, watch } from "vue";

import { ref } from "vue";
const props: { deck: IDeck } = defineProps({
  deck: Object,
}) as any;
const emit = defineEmits(["select_change"]);
let isSelecting = false;
let sx = ref(-1),
  tx = ref(-1);
const doSelect = (idx: number) => {
  if (idx == -1) {
    if (tx.value != -1) {
      for (
        let i = Math.min(tx.value, sx.value);
        i <= Math.max(tx.value, sx.value);
        i++
      ) {
        props.deck.cards[i].selected = !props.deck.cards[i].selected;
      }
    }
    tx.value = -1;
    sx.value = -1;
  } else {
    if (sx.value == -1) {
      sx.value = idx;
      tx.value = idx;
    } else {
      tx.value = idx;
    }
  }
  let tmp = [];
  for (let i = 0; i < props.deck!.cards.length; i++) {
    if (props.deck.cards[i].selected) {
      tmp.push(props.deck!.cards[i]);
    }
  }
  emit("select_change", tmp);
};
const card_wid = ref(0), card_size = ref(100);
const deck_ctr = ref(null);

function resize() {
  if (!props.deck) {
    card_wid.value = 10;
    card_size.value = 100;
  }
  else {
    card_size.value = ((deck_ctr.value as any).clientHeight - 15) / 243.137 * 100;
    card_wid.value = ((deck_ctr.value as any).clientWidth - 22 - card_size.value / 100 * 167.375) / (props.deck!.cards.length - 1);
  }
  if (card_wid.value > card_size.value * 1.67) card_wid.value = card_size.value * 1.67;
}
watch(props!, () => {
  nextTick(() => resize());
})
nextTick(() => resize());
onMounted(() => {
  window.addEventListener("resize", resize);
});
onUnmounted(() => {
  window.removeEventListener("resize", resize);
});
</script>
<style scoped>
.deck-name {
  transform-origin: 0 20px;
  transform: rotate(90deg);
  padding-left: 5px;
  background: gray;
  color: white;
}

.deck_ctr {
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
  white-space: nowrap;
}

.card_ctr {
  position: absolute;
  top: 15px;
  transition: all 0.3s;
  transform: scale(1) translate(0);
}

.card_ctr.select {
  transform: scale(1.01) translate(-5px, -5px);
}
</style>
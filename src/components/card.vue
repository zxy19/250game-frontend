<template>
  <div ref="cardelem" :class="['card', { select: props.select }, { noreal: props.real }]" :style="{
    height: (height) + 'px',
    width: (props.width || width) + 'px',
    backgroundImage: `url(${cardImages[group * 13 + id]})`,
  }" @click.prevent="$emit('click')" @mouseover.prevent="$emit('mouseover')" @mousedown.prevent="$emit('mousedown')">
    <div v-if="props.real" class="real">
      <card :card="props.real.id" :color="props.real.color" @mousedown="$emit('mousedown')"
        @mouseover="$emit('mouseover')" @click="$emit('click')" class="real-card" :size="props.size"></card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CARD_TRANSLATE } from "@/config/cards";
import { computed, reactive, ref, nextTick, watch } from "vue";
import { useCardStore } from "@/stores/cardStore";
import { storeToRefs } from 'pinia'
const CardStore = useCardStore();
const { cardImages,loadedUrl } = storeToRefs(CardStore)
const cardelem = ref<HTMLElement>();
const CARD_POS: Record<string, number> = {
  "1": 0,
  "2": 1,
  "3": 2,
  "4": 3,
  "5": 4,
  "6": 5,
  "7": 6,
  "8": 7,
  "9": 8,
  "10": 9,
  J: 10,
  Q: 11,
  K: 12,
};
defineEmits(["click", "mouseover", "mousedown"]);
const props = defineProps({
  card: String,
  color: Number,
  size: Number,
  select: Boolean,
  width: Number,
  real: Object
});
const height = computed(() => ((props.size || 100) / 100) * 243.137);
const width = computed(() => ((props.size || 100) / 100) * 167.375);

const group = computed(() => {
  if (!props.card) {
    return 4;
  } else if (props.card == "JOK") {
    return 4;
  } else {
    return props.color || 0;
  }
});
const id = computed(() => {
  if (!props.card) {
    return 3;
  } else if (props.card == "JOK") {
    return props.color || 0;
  } else {
    return CARD_POS[props.card || 0] || 0;
  }
});
const cardName = props.card ? ref(CARD_TRANSLATE[props.card]) : ref("?");
</script>

<style scoped>
.card {
  background-size: cover;
  filter: brightness(100%);
  overflow: hidden;
}

.card.select {
  filter: brightness(50%);
}

.real {
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  padding-left: 15%;
  padding-top: 15%;
}

.real-card {}
</style>

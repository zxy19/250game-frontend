<template>
    <div class="player-block"
        :style="{ backgroundImage: (showPic && props.player!.profile.back) ? `url('${props.player!.profile.back}')` : undefined }">
        <div :class="{ name: 1, 'half-white': (showPic && props.player!.profile.back) }"><span v-if="props.self">※</span>{{
            (props.player as IPlayer).name }}</div>
        <div :class="{ score: 1, 'half-white': (showPic && props.player!.profile.back) }">分数：{{ (props.player as
            IPlayer).score
        }}</div>
        <div class="card">
            <span :class="{ 'half-white': (showPic && props.player!.profile.back) }">手牌</span>
            <Deck class="hand" :deck="calcDeck" style="display:inline-block;width: 70px;height: 40px;" :no-scroll="true"></Deck>
            <span :class="{ 'half-white': (showPic && props.player!.profile.back) }">余{{ calcDeck.cards.length }}</span>
        </div>
        <Deck class="store" :thin="true" :deck="(props.player as IPlayer).stored" style="width: 130px;height: 70px;" />
        <div class="readyStat" v-if="!((props.player as IPlayer).ready)">未准备</div>
        <div class="offlineStat" v-if="((props.player as IPlayer).offline)">掉线</div>
        <div class="ping" :style="{ color: calcDelayColor }" v-if="((props.player as IPlayer).delay) !== undefined">{{ (props.player as
            IPlayer).delay }}ms</div>
    </div>
</template>

<script setup lang="ts">
import Deck from "@/components/deck.vue";
import type { IDeck, IPlayer } from '@/interfaces/game';
import { useProfileStore } from "@/stores/profileStore";
import { createDeck } from "@/utils/cardUtils";
import { watch, type Ref, ref, compile, computed } from "vue";
const profile = useProfileStore();
const showPic = computed(() => {
    return profile.get("showCard") != "false";
})
const props = defineProps({
    player: Object,
    color: String,
    self: Boolean
});
const p: IPlayer = props.player as IPlayer
const calcDeck: Ref<IDeck> = ref(createDeck("", []));
watch(() => props.player, () => {
    if (props.player!.hand) {
        calcDeck.value.cards = props.player!.hand.cards.map((_: any) => ({
            id: "JOK", color: 2
        }));
    }
})
const calcDelayColor = computed(() => {
    if ((props.player as IPlayer).delay) {
        if ((props.player as IPlayer).delay! < 100) {
            return "#43a047"
        } else if ((props.player as IPlayer).delay! < 400) {
            return "#f9a825"
        } else if ((props.player as IPlayer).delay! < 2000) {
            return "#f4511e"
        } else {
            return "#bf360c"
        }
    }
})
</script>
<style scoped>
@media (max-height: 767px) {
    .player-block {
        height: 80px !important;
        width: 80px !important;
    }

    .player-block .name {
        text-align: left;
        font-size: 0.8rem;
        max-height: 15px;
        overflow: hidden;
    }

    .player-block .card {
        font-size: 0.7rem;
        height: 15px;
    }

    .player-block .card .hand {
        display: none !important;
        ;
    }

    .player-block .store {
        position: relative;
        top: 0px;
        height: 50px;
        width: 80px;
    }

}

@media (max-width: 500px) {
    .player-block {
        height: 80px !important;
        width: 80px !important;
    }

    .player-block .name {
        text-align: left;
        font-size: 0.8rem;
        max-height: 15px;
        overflow: hidden;
    }

    .player-block .card {
        font-size: 0.7rem;
        height: 15px;
    }

    .player-block .card .hand {
        display: none !important;
        ;
    }

    .player-block .store {
        position: relative;
        top: 0px;
        height: 50px;
        width: 80px;
    }

}


.player-block {
    border-radius: 12px;
    padding: 5px;
    margin: 5px;
    text-align: center;
    box-shadow: 1px 1px 5px;
    width: 150px;
    height: 150px;
    overflow: hidden;
    display: block;
    background-size: cover;
    background-position: center;
    background-color: white;
}

.player-block .name {
    text-align: left;
    font-size: 1.2rem;
    max-height: 80px;
    overflow: hidden;
}

.player-block .score {
    text-align: left;
    font-size: 0.8rem;
    color: #616161;
}

.readyStat,
.offlineStat {
    background-color: #ff5722;
    position: absolute;
    bottom: 0;
    height: fit-content;
}

.half-white {
    background-color: rgba(255, 255, 255, 0.5);
}

.ping {
    padding: 0 6px;
    border-radius: 5px;
    background-color: rgba(255, 255, 255, 0.5);
    position: absolute;
    top: 0;
    right: 0;
    font-size: 8px;
}
</style>
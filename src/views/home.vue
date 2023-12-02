<template>
  <main>
    <profile @change="showProfileBox=false" v-if="showProfileBox" class="profile-box"></profile>
    <h2>250在线</h2><br>
    <div style="height: 80px;">
      <b>输入房间号:&nbsp;&nbsp;</b>
      <input type="text" v-model="roomId" />
      <RouterLink @click="cclick" to="/game" id="start">开始游戏</RouterLink>
    </div>
    <div style="height: 80px;">
    </div>
    <div class="bottom-tool">
      <a @click="showProfileBox=true" class="btn">修改个人信息</a>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import profile from '@/components/profile.vue';
const roomId = ref("");
const showProfileBox = ref(false);
const cclick = () => {
  localStorage['room'] = roomId.value;
}
</script>
<style scoped>
main {
  text-align: center;
  height: 100%;
  margin: 0%;
  overflow: hidden;
}

input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  outline: 0;
  padding: 10px 8px;
  box-shadow: 0 0 2px 0px #4c4c4c;
  border-radius: 5px;
  border: gray 1px solid;
}

input:focus {
  box-shadow: 0 0 2px 0px #2196f3;
}

.bottom-tool {
  text-align: center;
  position: absolute;
  bottom: 20px;
  width: 100%;
  left: 0;
}

#start,
.btn {
  border: gray 1px solid;
  padding: 6px 10px 10px 10px;
  border-radius: 5px;
  background-color: #2196f3;
  color: white;
  text-decoration: none;
  margin: 5px;
  cursor: pointer;
  display: inline-block;
}

#start:hover,
.btn:hover {
  background-color: #0277bd;
}
.profile-box{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
<template>
    <div class="profile">
        <table class="feats">
            <tr v-for="item in profileKey">
                <td>{{ item.desc }}</td>
                <td v-if="item.select">
                    <select v-model="item.value" style="width: 100%;">
                        <option v-for="opt in item.select" :selected="opt == item.value" :value="opt">{{ opt }}</option>
                    </select>
                </td>
                <td v-else>
                    <input type="text" v-model="item.value">
                    <template v-if="item.allowLocal">
                        <br>
                        <input class="allowLocal" type="file" @change="fileChange($event as InputFileEvent, item)">
                    </template>
                </td>
            </tr>
        </table>
        <div>

        </div>
        <div>
            <button @click="save" class="btn">确定</button>
        </div>
        <div>
            <br><br><br>
            <a @click="clearLocal" style="text-decoration: underline;cursor: pointer;">&gt;清空所有本地文件缓存</a>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { CreateLocalUrl, DeleteLocalUrl, GetLocalUrls } from "@/utils/store";
const emit = defineEmits(["change"]);
const profileKey = ref([
    { id: "back", desc: "角色卡片背景", value: "" },
    { id: "name", desc: "用户名", value: "" },
    { id: "changeCard", desc: "自定义卡面", value: "", allowLocal: true },
    { id: "changeDesk", desc: "自定义桌布", value: "", allowLocal: true },
    { id: "showCard", desc: "渲染其他人的图片", select: ["true", "false"], value: "" },
]);
profileKey.value.forEach((item) => {
    item.value = localStorage[item.id] ?? "";
})
const save = () => {
    profileKey.value.forEach((item) => {
        if (localStorage[item.id] && localStorage[item.id] !== item.value && (localStorage[item.id] as string).startsWith("local:")) {
            DeleteLocalUrl(localStorage[item.id] as string);
        }
        localStorage[item.id] = item.value;
    })
    emit("change", profileKey.value);
}
interface InputFileEvent extends Event {
    target: HTMLInputElement;
};
const fileChange = async (event: InputFileEvent, item: { id: string, value: string }) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    item.value = await CreateLocalUrl(file);
}
const clearLocal = async () => {
    if (confirm("确定要清空所有本地文件缓存吗?")) {
        Promise.all((await GetLocalUrls()).map(DeleteLocalUrl)).then(() => {
            alert("清空完成");
        });
    }
}
</script>
<style scoped>
.profile {
    background-color: white;
    border-radius: 5px;
    text-align: center;
    box-shadow: 2px 2px 4px gray;
}

.feats {
    display: inline-block;
}

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

table {
    border-collapse: collapse;
}

td {
    padding-bottom: 10px;
    padding-top: 10px;
}

tr {
    border-bottom: #4c4c4c 1px solid;
}

input,
select {
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

input:focus,
select:focus {
    box-shadow: 0 0 2px 0px #2196f3;
}
</style>
<template>
    <div class="profile">
        <table class="feats">
            <tr v-for="item in profile.keys">
                <td>{{ item.desc }}</td>
                <td v-if="item.select">
                    <select v-model="edited[item.id]" style="width: 100%;">
                        <option v-for="opt in item.select" :selected="opt == edited[item.id]" :value="opt">{{ opt }}
                        </option>
                    </select>
                </td>
                <td v-else>
                    <input type="text" v-model="edited[item.id]">
                    <template v-if="item.allowLocal">
                        <br>
                        <input class="allowLocal" type="file" @change="fileChange($event as InputFileEvent, item.id)">
                    </template>
                    <template v-if="item.cloud">
                        <br>
                        <input class="allowCloud" type="file" @change="cloudUpload($event as InputFileEvent, item.id)">
                    </template>
                </td>
            </tr>
        </table>
        <div>

        </div>
        <div>
            <button @click="save" class="btn" :disabled="loading">{{ (!loading) ? '确定' : "..." }}</button>
        </div>
        <div>
            <br><br><br>
            <a @click="premitNotify" style="text-decoration: underline;cursor: pointer;">&gt;授权通知弹窗</a><br><br>
            <a @click="clearLocal" style="text-decoration: underline;cursor: pointer;">&gt;清空所有本地文件缓存</a>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';
import { CreateLocalUrl, DeleteLocalUrl, GetLocalUrls } from "@/utils/store";
import { useProfileStore } from "@/stores/profileStore"
import { cloud } from "@/config/net";
const loading = ref(false);
const emit = defineEmits(["change"]);
const profile = useProfileStore();
const edited: Ref<Record<string, string>> = ref({});
profile.keys.forEach((item) => {
    edited.value[item.id] = profile.get(item.id);
});
const save = () => {
    profile.update(edited.value);
    emit("change", edited);
}
interface InputFileEvent extends Event {
    target: HTMLInputElement;
};
const fileChange = async (event: InputFileEvent, id: string) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    edited.value[id] = await CreateLocalUrl(file);
}
const cloudUpload = async (event: InputFileEvent, id: string) => {
    if (!event.target.files) return;
    loading.value = true;
    try {
        const file = event.target.files[0];
        const form = new FormData();
        form.append("file", file);
        let url = await (await fetch(cloud, {
            method: "POST",
            body: form
        })).text();
        if (url.startsWith("https://")) {
            edited.value[id] = url;
        } else {
            alert(url);
        }
    } finally {
        loading.value = false;
    }
}
const clearLocal = async () => {
    if (confirm("确定要清空所有本地文件缓存吗?")) {
        Promise.all((await GetLocalUrls()).map(DeleteLocalUrl)).then(() => {
            alert("清空完成");
        });
    }
}
const premitNotify = () => {
    if (Notification.permission == "granted") {
        navigator.serviceWorker.getRegistration().then((registration) => {
            registration?.showNotification("授权通知", {
                body: "已授权通知弹窗",
            })
        })
    } else
        Notification.requestPermission().then(() => {
            premitNotify();
        });
}
</script>
<style scoped>
.profile {
    background-color: white;
    border-radius: 5px;
    text-align: center;
    box-shadow: 2px 2px 4px gray;
    overflow-y: auto;
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
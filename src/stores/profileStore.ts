import { DeleteLocalUrl } from '@/utils/store';
import { defineStore } from 'pinia';
export const useProfileStore = defineStore('ProfileStore', {
    // state
    state: () => {
        let _: {
            keys: { id: string, desc: string, value: string, select?: string[], allowLocal?: boolean, cloud?: boolean }[],
            profile: Record<string, string>
        } = {
            keys: [
                { id: "back", desc: "角色卡片背景", value: "", cloud: true },
                { id: "name", desc: "用户名", value: "" },
                { id: "changeCard", desc: "自定义卡面", value: "svg-cards.svg", allowLocal: true },
                { id: "changeDesk", desc: "自定义桌布", value: "", allowLocal: true },
                { id: "showCard", desc: "渲染其他人的图片", select: ["true", "false"], value: "true" },
                { id: "showFrom", desc: "弃牌堆显示来源", select: ["true", "false"], value: "true" },
                { id: "showNotifaction", desc: "显示通知", select: ["always", "whenHidden", "noFocus", "never"], value: "whenHidden" },
            ],
            profile: {}
        };
        _.keys.forEach((key) => {
            _.profile[key.id] = localStorage.getItem(key.id) || key.value;
        })
        return _;
    },
    // getters
    getters: {
        webProfile(): Record<string, string> {
            return {
                back: this.profile.back,
                name: this.profile.name,
            }
        }
    },
    // actions
    actions: {
        get(key: string) {
            return this.profile[key];
        },
        update(data: Record<string, string>) {
            this.keys.forEach((item) => {
                if (localStorage[item.id] && localStorage[item.id] !== data[item.id] && (localStorage[item.id] as string).startsWith("local:")) {
                    DeleteLocalUrl(localStorage[item.id] as string);
                }
                this.profile[item.id] = localStorage[item.id] = data[item.id];
            })
        }
    }
});

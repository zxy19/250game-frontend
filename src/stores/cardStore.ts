import { defineStore, storeToRefs } from 'pinia';
import { GetLocalUrl } from '@/utils/store';
export const useCardStore = defineStore('CardStore', {
    // state
    state: () => {
        let _: {
            cardImages: string[],
            loadedUrl: string
        } = {
            cardImages: [],
            loadedUrl: ''
        };
        for (let i = 0; i < 65; i++) {
            _['cardImages'].push('');
        }
        return _;
    },

    // actions
    actions: {
        async useImage(url: string): Promise<void> {
            if (this.loadedUrl == url) {
                return;
            }
            this.loadedUrl = url;
            if (url.includes("{CARD_ID}")) {
                let tmp: string[] = []
                for (let i = 0; i < 65; i++) {
                    tmp.push();
                }
                return;
            }
            if (url.startsWith("local:")) {
                url = await GetLocalUrl(url);
            }
            let _cavs = window.document.createElement('canvas');
            _cavs.style.display = "none";
            _cavs.height = 243.137;
            _cavs.width = 167.375;
            let ctx: CanvasRenderingContext2D | null = _cavs.getContext('2d');
            if (!ctx) {
                throw new Error("获取2d上下文失败");
            }
            window.document.body.appendChild(_cavs);
            let image = new Image();
            image.src = url;
            image.crossOrigin = "Anonymous";
            await new Promise((resolve, reject) => {
                image.onload = resolve
                image.onabort = image.onerror = () => {
                    reject("图片加载失败");
                }
            })
            const singleImageWidth = image.width / 13;
            const singleImageHeight = image.height / 5;

            let tmp: string[] = []
            for (let i = 0; i < 65; i++) {
                tmp.push('');
            }
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 13; j++) {
                    ctx.drawImage(image, singleImageWidth * j, singleImageHeight * i, singleImageWidth, singleImageHeight, 0, 0, _cavs.width, _cavs.height);
                    await new Promise<void>((resolve) => {
                        _cavs.toBlob((blob) => {
                            tmp[i * 13 + j] = URL.createObjectURL(blob!);
                            resolve();
                        })
                    });
                }
            }
            this.cardImages = tmp;
        }
    },
});

import { OurWindow } from "../types";
import Main from "./main";
import { CssClass, ElementId } from "./constants";
import "@/css/index.css";

if (typeof window !== 'undefined') {
    const ourWindow = window as unknown as OurWindow;
    const parent = document.getElementById("qroll-parent") as HTMLElement;

    (function initQroll() {
        if (parent) return;
        let attempts = 0;
        const interval = setInterval(() => {
            attempts += 1;
            if (!!ourWindow.qroll && ourWindow.qroll.restart) {
                ourWindow.qroll.restart();
                clearInterval(interval);
            }
            if (attempts > 1000) {
                clearInterval(interval);
            }
        }, 100);
    })();

    ourWindow.qroll = Main;

    const isNuxt = parent.dataset.nuxt;
    const isNext = parent.dataset.next;
    const isSvelteKit = parent.dataset.svelteKit;

    const isMetaFramework = [isNuxt, isNext, isSvelteKit].includes("true");

    setTimeout(() => {
        Main(ElementId.PARENT, {
            sectionClass: CssClass.CHILD
        });
    }, isMetaFramework ? 1000 : 0)

}

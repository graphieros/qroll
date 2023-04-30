import { spawn } from "./functions";
import { CssClass, DomElement, Svg } from "./constants";
import Main from "./main";

export function createDelayer() {
    const parent = document.getElementById("qroll-parent") as HTMLElement;
    if (!parent || !parent.dataset.delay) return;
    const alreadyHasLoader = parent.getElementsByClassName(CssClass.LOADER_SPINNER).length;

    if (alreadyHasLoader) return;

    const hasBackground = !!parent.dataset.delayBackground;
    const delay = Number(parent.dataset.delay);

    const backdrop = spawn(DomElement.DIV);
    backdrop.classList.add(CssClass.LOADER_BACKDROP);
    const spinner = spawn(DomElement.DIV);
    spinner.classList.add(CssClass.LOADER_SPINNER);
    spinner.innerHTML = Svg.SPINNER;
    spinner.style.animation = `qroll-loader-spin ${delay}ms infinite linear`
    backdrop.appendChild(spinner);
    document.body.appendChild(backdrop);
    backdrop.style.zIndex = "2147483647";
    backdrop.style.background = hasBackground ? parent.dataset.delayBackground || "black" : "black";
    backdrop.style.animation = `qroll-load ease-in ${delay}ms forwards`;

    Main.state().timeouts.t16 = setTimeout(() => {
        const loaders = document.getElementsByClassName(CssClass.LOADER_BACKDROP);
        Array.from(loaders).forEach(loader => loader.remove());
    }, delay);
}

const loader = {
    createDelayer,
}

export default loader;

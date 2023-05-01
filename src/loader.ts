import { spawn } from "./functions";
import { CssClass, DomElement, Svg } from "./constants";
import Main from "./main";

export function createDelayer() {
    const parent = document.getElementById("qroll-parent") as HTMLElement;
    if (!parent || !parent.dataset.delay) return;
    const alreadyHasLoader = parent.getElementsByClassName(CssClass.LOADER_SPINNER).length;
    const icon = parent.dataset.loaderIcon ? parent.dataset.loaderIcon : "spin";

    if (alreadyHasLoader) return;

    const hasBackground = !!parent.dataset.delayBackground;
    const delay = Number(parent.dataset.delay);

    const backdrop = spawn(DomElement.DIV);
    backdrop.classList.add(CssClass.LOADER_BACKDROP);
    const spinner = spawn(DomElement.DIV);
    spinner.classList.add(CssClass.LOADER_SPINNER);
    switch (true) {
        case icon === "spin":
            spinner.innerHTML = Svg.SPINNER;
            spinner.style.animation = `qroll-loader-spin ${delay}ms infinite linear`;
            break;

        case icon === "dots":
            const dotWrapper = spawn(DomElement.DIV);
            dotWrapper.classList.add("qroll-loader-dot-wrapper");
            for (let i = 0; i < 3; i += 1) {
                const dot = spawn(DomElement.DIV);
                dot.classList.add("qroll-loader-dot");
                dot.classList.add(`qroll-loader-dot-${i}`);
                dotWrapper.appendChild(dot);
            }
            spinner.appendChild(dotWrapper);
            break;

        default:
            spinner.innerHTML = Svg.SPINNER;
            spinner.style.animation = `qroll-loader-spin ${delay}ms infinite linear`;
    }

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

import { spawn } from "./functions";
import { DomElement } from "./constants";
import Main from "./main";

export function createDelayer() {
    const parent = document.getElementById("qroll-parent") as HTMLElement;
    if (!parent || !parent.dataset.delay) return;

    const delay = Number(parent.dataset.delay);

    const backdrop = spawn(DomElement.DIV);
    backdrop.classList.add("qroll-loader-backdrop");
    const spinner = spawn(DomElement.DIV);
    spinner.classList.add("qroll-loader-spinner");
    backdrop.appendChild(spinner);
    document.body.appendChild(backdrop);
    backdrop.style.zIndex = "10000000";
    backdrop.style.animation = `qroll-load ease-in ${delay}ms forwards`;

    Main.state().timeouts.t16 = setTimeout(() => {
        const loaders = document.getElementsByClassName("qroll-loader-backdrop");
        Array.from(loaders).forEach(loader => loader.remove());
    }, delay);
}

const loader = {
    createDelayer,
}

export default loader;

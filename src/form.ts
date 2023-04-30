import { EventTrigger, Regex } from "./constants";
import { findClassNameSuffix, findOutline } from "./functions";
import Main from "./main";

type Attribute = {
    key: any;
    value: string;
}

export function applyStyle({ element, attributes }: { element: HTMLElement, attributes: Attribute[] }) {
    attributes.forEach((attribute) => {
        if (attribute.value === "none") return;
        element.style[attribute.key] = attribute.value;
    });
}

export function applyStyles(element: HTMLElement) {
    const radius = findClassNameSuffix({
        element,
        regex: Regex.RADIUS,
        fallback: 8
    });

    const size = findClassNameSuffix({
        element,
        regex: Regex.HEIGHT,
        fallback: 1,
    });

    const background = findClassNameSuffix({
        element,
        regex: Regex.BACKGROUND,
        fallback: "white",
    });

    const fontFamily = findClassNameSuffix({
        element,
        regex: Regex.FONT_FAMILY,
        fallback: "inherit"
    });

    const textColor = findClassNameSuffix({
        element,
        regex: Regex.TEXT_COLOR,
        fallback: "inherit"
    });

    const marginBottom = findClassNameSuffix({
        element,
        regex: Regex.MARGIN_BOTTOM,
        fallback: "none"
    });

    const marginTop = findClassNameSuffix({
        element,
        regex: Regex.MARGIN_TOP,
        fallback: "none"
    });

    const marginLeft = findClassNameSuffix({
        element,
        regex: Regex.MARGIN_LEFT,
        fallback: "none"
    });

    const marginRight = findClassNameSuffix({
        element,
        regex: Regex.MARGIN_RIGHT,
        fallback: "none"
    });

    const marginAll = findClassNameSuffix({
        element,
        regex: Regex.MARGIN_ALL,
        fallback: "none"
    });

    const marginY = findClassNameSuffix({
        element,
        regex: Regex.MARGIN_Y,
        fallback: "none"
    });

    const marginX = findClassNameSuffix({
        element,
        regex: Regex.MARGIN_X,
        fallback: "none"
    });

    const paddingAll = findClassNameSuffix({
        element,
        regex: Regex.PADDING_ALL,
        fallback: "none"
    });

    const paddingTop = findClassNameSuffix({
        element,
        regex: Regex.PADDING_TOP,
        fallback: "none"
    });

    const paddingBottom = findClassNameSuffix({
        element,
        regex: Regex.PADDING_BOTTOM,
        fallback: "none"
    });

    const paddingLeft = findClassNameSuffix({
        element,
        regex: Regex.PADDING_LEFT,
        fallback: "none"
    });

    const paddingRight = findClassNameSuffix({
        element,
        regex: Regex.PADDING_RIGHT,
        fallback: "none"
    });

    const paddingX = findClassNameSuffix({
        element,
        regex: Regex.PADDING_X,
        fallback: "none"
    });

    const paddingY = findClassNameSuffix({
        element,
        regex: Regex.PADDING_Y,
        fallback: "none"
    });

    const isRounded = Array.from(element.classList).includes("rounded");

    const outline = findOutline(element);

    const attributes = [
        { key: "background", value: background },
        { key: "border-radius", value: `${isRounded ? `${+size}em` : `${radius}px`}` },
        { key: "color", value: textColor },
        { key: "font-family", value: fontFamily },
        { key: "font-size", value: `${+size}rem` },
        { key: "margin", value: `${marginAll}em` },
        { key: "margin-bottom", value: `${marginBottom}em` },
        { key: "margin-bottom", value: `${marginY}em` },
        { key: "margin-left", value: `${marginLeft}em` },
        { key: "margin-left", value: `${marginX}em` },
        { key: "margin-right", value: `${marginRight}em` },
        { key: "margin-right", value: `${marginX}em` },
        { key: "margin-top", value: `${marginTop}em` },
        { key: "margin-top", value: `${marginY}em` },
        { key: "outline", value: outline },
        { key: "padding", value: `${paddingAll}em` },
        { key: "padding-bottom", value: `${paddingBottom}em` },
        { key: "padding-bottom", value: `${paddingY}em` },
        { key: "padding-left", value: `${paddingLeft}em` },
        { key: "padding-left", value: `${paddingX}em` },
        { key: "padding-right", value: `${paddingRight}em` },
        { key: "padding-right", value: `${paddingX}em` },
        { key: "padding-top", value: `${paddingTop}em` },
        { key: "padding-top", value: `${paddingY}em` },
    ] as Attribute[];

    applyStyle({
        element,
        attributes
    });

    if (element.nodeName === "SELECT") {
        const options = element.getElementsByTagName("option") as unknown as HTMLOptionElement[];
        if (options.length) {
            Array.from(options).forEach(option => {
                option.style.color = "#000000";
            });
        }
    }
}

export function createButtons() {
    const buttons = document.getElementsByClassName("qroll-button") as unknown as HTMLButtonElement[];
    if (!buttons.length) return;

    Array.from(buttons).forEach(button => {

        applyStyles(button);

        let buttonTimeout: any;

        function clickButton() {
            clearTimeout(buttonTimeout);
            button.classList.add("qroll-button--clicked");
            buttonTimeout = setTimeout(() => {
                button.classList.remove("qroll-button--clicked");
            }, 200);
        }

        const buttonAborter = new AbortController();
        button.addEventListener(EventTrigger.CLICK, clickButton, { signal: buttonAborter.signal });

        Main.state().events.push({
            element: button,
            trigger: EventTrigger.CLICK,
            callback: clickButton,
            aborter: buttonAborter
        });
    });
}

export function createInputs() {
    const inputs = document.getElementsByClassName("qroll-input") as unknown as HTMLFormElement[];
    if (!inputs.length) return;

    Array.from(inputs).forEach(input => {
        applyStyles(input);
    });
}

const form = {
    createButtons,
    createInputs,
}

export default form;

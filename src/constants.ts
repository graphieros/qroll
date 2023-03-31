import { ScrollDirection } from "../types";

export namespace CssClass {
    export const CAROUSEL = "qroll-carousel";
    export const CAROUSEL_SLIDE = "qroll-carousel-slide";
    export const CAROUSEL_VERTICAL = "qroll-carousel-vertical";
    export const CAROUSEL_WRAPPER = "qroll-slide-carousel-wrapper";
    export const CHILD = "qroll-child";
    export const HAS_HORIZONTAL_NAV = "qroll-has-horizontal-nav";
    export const HAS_NAV = "qroll-nav";
    export const LOOP = "qroll-loop";
    export const MAIN = "qroll-main";
    export const NAV_BUTTON_DOWN = "qroll-carousel-vertical-button-down";
    export const NAV_BUTTON_LEFT = "qroll-carousel-horizontal-button-left";
    export const NAV_BUTTON_RIGHT = "qroll-carousel-horizontal-button-right";
    export const NAV_BUTTON_TOP = "qroll-carousel-vertical-button-top";
    export const NAV_HORIZONTAL = "qroll-horizontal-nav";
    export const NAV_HORIZONTAL_ELEMENT_WRAPPER = "qroll-nav-horizontal-element-wrapper";
    export const NAV_LINK = "qroll-nav-link";
    export const NAV_LINK_SELECTED = "qroll-nav-link-selected";
    export const NAV_VERTICAL = "qroll-nav-vertical";
    export const NO_TRANSITION = "qroll-no-transition";
    export const PARENT = "qroll-parent";
    export const SLIDE = "qroll-slide";
    export const TOOLTIP = "qroll-tooltip";
    export const TOOLTIP_LEFT = "qroll-tooltip-left";
    export const TOOLTIP_TOP = "qroll-tooltip-top";
    export const TRANSITION_1000 = "qroll-transition-1000";
    export const TRANSITION_300 = "qroll-transition-300";
    export const TRANSITION_400 = "qroll-transition-400";
    export const TRANSITION_500 = "qroll-transition-500";
    export const TRANSITION_600 = "qroll-transition-600";
    export const TRANSITION_700 = "qroll-transition-700";
    export const TRANSITION_800 = "qroll-transition-800";
    export const TRANSITION_900 = "qroll-transition-900";
}

export namespace CssDisplay {
    export const NONE = "none";
    export const FLEX = "flex";
}
export namespace CssPointer {
    export const DEFAULT = "default";
    export const POINTER = "pointer";
}
export namespace CssUnit {
    export const PX = "px";
}
export namespace CssVisibility {
    export const INITIAL = "initial";
    export const HIDDEN = "hidden";
}

export namespace Direction {
    export const DOWN = "down" as ScrollDirection;
    export const LEFT = "left" as ScrollDirection;
    export const RIGHT = "right" as ScrollDirection;
    export const UP = "up" as ScrollDirection;
}

export namespace DomElement {
    export const A = "a";
    export const BUTTON = "button";
    export const DIV = "DIV";
    export const NAV = "nav";
    export const SPAN = "span";
}

export namespace ElementAttribute {
    export const STYLE = "style";
    export const ID = "id";
    export const TYPE = "type";
    export const TABINDEX = "tabindex";
}

export namespace ElementId {
    export const PARENT = "qroll-parent";
}

export namespace EventTrigger {
    export const HASHCHANGE = "hashchange";
    export const KEYUP = "keyup";
    export const RESIZE = "resize";
    export const TOUCHEND = "touchend";
    export const TOUCHMOVE = "touchmove";
    export const TOUCHSTART = "touchstart";
    export const WHEEL = "wheel";
    export const CLICK = "click";
}

export namespace KeyboardCode {
    export const ARROW_DOWN = "ArrowDown";
    export const ARROW_LEFT = "ArrowLeft";
    export const ARROW_RIGHT = "ArrowRight";
    export const ARROW_UP = "ArrowUp";
    export const ENTER = "Enter";
    export const SPACE = "Space";
}

export namespace NodeName {
    export const BODY = "BODY";
    export const INPUT = "INPUT";
    export const TEXTAREA = "TEXTAREA";
}

export namespace Svg {
    export const CHEVRON_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>`;
    export const CHEVRON_LEFT = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>`;
    export const CHEVRON_TOP = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" height="30px" width="30px"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>`;
    export const CHEVRON_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" height="30px" width="30px"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>`;
    export const PAUSE = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>`;
    export const PLAY = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>`;
}
import { ScrollDirection } from "../types";

export namespace Direction {
    export const DOWN = "down" as ScrollDirection;
    export const LEFT = "left" as ScrollDirection;
    export const RIGHT = "right" as ScrollDirection;
    export const UP = "up" as ScrollDirection;
}

export namespace CssClass {
    export const BOTTOM = "alpra-bottom";
    export const BOTTOM_INVISIBLE = "alpra-bottom-invisible";
    export const CHILD = "alpra-child";
    export const CHILDREN_WRAPPER = "alpra-children-wrapper";
    export const CHILD_VISIBLE = "alpra-child-visible";
    export const HIDDEN = "alpra-hidden";
    export const PARENT = "alpra-parent";
    export const TOP = "alpra-top";
    export const TRANSITION_Y = "alpra-transitionY";
}

export namespace KeyboardCode {
    export const ARROW_DOWN = "ArrowDown";
    export const ARROW_LEFT = "ArrowLeft";
    export const ARROW_RIGHT = "ArrowRight";
    export const ARROW_UP = "ArrowUp";
    export const SPACE = "Space";
}

export namespace NodeName {
    export const BODY = "BODY";
    export const INPUT = "INPUT";
    export const TEXTAREA = "TEXTAREA";
}

export namespace EventTrigger {
    export const KEYUP = "keyup";
    export const RESIZE = "resize";
    export const TOUCHEND = "touchend";
    export const TOUCHMOVE = "touchmove";
    export const TOUCHSTART = "touchstart";
    export const WHEEL = "wheel";
}
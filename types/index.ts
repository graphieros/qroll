export interface OurWindow extends Window {
    qroll: (name: string, options: Options) => void,
}
export interface Config {
    parentName: "string",
    options: Options
}

export type ScrollDirection = 'up' | 'down' | 'right' | 'left'

export interface Options {
    [key: string]: any
    sectionClass?: string;
}

export interface MoveEventTarget {
    scrollHeight: number;
    clientHeight: number;
    scrollWidth: number;
    clientWidth: number;
    classList: Iterable<unknown> | ArrayLike<unknown>;
}

export type MoveEvent = {
    target: MoveEventTarget;
    deltaY: number;
    deltaX: number;
}


export type EventTriggerListener = {
    target: Window | Document | HTMLElement;
    trigger: string;
    method: (event: any) => void;
}

export type Carousel = {
    transitionDuration: number;
    currentSlide: number;
    currentSlideId: null | string;
    hasLoop: boolean;
    isVisible: boolean;
    slideCount: number;
    htmlElement: HTMLDivElement | null;
    clickLeft: () => void;
    clickRight: () => void;
    keyLeft: () => void;
    keyRight: () => void;
}

export type State = {
    carousel: Carousel,
    cssClassTransition: string;
    currentCarousel: HTMLDivElement | null;
    currentNoLoopSlide: number;
    eventTouchEnd: Touch;
    eventTouchStart: Touch;
    isBrowserNavigation: boolean;
    isLoop: boolean;
    isRouting: boolean;
    isSliding: boolean;
    isSlidingX: boolean;
    isTrackpad: boolean;
    pageHeight: number;
    pageWidth: number;
    parentClass: string;
    timeoutClassTransition: NodeJS.Timeout | number;
    timeoutDestroySlide: NodeJS.Timeout | number;
    timeoutTransitionX: NodeJS.Timeout | number;
    timeoutTransitionY: NodeJS.Timeout | number;
    timeoutRouter: NodeJS.Timeout | number;
    tooltipEllipsisLimit: number;
    trackpadSensitivityThreshold: number;
    transitionDuration: number;
    userAgent: string;
    wheelCount: number;
}
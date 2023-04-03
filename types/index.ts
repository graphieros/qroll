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

export type State = {
    cssClassTransition: string;
    currentCarousel: HTMLDivElement | null;
    currentNoLoopSlide: number;
    eventTouchEnd: Touch;
    eventTouchStart: Touch;
    isBrowserNavigation: boolean;
    intervals: any[];
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
    timeoutRouter: NodeJS.Timeout | number;
    tooltipEllipsisLimit: number;
    trackpadSensitivityThreshold: number;
    transitionDuration: number;
    userAgent: string;
    wheelCount: number;
    modalIds: string[];
}
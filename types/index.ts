export interface OurWindow extends Window {
    mainFunc: (name: string, options: Options) => void
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
}


export type EventTriggerListener = {
    target: Window | Document | HTMLElement;
    trigger: string;
    method: (event: any) => void;
}

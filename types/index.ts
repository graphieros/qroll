export interface Config {
    parentName: "string",
    options: Options
}

export type ScrollDirection = 'up' | 'down'

export interface Options {
    [key: string]: any
    sectionClass?: string;
}

export interface OurWindow extends Window {
    mainFunc: (name: string, options: Options) => void
}
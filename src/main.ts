import { Options, ScrollDirection } from "../types";
import { CssClass, Direction } from "./constants";
import functions from "./functions";

// TODO: add option for looping
// TODO: find a way to include css

let childClass = CssClass.CHILD;
let childPosition = 0;

const parentClass = CssClass.PARENT;

// LISTENERS
let evtTouchStart: Touch;
let evtTouchEnd: Touch;
// const threshold = 50;

const logError = (err: string) => {
    console.error('Alpra-scroll exception:', { err })
}

const Main = (parentName: string, options: Options = {}) => {
    const parent = document.getElementById(parentName) as HTMLElement;

    if (!parent) return logError(`parent name not found: ${parentName}`);

    parent.classList.add(parentClass);

    const children = new Array(parent.children) as unknown as HTMLElement[];

    const childrenWrapper = document.createElement("DIV");
    childrenWrapper.classList.add(CssClass.CHILDREN_WRAPPER);
    childrenWrapper.id = CssClass.CHILDREN_WRAPPER;

    const { sectionClass } = options;
    if (sectionClass) {
        childClass = sectionClass;
    }

    if (children.length) {
        for (let i = 0; i < parent.children.length; i += 1) {
            const child = parent.children[i].cloneNode(true) as HTMLElement;
            if (!child.id) {
                child.id = `section_${i + 1}`;
            }
            child.classList.add(childClass);
            child.classList.add(CssClass.TOP);
            childrenWrapper.appendChild(child);

            parent.children[i].classList.add(CssClass.HIDDEN);
        }

        if (childrenWrapper.firstChild) {
            (childrenWrapper.firstChild as HTMLElement).classList.add(CssClass.CHILD_VISIBLE);
        }
    }
    parent.appendChild(childrenWrapper);

    const bottomInvisibleDiv = document.createElement("DIV");
    bottomInvisibleDiv.classList.add(CssClass.BOTTOM_INVISIBLE);
    document.body.appendChild(bottomInvisibleDiv);

    document.addEventListener("touchstart", (event) => {
        evtTouchStart = event.changedTouches?.[0] || evtTouchStart;
    });

    document.addEventListener("touchend", (event) => {
        evtTouchEnd = event.changedTouches?.[0] || evtTouchEnd;
    });

    document.addEventListener("touchmove", (_e) => {
        const diff = (evtTouchStart?.clientY - evtTouchEnd?.clientY) ?? 0;
        if (diff > 0) {
            scrollSlides(Direction.UP);
        } else if (diff < 0) {
            scrollSlides(Direction.DOWN);
        }
    });

    document.addEventListener("wheel", (event: any) => {
        console.log({ event }, event.deltaY);

        if (event.deltaY > 0) {
            scrollSlides(Direction.DOWN);
        } else {
            scrollSlides(Direction.UP);
        }
    })
}

function scrollSlides(direction: ScrollDirection) {
    if (direction === Direction.UP) {
        scrollUp(childPosition + 1)
    } else {
        scrollDown(childPosition - 1);
    }
}

function scrollUp(nextChild: number) {
    const childrenWrapper = document.getElementById(CssClass.CHILDREN_WRAPPER);

    if (nextChild < 0 || !childrenWrapper) return;

    const children = new Array(childrenWrapper.children) as unknown as HTMLElement[];

    if (children.length) {
        for (let i = 0; i < children.length; i += 1) {
            if (childPosition === i) {
                (childrenWrapper.children[i] as HTMLElement).classList.remove(CssClass.CHILD_VISIBLE);
            } else if (nextChild === i) {
                functions.updateCssClasses({
                    element: childrenWrapper.children[i] as HTMLElement,
                    addedClasses: [CssClass.BOTTOM, CssClass.CHILD_VISIBLE],
                    removedClasses: [CssClass.TOP]
                });
            }
        }
    }

    console.log({ childPosition, nextChild });
    childPosition = nextChild;
}

function scrollDown(nextChild: number) {
    const childrenWrapper = document.getElementById(CssClass.CHILDREN_WRAPPER);
    if (!childrenWrapper || nextChild > childrenWrapper?.children?.length) return;

    const children = new Array(childrenWrapper.children) as unknown as HTMLElement[];

    if (children.length) {
        for (let i = 0; i < children.length; i += 1) {
            if (childPosition === i) {
                (childrenWrapper.children[i] as HTMLElement).classList.remove(CssClass.CHILD_VISIBLE);
            } else if (childPosition === i) {
                functions.updateCssClasses({
                    element: childrenWrapper.children[i] as HTMLElement,
                    addedClasses: [CssClass.TOP, CssClass.CHILD_VISIBLE],
                    removedClasses: [CssClass.BOTTOM]
                });
            }
        }
    }

    console.log({ childPosition, nextChild });
    childPosition = nextChild;
}

export default Main;
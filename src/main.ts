import { Options, ScrollDirection } from "../types"

// TODO: add option for looping
// TODO: find a way to include css

let childClass = 'alpra-child';
let childPosition = 0;

const parentClass = 'alpra-parent'

// LISTENERS
let evtTouchStart: any;
let evtTouchEnd: any;
// const threshold = 50;

const logError = (err: string | any) => {

    console.error('Alpra-scroll exception:', { err })
}

const Main = (parentName: string, options: Options = {}) => {
    const parent = document.getElementById(parentName) as HTMLElement;

    if (!parent) return logError(`parent name not found: ${parentName}`)

    parent.classList.add(parentClass);

    const children = new Array(parent.children) as unknown as HTMLElement[];

    const childrenWrapper = document.createElement("DIV");
    childrenWrapper.classList.add("alpra-children-wrapper");
    childrenWrapper.id = "alpra-children-wrapper";

    const { sectionClass } = options;
    if (sectionClass) {
        childClass = sectionClass;
    }

    if (children.length) {
        for (let i = 0; i < parent.children.length; i += 1) {
            const child = parent.children[i].cloneNode(true) as any;
            if (!child.id) {
                child.id = `section_${i + 1}`;
            }
            child.classList.add(childClass);
            child.classList.add('alpra-top');
            childrenWrapper.appendChild(child);

            parent.children[i].classList.add('alpra-hidden');
        }

        if (childrenWrapper.firstChild) {
            (childrenWrapper.firstChild as HTMLElement).classList.add("alpra-child-visible");
        }
    }
    parent.appendChild(childrenWrapper);
    const bottomInvisibleDiv = document.createElement("DIV");
    bottomInvisibleDiv.classList.add("alpra-bottom-invisible");
    document.body.appendChild(bottomInvisibleDiv);


    document.addEventListener("touchstart", (event) => {
        evtTouchStart = event.changedTouches?.[0] || evtTouchStart;
    });

    document.addEventListener("touchend", (event) => {
        evtTouchEnd = event.changedTouches?.[0] || evtTouchEnd;
    });

    document.addEventListener("touchmove", (_e) => {
        console.log({ evtTouchStart, evtTouchEnd });
        const diff = (evtTouchStart?.clientY - evtTouchEnd?.clientY) ?? 0;
        if (diff > 0) {
            scrollSlides("up");
        } else if (diff < 0) {
            scrollSlides("down");
        }
    });

    document.addEventListener("wheel", (event: any) => {
        console.log({ event }, event.deltaY);

        if (event.deltaY > 0) {
            scrollSlides('down');
        } else {
            scrollSlides('up');
        }
    })
}

function scrollSlides(direction: ScrollDirection) {
    if (direction === 'up') {

        scrollUp(childPosition - 1)
    } else {

        scrollDown(childPosition + 1);
    }
}

function scrollUp(nextChild: number) {
    const childrenWrapper = document.getElementById("alpra-children-wrapper");

    if (nextChild < 0 || !childrenWrapper) return;

    const children = new Array(childrenWrapper.children) as unknown as HTMLElement[];

    if (children.length) {
        for (let i = 0; i < children.length; i += 1) {
            if (childPosition === i) {
                (childrenWrapper.children[i] as HTMLElement).classList.remove("alpra-child-visible");
            } else if (nextChild === i) {
                (childrenWrapper.children[i] as HTMLElement).classList.remove("alpra-top");
                (childrenWrapper.children[i] as HTMLElement).classList.add("alpra-bottom");
                (childrenWrapper.children[i] as HTMLElement).classList.add("alpra-child-visible");
            }
        }
    }

    console.log({ childPosition, nextChild });
    childPosition = nextChild;
}

function scrollDown(nextChild: number) {
    const childrenWrapper = document.getElementById("alpra-children-wrapper");
    if (!childrenWrapper || nextChild > childrenWrapper?.children?.length) return;

    const children = new Array(childrenWrapper.children) as unknown as HTMLElement[];

    if (children.length) {
        for (let i = 0; i < children.length; i += 1) {
            if (childPosition === i) {
                (childrenWrapper.children[i] as HTMLElement).classList.remove("alpra-child-visible");
            } else if (childPosition === i) {
                (childrenWrapper.children[i] as HTMLElement).classList.remove("alpra-bottom");
                (childrenWrapper.children[i] as HTMLElement).classList.add("alpra-top");
                (childrenWrapper.children[i] as HTMLElement).classList.add("alpra-child-visible");
            }
        }
    }

    console.log({ childPosition, nextChild });
    childPosition = nextChild;
}

export default Main
import { Options, ScrollDirection } from "../types";
import { CssClass, Direction } from "./constants";
import { createUid, grabId, logError } from "./functions";

// TODO: find a way to include css
// TODO: add option to display clickable navigation
// TODO: clearTimeout all setTimeout usage


// let childClass = CssClass.CHILD;
// let childPosition = 0;
// let isScrollLocked = false;

// function debounce(this: any, func: { apply: (arg0: any, arg1: IArguments) => void; }, wait: number | undefined, immediate = false) {
//     var self = this;
//     self.timeout = null;
//     return () => {
//         var context = this, args = arguments;
//         clearTimeout(self.timeout);
//         self.timeout = setTimeout(function () {
//             self.timeout = null;
//             if (!immediate) {
//                 func.apply(context, args);
//             }
//         }, wait);

//         if (immediate && !self.timeout) {
//             func.apply(context, args);
//         }
//     };
// }

const parentClass = CssClass.PARENT;
let isChanging = false;
let pageHeight = (window as any).innerHeight;


const Main = (parentName: string, _options: Options = {}) => {

    const transitionDuration = 500; // should be set in options, also the .alpra-transitionY css class needs to be adapted (maybe including defined durations, like .alpra-transition-500, .alpra-transition-300 etc)

    window.addEventListener("resize", (event: any) => {
        pageHeight = event.target.innerHeight;
    });

    document.addEventListener("wheel", function (event: { deltaY: number; }) {
        if (event.deltaY > 0) {
            scroll(Direction.DOWN);
        } else {
            scroll(Direction.UP);
        }
    });

    const parent = grabId(parentName);
    if (!parent) return logError('parent name not found: ' + parentName);

    parent.classList.add(parentClass);

    const children = parent.children as unknown as HTMLElement[];
    for (let i = 0; i < children.length; i += 1) {
        const uid = createUid();
        const element = children[i];
        element.classList.add(CssClass.CHILD);
        element.setAttribute("id", element.id || `child_${uid}`);
        element.dataset.index = `page-${i}`;
    }

    function duplicateSlide(pageId: string) {
        console.log('duplicateSlide', pageId);
        const element = grabId(pageId)?.cloneNode(true) as HTMLElement; // true also clones innerHTML
        element.setAttribute("id", createUid());
        parent.appendChild(element as HTMLElement);
    }

    function removeSlide(slideId: string) {
        if (isChanging) {
            setTimeout(() => {
                parent.removeChild(grabId(slideId));
                isChanging = false;
            }, transitionDuration)
        }
    }

    function translateY(pixels: number) {
        parent.style.transform = `translateY(${pixels}px)`;
    }

    function scroll(direction: ScrollDirection) {
        if (isChanging) return;
        console.log(`Scrolling ${direction}`);

        isChanging = true;
        let firstPageId = children[0].id;
        // let nextPageId = children[1].id;
        let previousPageId = children[children.length - 1].id;

        if (direction === Direction.DOWN) {
            duplicateSlide(firstPageId);
            // setTimeout(() => snapSlide(nextPageId), 250);
            parent.classList.add(CssClass.TRANSITION_Y);
            translateY(-pageHeight);
            removeSlide(firstPageId);
            setTimeout(() => parent.classList.remove(CssClass.TRANSITION_Y), transitionDuration);
            setTimeout(() => translateY(0), transitionDuration);
        } else if (direction === Direction.UP) {
            const element = grabId(previousPageId).cloneNode(true) as HTMLElement;
            const uid = createUid();
            element.setAttribute("id", uid);
            parent.prepend(element);
            parent.classList.remove(CssClass.TRANSITION_Y);
            translateY(-pageHeight);

            setTimeout(() => parent.classList.add(CssClass.TRANSITION_Y), 50);
            setTimeout(() => translateY(0), 50);

            removeSlide(previousPageId);
        }
    }
}

export default Main;
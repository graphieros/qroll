import { EventTriggerListener, MoveEvent, Options, ScrollDirection } from "../types";
import { CssClass, Direction, KeyboardCode, NodeName, EventTrigger } from "./constants";
import { createUid, grabId, logError } from "./functions";

// TODO: find a way to include css
// TODO: documentation:
// > add tabindex="0" to any scrollable div added to a slide
// TODO: add option to display clickable navigation
// TODO: options:
// > infinite vertical loop
// > infinite horizontal loop


const Main = (parentName: string, _options: Options = {}) => {

    const transitionDuration = 500; // should be set in options, also the .alpra-transitionY css class needs to be adapted (maybe including defined durations, like .alpra-transition-500, .alpra-transition-300 etc)
    const parentClass = CssClass.PARENT;
    let isChanging = false;
    let pageHeight = (window as any).innerHeight;
    let eventTouchStart: Touch;
    let eventTouchEnd: Touch;
    let timeoutDestroySlide: any;
    let timeoutClassTransition: any;
    let timeoutTransitionY: any;

    ///////////////////////////// EVENT LISTENERS //////////////////////////////

    function resizeEvent(event: Event) {
        pageHeight = (event.target as Window).innerHeight;
    }

    function wheelEvent(event: MoveEvent) {
        // scroll events inside a scrollable element inside a slide must not trigger sliding
        const hasVerticalScrollBar = event.target.scrollHeight > event.target.clientHeight;
        // FOR LATER: const hasHorizontalScrollBar = event.target.scrollWidth > event.target.clientWidth;
        if (!Array.from(event.target.classList).includes(CssClass.CHILD) && hasVerticalScrollBar) {
            return;
        }
        if (event.deltaY && event.deltaY > 0) {
            scroll(Direction.DOWN);
        } else {
            scroll(Direction.UP);
        }
    }

    function touchstartEvent(event: TouchEvent) {
        eventTouchStart = event.changedTouches?.[0] || eventTouchStart;
    }

    function touchendEvent(event: TouchEvent) {
        eventTouchEnd = event.changedTouches?.[0] || eventTouchEnd;
    }

    function touchMoveEvent(event: MoveEvent) {
        // scroll events inside a scrollable element inside a slide must not trigger sliding
        const hasVerticalScrollBar = event.target.scrollHeight > event.target.clientHeight;
        // FOR LATER: const hasHorizontalScrollBar = event.target.scrollWidth > event.target.clientWidth;

        // exclusion cases
        const isScrollableIsland = !Array.from(event.target.classList).includes(CssClass.CHILD) && hasVerticalScrollBar;
        if ([isScrollableIsland].includes(true)) return;

        const deltaTouch = (eventTouchStart?.clientY - eventTouchEnd?.clientY) ?? 0;
        if (deltaTouch > 0) {
            scroll(Direction.DOWN);
        } else if (deltaTouch < 0) {
            scroll(Direction.UP);
        }
    }

    function keyboardEvent(event: KeyboardEvent) {
        const keyCode = event.code;
        const target: any = event.target;
        const hasVerticalScrollBar = target.scrollHeight > target.clientHeight;
        // FOR LATER: const hasHorizontalScrollBar = event.target.scrollWidth > event.target.clientWidth;

        // exclusion cases
        const isInputField = [NodeName.TEXTAREA, NodeName.INPUT].includes(target.nodeName);
        const isScrollableIsland = hasVerticalScrollBar && target.nodeName !== NodeName.BODY;
        if ([isInputField, isScrollableIsland].includes(true)) return;

        switch (true) {
            case [KeyboardCode.ARROW_DOWN, KeyboardCode.SPACE].includes(keyCode):
                scroll(Direction.DOWN);
                break;

            case [KeyboardCode.ARROW_UP].includes(keyCode):
                scroll(Direction.UP);
                break;

            default:
                return;
        }
    }

    const documentEvents: EventTriggerListener[] = [
        { target: window, trigger: EventTrigger.RESIZE, method: resizeEvent },
        { target: document, trigger: EventTrigger.WHEEL, method: wheelEvent },
        { target: document, trigger: EventTrigger.TOUCHSTART, method: touchstartEvent },
        { target: document, trigger: EventTrigger.TOUCHEND, method: touchendEvent },
        { target: document, trigger: EventTrigger.TOUCHMOVE, method: touchMoveEvent },
        { target: document, trigger: EventTrigger.KEYUP, method: keyboardEvent },
    ];

    documentEvents.forEach(docEvent => {
        docEvent.target.addEventListener(docEvent.trigger, docEvent.method);
    });

    window.onunload = function () {
        documentEvents.forEach(docEvent => {
            docEvent.target.removeEventListener(docEvent.trigger, docEvent.method);
        });
    }

    ////////////////////////////////////////////////////////////////////////////

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

    function duplicateSlide(slideId: string, direction: ScrollDirection) {
        const element = grabId(slideId)?.cloneNode(true) as HTMLElement; // true also clones innerHTML
        element.setAttribute("id", createUid());
        if (direction === Direction.DOWN) {
            parent.appendChild(element as HTMLElement);
        } else if (direction === Direction.UP) {
            parent.prepend(element);
        }
    }

    function destroySlide(slideId: string) {
        if (isChanging) {
            clearTimeout(timeoutDestroySlide);
            timeoutDestroySlide = setTimeout(() => {
                parent.removeChild(grabId(slideId));
                isChanging = false;
            }, transitionDuration)
        }
    }

    function snapSlide(slideId: string, direction: ScrollDirection) {
        if (direction === Direction.DOWN) {
            parent.classList.add(CssClass.TRANSITION_Y);
            translateY(-pageHeight);
            destroySlide(slideId);
            clearTimeout(timeoutClassTransition);
            timeoutClassTransition = setTimeout(() => parent.classList.remove(CssClass.TRANSITION_Y), transitionDuration);
            clearTimeout(timeoutTransitionY);
            timeoutTransitionY = setTimeout(() => translateY(0), transitionDuration);
        } else if (direction === Direction.UP) {
            parent.classList.remove(CssClass.TRANSITION_Y);
            translateY(-pageHeight);
            clearTimeout(timeoutClassTransition);
            // TODO: this random small timeout of 50 makes it work with the same apparent speed as the DOWN direction. We need to try other speeds, the make sure 50 / 500 (transitionDuration) is the right proportion, or if can even work this way
            timeoutClassTransition = setTimeout(() => parent.classList.add(CssClass.TRANSITION_Y), 50);
            clearTimeout(timeoutTransitionY);
            timeoutTransitionY = setTimeout(() => translateY(0), 50);
            destroySlide(slideId);
        }
    }

    function translateY(pixels: number) {
        parent.style.transform = `translateY(${pixels}px)`;
    }

    function scroll(direction: ScrollDirection) {
        if (isChanging) return;

        isChanging = true;
        let firstSlideId = children[0].id;
        let previousSlideId = children[children.length - 1].id;

        if (direction === Direction.DOWN) {
            duplicateSlide(firstSlideId, direction);
            snapSlide(firstSlideId, direction);
        } else if (direction === Direction.UP) {
            duplicateSlide(previousSlideId, direction);
            snapSlide(previousSlideId, direction);
        }
    }
}

export default Main;

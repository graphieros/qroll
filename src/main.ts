import {
    Options,
    State
} from "../types";

import {
    CssClass,
    ElementAttribute,
    ElementId,
} from "./constants";

import {
    grabId,
    logError,
    setTabIndex,
    walkTheDOM,
} from "./functions";

import {
    createCarousel,
    createMainLayout
} from "./carousel";

import {
    getCurrentSlideIndex,
    getSlides,
    slideDown,
    slideUp,
    slideToIndex
} from "./interface";



// TODO: find a way to include css

// ISSUE: using the browser's history previous|next buttons does not update routing to slide in Chrome, Edge, Brave (but does in Firefox)

// TODO: type Main
const Main: any = (parentName: string, _options: Options = {}) => {
    Main.getCurrentSlideIndex = getCurrentSlideIndex;
    Main.getSlides = getSlides;
    Main.slideDown = slideDown;
    Main.slideUp = slideUp;
    Main.slideToIndex = slideToIndex;

    // TODO loading page

    // const cssLink = document.createElement("link");
    // cssLink.rel = "stylesheet";
    // cssLink.type = "text/css";
    // if ((import.meta as any).env.VITE_TARGET === 'production') {
    //     cssLink.href = "./styles.css"
    // } else {
    //     cssLink.href = "./css/index.css" // dev only
    // }
    // console.log((import.meta as any).env)
    // document.head.appendChild(cssLink);

    //------------------------------------------------------------------------//
    //\/\/\/\/\/\/\/\/\/\/\/\/|                       |\/\/\/\/\/\/\/\/\/\/\/\//
    //\/\/\/\/\/\/\/\/\/\/\/\/|          STATE        |\/\/\/\/\/\/\/\/\/\/\/\//
    //\/\/\/\/\/\/\/\/\/\/\/\/|                       |\/\/\/\/\/\/\/\/\/\/\/\//
    //------------------------------------------------------------------------//

    const state: State = {
        carousel: {
            transitionDuration: 500,
            currentSlide: 0,
            currentSlideId: null,
            hasLoop: false,
            isVisible: false,
            slideCount: 0,
            htmlElement: null,
            clickLeft: () => { },
            clickRight: () => { },
            keyLeft: () => { },
            keyRight: () => { },
        },
        cssClassTransition: "",
        currentCarousel: null,
        currentNoLoopSlide: 1,
        eventTouchEnd: null as unknown as Touch,
        eventTouchStart: null as unknown as Touch,
        isBrowserNavigation: false,
        isLoop: Array.from(grabId(ElementId.PARENT).classList).includes(CssClass.LOOP),
        isRouting: false,
        isSliding: false,
        isSlidingX: false,
        isTrackpad: false,
        pageHeight: (window as Window).innerHeight,
        pageWidth: (window as Window).innerWidth,
        parentClass: CssClass.PARENT,
        timeoutClassTransition: null as unknown as NodeJS.Timeout | number,
        timeoutDestroySlide: null as unknown as NodeJS.Timeout | number,
        timeoutTransitionX: null as unknown as NodeJS.Timeout | number,
        timeoutTransitionY: null as unknown as NodeJS.Timeout | number,
        timeoutRouter: null as unknown as NodeJS.Timeout | number,
        tooltipEllipsisLimit: 30,
        trackpadSensitivityThreshold: 30,
        transitionDuration: 1000,
        userAgent: navigator.userAgent,
        wheelCount: 0,
    };

    // this needs extra testing for all browsers to check if wheel event makes the scroll work !

    if (state.userAgent.match(/chrome|chromium|crios/i)) {
        state.trackpadSensitivityThreshold = 10;
    } else {
        state.trackpadSensitivityThreshold = 10;
    }

    // reset sliding blockers if mouse leaves window
    document.addEventListener("mouseleave", function (event) {
        if (event.clientY <= 0 || event.clientX <= 0 || (event.clientX >= window.innerWidth || event.clientY >= window.innerHeight)) {
            state.isSliding = false;
            state.wheelCount = 0;
        }
    });

    //------------------------------------------------------------------------//
    //////////////////////////|                       |/////////////////////////
    //////////////////////////|      DOM CREATION     |/////////////////////////
    //////////////////////////|                       |/////////////////////////
    //------------------------------------------------------------------------//

    const parent = grabId(parentName);
    if (!parent) return logError('parent id not found: ' + parentName);

    // Apply css class transition from provided classes to the parent
    switch (true) {
        case Array.from(parent.classList).includes(CssClass.TRANSITION_300):
            state.cssClassTransition = CssClass.TRANSITION_300;
            state.transitionDuration = 300;
            break;
        case Array.from(parent.classList).includes(CssClass.TRANSITION_400):
            state.cssClassTransition = CssClass.TRANSITION_400;
            state.transitionDuration = 400;
            break;
        case Array.from(parent.classList).includes(CssClass.TRANSITION_500):
            state.cssClassTransition = CssClass.TRANSITION_500;
            state.transitionDuration = 500;
            break;
        case Array.from(parent.classList).includes(CssClass.TRANSITION_600):
            state.cssClassTransition = CssClass.TRANSITION_600;
            state.transitionDuration = 600;
            break;
        case Array.from(parent.classList).includes(CssClass.TRANSITION_700):
            state.cssClassTransition = CssClass.TRANSITION_700;
            state.transitionDuration = 700;
            break;
        case Array.from(parent.classList).includes(CssClass.TRANSITION_800):
            state.cssClassTransition = CssClass.TRANSITION_800;
            state.transitionDuration = 800;
            break;
        case Array.from(parent.classList).includes(CssClass.TRANSITION_900):
            state.cssClassTransition = CssClass.TRANSITION_900;
            state.transitionDuration = 900;
            break;
        case Array.from(parent.classList).includes(CssClass.TRANSITION_1000):
            state.cssClassTransition = CssClass.TRANSITION_1000;
            state.transitionDuration = 1000;
            break;
        default:
            parent.classList.add(CssClass.TRANSITION_1000);
            state.cssClassTransition = CssClass.TRANSITION_1000;
            state.transitionDuration = 1000;
            break;
    }

    parent.classList.add(state.parentClass);

    let children = parent.children as unknown as HTMLElement[];
    for (let i = 0; i < children.length; i += 1) {
        const element = children[i];
        element.classList.add(CssClass.CHILD);
        element.setAttribute(ElementAttribute.ID, element.id || `slide-v-${i}`);
        element.dataset.index = `${i}`;
        Array.from(element.children).forEach(child => walkTheDOM(child, setTabIndex));
        createCarousel(state, element);
    }
    createMainLayout(state, parent);
}

export default Main;

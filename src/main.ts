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
    updateLocation,
    walkTheDOM,
} from "./functions";

import {
    createCarousel,
    createCarouselComponents,
    createDialogs,
    createMainLayout,
    openDialog,
    closeDialog,
    setupVerticalSlides
} from "./carousel";

import {
    getCurrentSlideIndex,
    getSlides,
    slideDown,
    slideUp,
    slideToIndex
} from "./interface";
import {
    createCharts,
    updateCharts
} from "./charts";

// IDEA: SEO provide url links, change meta tags programatically on slide change

// TODO loading page (how to detect isLoading ? => state.isLoading)
// TODO: find a way to include css

// TODO: type Main
const Main: any = (parentName: string, _options: Options = {}) => {
    Main.getCurrentSlideIndex = getCurrentSlideIndex;
    Main.getSlides = getSlides;
    Main.slideDown = slideDown;
    Main.slideUp = slideUp;
    Main.slideToIndex = slideToIndex;
    Main.openDialog = openDialog;
    Main.closeDialog = closeDialog;
    Main.updateCharts = updateCharts;
    // TODO: add Main.restart

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


    // TODO: onload, scan all elements' to check if any data attribute includes a script tag

    //------------------------------------------------------------------------//
    //\/\/\/\/\/\/\/\/\/\/\/\/|                       |\/\/\/\/\/\/\/\/\/\/\/\//
    //\/\/\/\/\/\/\/\/\/\/\/\/|          STATE        |\/\/\/\/\/\/\/\/\/\/\/\//
    //\/\/\/\/\/\/\/\/\/\/\/\/|                       |\/\/\/\/\/\/\/\/\/\/\/\//
    //------------------------------------------------------------------------//

    let state: State = {
        cssClassTransition: "",
        currentCarousel: null,
        currentNoLoopSlide: 1,
        eventTouchEnd: null as unknown as Touch,
        eventTouchStart: null as unknown as Touch,
        intervals: [],
        isBrowserNavigation: false,
        isLoop: Array.from(grabId(ElementId.PARENT).classList).includes(CssClass.LOOP),
        isRouting: false,
        isSliding: false,
        isSlidingDialog: false,
        isSlidingX: false,
        isTrackpad: false,
        modalIds: [],
        pageHeight: (window as Window).innerHeight,
        pageWidth: (window as Window).innerWidth,
        parentClass: CssClass.PARENT,
        timeoutClassTransition: null as unknown as NodeJS.Timeout | number,
        timeoutDestroySlide: null as unknown as NodeJS.Timeout | number,
        timeoutRouter: null as unknown as NodeJS.Timeout | number,
        tooltipEllipsisLimit: 30,
        trackpadSensitivityThreshold: 30,
        transitionDuration: 1000,
        userAgent: navigator.userAgent,
        wheelCount: 0,
        appContent: "",
        events: [],
        timeouts: {
            t0: null,
            t1: null,
            t2: null,
            t3: null,
            t4: null,
            t5: null,
            t6: null,
            t7: null,
            t8: null,
            t9: null,
            t10: null,
            t11: null,
            t12: null,
            t13: null,
            t14: null,
            t15: null
        }
    };

    state.appContent = document.getElementById("qroll-parent")?.innerHTML as string;

    Main.state = () => state;

    // this needs extra testing for all browsers to check if wheel event makes the scroll work !

    if (state.userAgent.match(/chrome|chromium|crios/i)) {
        state.trackpadSensitivityThreshold = 10;
    } else {
        state.trackpadSensitivityThreshold = 10;
    }

    function init() {
        // reset sliding blockers if mouse leaves window
        document.addEventListener("mouseleave", function (event) {
            if (event.clientY <= 0 || event.clientX <= 0 || (event.clientX >= window.innerWidth || event.clientY >= window.innerHeight)) {
                state.isSliding = false;
                state.wheelCount = 0;
            }
        });

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

        let children = Array.from(parent.children).filter(child => !Array.from(child.classList).includes("qroll-dialog")) as unknown as HTMLElement[];
        for (let i = 0; i < children.length; i += 1) {
            const element = children[i];
            element.classList.add(CssClass.CHILD);
            element.setAttribute(ElementAttribute.ID, element.id || `slide-v-${i}`);
            element.dataset.index = `${i}`;
            Array.from(element.children).forEach(child => walkTheDOM(child, setTabIndex));
            createCarousel(state, element);
        }
        createCharts();
        createCarouselComponents(state);
        createMainLayout(state, parent);
        createDialogs(state);
    }

    init();

    Main.refresh = () => {

        Object.keys(state.timeouts).forEach(key => {
            clearTimeout(state.timeouts[key]);
        });
        state.events.forEach((event: any) => {
            event.element.removeEventListener(event.trigger, event.callback, true);
            if (event.aborter) {
                event.aborter.abort();
            }
        });

        state = {
            cssClassTransition: "",
            currentCarousel: null,
            currentNoLoopSlide: 1,
            eventTouchEnd: null as unknown as Touch,
            eventTouchStart: null as unknown as Touch,
            intervals: [],
            isBrowserNavigation: false,
            isLoop: Array.from(grabId(ElementId.PARENT).classList).includes(CssClass.LOOP),
            isRouting: false,
            isSliding: false,
            isSlidingDialog: false,
            isSlidingX: false,
            isTrackpad: false,
            modalIds: [],
            pageHeight: (window as Window).innerHeight,
            pageWidth: (window as Window).innerWidth,
            parentClass: CssClass.PARENT,
            timeoutClassTransition: null as unknown as NodeJS.Timeout | number,
            timeoutDestroySlide: null as unknown as NodeJS.Timeout | number,
            timeoutRouter: null as unknown as NodeJS.Timeout | number,
            tooltipEllipsisLimit: 30,
            trackpadSensitivityThreshold: 30,
            transitionDuration: 1000,
            userAgent: navigator.userAgent,
            wheelCount: 0,
            appContent: state.appContent,
            events: [],
            timeouts: {
                t0: null,
                t1: null,
                t2: null,
                t3: null,
                t4: null,
                t5: null,
                t6: null,
                t7: null,
                t8: null,
                t9: null,
                t10: null,
                t11: null,
                t12: null,
                t13: null,
                t14: null,
                t15: null
            }
        };

        const parent = document.getElementById("qroll-parent") as HTMLElement;
        const tooltips = document.getElementsByClassName("qroll-chart__tooltip");
        if (tooltips.length) {
            Array.from(tooltips).forEach(tooltip => tooltip.remove());
        }
        parent.innerHTML = "";
        parent.innerHTML = state.appContent;
        parent.dataset.currentVIndex = '0';
        init();
        setupVerticalSlides(state, parent);
        const children = Array.from(parent.children).filter(child => !Array.from(child.classList).includes("qroll-dialog")) as unknown as HTMLElement[];
        updateLocation(children[0].id)
    }

}

export default Main;

import {
    Options,
    OurWindow,
    State
} from "../types";

import {
    CssClass,
    ElementAttribute,
    ElementId,
    EventTrigger,
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
import { createDropdownMenu } from "./dropdown";
import { createDelayer } from "./loader";
import { createButtons, createInputs } from "./form";

// TODO: find a way to include css

// TODO: remove flex to .qroll-slide

// TODO: interface Main issue
const Main: any = (parentName: string = "qroll-parent", _options: Options = {}) => {
    Main.getCurrentSlideIndex = getCurrentSlideIndex;
    Main.getSlides = getSlides;
    Main.slideDown = slideDown;
    Main.slideUp = slideUp;
    Main.slideToIndex = slideToIndex;
    Main.openDialog = openDialog;
    Main.closeDialog = closeDialog;
    Main.updateCharts = updateCharts;

    //------------------------------------------------------------------------//
    //\/\/\/\/\/\/\/\/\/\/\/\/|                       |\/\/\/\/\/\/\/\/\/\/\/\//
    //\/\/\/\/\/\/\/\/\/\/\/\/|          STATE        |\/\/\/\/\/\/\/\/\/\/\/\//
    //\/\/\/\/\/\/\/\/\/\/\/\/|                       |\/\/\/\/\/\/\/\/\/\/\/\//
    //------------------------------------------------------------------------//

    let state: State = {
        clickPosition: {
            x: 0,
            y: 0,
        },
        cssClassTransition: "",
        currentCarousel: null,
        currentNoLoopSlide: 1,
        eventTouchEnd: null as unknown as Touch,
        eventTouchStart: null as unknown as Touch,
        intervals: [],
        isBrowserNavigation: false,
        isLoop: !!grabId(ElementId.PARENT) ? Array.from(grabId(ElementId.PARENT).classList).includes(CssClass.LOOP) : false,
        isRouting: false,
        isSliding: false,
        isSlidingDialog: false,
        isSlidingX: false,
        isTrackpad: false,
        modalIds: [],
        pageHeight: (window as Window).innerHeight,
        pageWidth: (window as Window).innerWidth,
        parentClass: CssClass.PARENT,
        pauseSliding: false,
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
            t15: null,
            t16: null
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

        // TODO: find a way to loop through a list of excluded class lists
        let children = Array.from(parent.children).filter(child => !Array.from(child.classList).includes("qroll-dialog") && !Array.from(child.classList).includes("qroll-menu")) as unknown as HTMLElement[];
        for (let i = 0; i < children.length; i += 1) {
            const element = children[i];
            element.classList.add(CssClass.CHILD);
            element.setAttribute(ElementAttribute.ID, element.id || `slide-v-${i}`);
            element.dataset.index = `${i}`;
            Array.from(element.children).forEach(child => walkTheDOM(child, setTabIndex));
            createCarousel(element);
        }
        createDelayer();
        createCharts();
        createCarouselComponents();
        createMainLayout(parent);
        setupVerticalSlides(parent);
        createDialogs();
        createDropdownMenu();
        // Basic UI items (should be loaded optionally)
        createButtons();
        createInputs();
    }

    init();

    document.addEventListener(EventTrigger.CLICK, (e) => {
        state.clickPosition.x = e.clientX;
        state.clickPosition.y = e.clientY;
    });

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
        Main(ElementId.PARENT);
    }

    Main.restart = () => {
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
            clickPosition: {
                x: 0,
                y: 0
            },
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
            pauseSliding: false,
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
                t15: null,
                t16: null
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
        setupVerticalSlides(parent);
        const children = Array.from(parent.children).filter(child => !Array.from(child.classList).includes("qroll-dialog") && !Array.from(child.classList).includes("qroll-menu")) as unknown as HTMLElement[];
        updateLocation(children[0].id)
    }
}

if (typeof window !== 'undefined') {
    (window as unknown as OurWindow).qroll = Main;
}

export default Main;

import { EventTriggerListener, MoveEvent, Options, ScrollDirection } from "../types";
import { CssClass, Direction, ElementId, KeyboardCode, NodeName, EventTrigger, DomElement } from "./constants";
import { applyEllipsis, createUid, detectTrackPad, grabId, logError, reorderArrayByIndex, reorderArrayByCarouselIndex, setTabIndex, spawn, walkTheDOM } from "./functions";
import createCarousel from "./carousel";

// TODO: find a way to include css

// IDEA: show icon to turn on/off scroll (basically add or remove the css class on parent)
// IDEA: option to provide tooltip names from a data-title html attribute (fallback to first h1... content if none provided)

// TODO: progresion bar (horizontal & vertical) qroll-progress-bar

// ISSUE: scrolling top too quickly snaps immedialtely sometimes

// TODO: better vertical nav from plot click

// ISSUE: using the browser's history previous|next buttons does not update routing to slide in Chrome, Edge, Brave (but does in Firefox)

const Main = (parentName: string, _options: Options = {}) => {

    //------------------------------------------------------------------------//
    //\/\/\/\/\/\/\/\/\/\/\/\/|                       |\/\/\/\/\/\/\/\/\/\/\/\//
    //\/\/\/\/\/\/\/\/\/\/\/\/|          STATE        |\/\/\/\/\/\/\/\/\/\/\/\//
    //\/\/\/\/\/\/\/\/\/\/\/\/|                       |\/\/\/\/\/\/\/\/\/\/\/\//
    //------------------------------------------------------------------------//

    const state = {
        cssClassTransition: "",
        currentCarousel: null,
        currentNoLoopSlide: 1,
        eventTouchEnd: null as unknown as Touch,
        eventTouchStart: null as unknown as Touch,
        isBrowserNavigation: false,
        isLoop: Array.from(grabId(ElementId.PARENT).classList).includes(CssClass.LOOP),
        isSliding: false,
        isSlidingX: false,
        isTrackpad: false,
        pageHeight: (window as Window).innerHeight,
        pageWidth: (window as Window).innerWidth,
        parentClass: CssClass.PARENT,
        timeoutClassTransition: null as unknown as NodeJS.Timeout | number,
        timeoutDestroySlide: null as unknown as NodeJS.Timeout | number,
        timeoutTransitionY: null as unknown as NodeJS.Timeout | number,
        timeoutTransitionX: null as unknown as NodeJS.Timeout | number,
        tooltipEllipsisLimit: 30,
        trackpadSensitivityThreshold: 30,
        transitionDuration: 500,
        userAgent: navigator.userAgent,
        carousel: {
            currentSlide: 0,
            currentSlideId: null as null | string,
            hasLoop: false,
            isVisible: false,
            slideCount: 0,
            htmlElement: null as HTMLDivElement | null,
            clickLeft: () => { },
            clickRight: () => { },
            keyLeft: () => { },
            keyRight: () => { },
        },
    }

    // this needs extra testing for all browsers to check if wheel event makes the scroll work !

    if (state.userAgent.match(/chrome|chromium|crios/i)) {
        state.trackpadSensitivityThreshold = 30;
    } else {
        state.trackpadSensitivityThreshold = 10;
    }

    //------------------------------------------------------------------------//
    //////////////////////////|                       |/////////////////////////
    //////////////////////////|      DOM CREATION     |/////////////////////////
    //////////////////////////|                       |/////////////////////////
    //------------------------------------------------------------------------//

    const parent = grabId(parentName);
    if (!parent) return logError('parent name not found: ' + parentName);

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
            state.cssClassTransition = CssClass.TRANSITION_500;
            break;
    }

    parent.classList.add(state.parentClass);

    let children = parent.children as unknown as HTMLElement[];
    for (let i = 0; i < children.length; i += 1) {
        const uid = createUid();
        const element = children[i];
        element.classList.add(CssClass.CHILD);
        element.dataset.slide = uid;
        element.setAttribute("id", element.id || `slide-v-${i}`);
        element.dataset.index = `${i}`;
        Array.from(element.children).forEach(child => walkTheDOM(child, setTabIndex));
        createCarousel(state, element);
    }

    /** Sets the page height whenever the page is resized
     * 
     * @param event - resize event
     */
    function resizeEvent(event: Event) {
        state.pageHeight = (event.target as Window).innerHeight;
        state.pageWidth = (event.target as Window).innerWidth;
        Array.from(children).forEach(child => createCarousel(state, child));
        if (state.carousel.htmlElement) {
            Array.from(state.carousel.htmlElement.children).forEach((child, i) => {
                (child as HTMLElement).style.left = `${state.pageWidth * i}px`;
            });
        }
    }

    /** Generate the nav node, injects slide links and applies an event listener to them
     * 
     */
    function createVerticalNav() {
        const alreadyHasNav = document.querySelectorAll(`#${ElementId.NAV}`);
        if (alreadyHasNav.length) {
            const oldNav = grabId(ElementId.NAV) as HTMLElement;
            document.body.removeChild(oldNav);
        }
        if (Array.from(parent.classList).includes(CssClass.HAS_NAV)) {
            const nav = spawn(DomElement.NAV);
            nav.setAttribute("id", ElementId.NAV);
            nav.classList.add(CssClass.NAV_VERTICAL);
            // TODO: find a way to order consistently when scroll occurs on a distant target
            Array.from(children).sort((a, b) => Number((a as HTMLElement).dataset.index) - Number((b as HTMLElement).dataset.index)).forEach((child, i) => {
                const slideLinkWrapper = spawn(DomElement.DIV);
                slideLinkWrapper.classList.add(CssClass.NAV_ELEMENT_WRAPPER);
                const slideLink = spawn(DomElement.A);
                slideLink.setAttribute("tabindex", "1");
                slideLink.dataset.index = child.dataset.index;
                slideLink.addEventListener(EventTrigger.CLICK, () => clickVerticalNavLink(i));
                slideLink.addEventListener("keyup", (e) => {
                    if ([KeyboardCode.SPACE, KeyboardCode.ENTER].includes(e.key)) {
                        clickVerticalNavLink(i);
                    }
                });
                const span = spawn(DomElement.SPAN);
                span.innerHTML = "●";
                span.style.color = getNavColorFromParentClasses();

                slideLink.appendChild(span);

                const tooltip = spawn(DomElement.DIV) as HTMLDivElement;
                tooltip.classList.add(CssClass.TOOLTIP_LEFT);
                tooltip.dataset.index = `${i}`;
                const slideTitle = Array.from(children).find(slide => Number(slide.dataset.index) === i)?.querySelectorAll("h1,h2,h3,h4")[0];
                // TODO: slideTitle could be refined. If no h element is provided, we need to find the first words of the first p or article or whatever

                if (slideTitle && slideTitle.textContent) {
                    tooltip.setAttribute("style", `font-family:${getComputedStyle(slideTitle).fontFamily.split(",")[0]}`);
                    tooltip.innerHTML = applyEllipsis(slideTitle.textContent, state.tooltipEllipsisLimit);
                } else {
                    tooltip.setAttribute("style", `font-family:Helvetica`);
                    tooltip.innerHTML = `${i}`;
                }

                tooltip.addEventListener(EventTrigger.CLICK, () => clickVerticalNavLink(i));
                [tooltip, slideLink].forEach(el => slideLinkWrapper.appendChild(el));
                nav.appendChild(slideLinkWrapper);
            });

            document.body.appendChild(nav);
        }
    }

    /** Generate carousel navigation elements and methods from a current slide containing a qroll-carousel css class
     *
     */
    function createHorizontalNav() {
        if (!state.carousel.isVisible) return;
        state.carousel.hasLoop = Array.from((state.carousel.htmlElement as HTMLElement).classList).includes(CssClass.LOOP);
        const oldNavLeft = grabId(ElementId.NAV_BUTTON_LEFT);
        const oldNavRight = grabId(ElementId.NAV_BUTTON_RIGHT);

        if (oldNavLeft && oldNavRight) {
            document.body.removeChild(grabId(ElementId.NAV_BUTTON_LEFT));
            document.body.removeChild(grabId(ElementId.NAV_BUTTON_RIGHT));
        }

        const carouselChildren = (state.carousel.htmlElement as HTMLDivElement).children;

        // TODO: mobile detect horizontal swiping (h diff > v diff = h swipe)
        // TODO: update location (this one will be tough af)

        // nav left & right buttons
        const navLeft = spawn(DomElement.BUTTON);
        navLeft.setAttribute("id", ElementId.NAV_BUTTON_LEFT);
        const navRight = spawn(DomElement.BUTTON);
        navRight.setAttribute("id", ElementId.NAV_BUTTON_RIGHT);
        navLeft.setAttribute("type", "button");
        navRight.setAttribute("tabindex", "1");
        navLeft.setAttribute("tabindex", "1");
        navRight.setAttribute("type", "button");
        navLeft.innerHTML = `<svg id="${ElementId.NAV_BUTTON_LEFT}" class="qroll-icon-chevron" xmlns="http://www.w3.org/2000/svg" height="100%" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="${getNavColorFromParentClasses()}" ><path id="${ElementId.NAV_BUTTON_LEFT}" stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>`;
        navRight.innerHTML = `<svg id="${ElementId.NAV_BUTTON_RIGHT}" class="qroll-icon-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3"><path id="${ElementId.NAV_BUTTON_RIGHT}" stroke-linecap="round" stroke-linejoin="round" stroke="${getNavColorFromParentClasses()}" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>`;
        navLeft.classList.add(CssClass.CAROUSEL_NAV_LEFT);
        navRight.classList.add(CssClass.CAROUSEL_NAV_RIGHT);

        const oldNav = grabId(ElementId.HORIZONTAL_NAV);
        if (oldNav) {
            document.body.removeChild(oldNav);
        }

        // nav plots
        if (carouselChildren.length > 0) {
            const nav = spawn(DomElement.NAV);
            nav.setAttribute("id", ElementId.HORIZONTAL_NAV);
            nav.classList.add(CssClass.NAV_HORIZONTAL);

            Array.from(carouselChildren).sort((a, b) => Number((a as HTMLElement).dataset.carouselIndex) - Number((b as HTMLElement).dataset.carouselIndex)).forEach((child, i) => {
                const slideLinkWrapper = spawn(DomElement.DIV);
                slideLinkWrapper.classList.add(CssClass.NAV_HORIZONTAL_ELEMENT_WRAPPER);
                const slideLink = spawn(DomElement.DIV);
                slideLink.setAttribute("tabindex", "1");
                slideLink.dataset.index = (child as HTMLElement).dataset.carouselIndex;
                slideLink.style.background = getNavColorFromParentClasses();
                slideLink.setAttribute("id", `qroll-plot-${i}`);
                slideLink.classList.add(CssClass.PLOT);

                if (state.carousel.currentSlide === i) {
                    slideLink.classList.add(CssClass.PLOT_SELECTED);
                } else {
                    slideLink.classList.remove(CssClass.PLOT_SELECTED);
                }
                const tooltip = spawn(DomElement.DIV);
                tooltip.classList.add(CssClass.TOOLTIP_TOP);
                tooltip.dataset.index = `${i}`;
                const slideTitle = child.querySelectorAll("h1,h2,h3,h4")[0];
                if (slideTitle && slideTitle.textContent) {
                    const fontFamily = getComputedStyle(slideTitle).fontFamily.split(",")[0];
                    tooltip.setAttribute("style", `font-family:${fontFamily || 'Helvetica'}`);
                    tooltip.innerHTML = applyEllipsis(slideTitle.textContent, state.tooltipEllipsisLimit);
                } else {
                    tooltip.setAttribute("style", `font-family:Helvetica`);
                    tooltip.innerHTML = `${i}`;
                }
                [tooltip, slideLink].forEach(el => slideLinkWrapper.appendChild(el));
                nav.appendChild(slideLinkWrapper);
            });
            document.body.appendChild(nav);

            state.carousel.clickRight = () => {
                if (state.carousel.hasLoop) {
                    loopCarouselToTargetIndex(state.carousel.currentSlide + 1, Direction.RIGHT);
                    return;
                }

                if (state.carousel.currentSlide < (state.carousel.htmlElement as HTMLDivElement).children.length - 1) {
                    state.carousel.currentSlide += 1;
                    translateX((grabId(getCurrentSlideId().replace("#", ""))), -state.pageWidth * state.carousel.currentSlide);
                }
            }

            state.carousel.keyRight = () => {
                if (state.carousel.hasLoop) {
                    loopCarouselToTargetIndex(state.carousel.currentSlide + 1, Direction.RIGHT);
                    return;
                }

                if (state.carousel.currentSlide < (state.carousel.htmlElement as HTMLDivElement).children.length - 1) {
                    state.carousel.currentSlide += 1;
                    translateX((grabId(getCurrentSlideId().replace("#", ""))), -state.pageWidth * state.carousel.currentSlide);
                }
            }

            state.carousel.clickLeft = () => {
                if (state.carousel.hasLoop) {
                    loopCarouselToTargetIndex(state.carousel.currentSlide - 1, Direction.LEFT);
                    return;
                }

                if (state.carousel.currentSlide > 0) {
                    state.carousel.currentSlide -= 1;
                    translateX((grabId(getCurrentSlideId().replace("#", ""))), -state.pageWidth * state.carousel.currentSlide);
                }
            }

            state.carousel.keyLeft = () => {
                if (state.carousel.hasLoop) {
                    loopCarouselToTargetIndex(state.carousel.currentSlide - 1, Direction.LEFT);
                    return;
                }

                if (state.carousel.currentSlide > 0) {
                    state.carousel.currentSlide -= 1;
                    translateX((grabId(getCurrentSlideId().replace("#", ""))), -state.pageWidth * state.carousel.currentSlide);
                }
            }

            [navLeft, navRight].forEach(el => document.body.appendChild(el));
        }


    }
    createHorizontalNav();

    //------------------------------------------------------------------------//
    //////////////////////////|                       |/////////////////////////
    //////////////////////////|  DEDUCED CSS CLASSES  |/////////////////////////
    //////////////////////////|                       |/////////////////////////
    //------------------------------------------------------------------------//

    function getCssColor(cssClass: string) {
        const regex = /\[([a-zA-Z]+#[a-fA-F\d]{6}|#[a-fA-F\d]{6}|rgba?\([\d, ]+\)|\b(?:aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgrey|darkgreen|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|grey|green|greenyellow|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgrey|lightgreen|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen)\b)]/;
        const match = regex.exec(cssClass);
        if (match) {
            return match[1];
        } else {
            return 'white';
        }
    }

    function getNavColorFromParentClasses() {
        // adding a color class to the parent, like 'qroll-nav-[rgb(128,211,135)]' or 'qroll-nav-[#6376DD]' or 'qroll-nav-[red]'
        const parentClasses = Array.from(parent.classList);
        const regex = /\bqroll-nav-\[(?:([a-zA-Z]+#[a-fA-F\d]{6}|#[a-fA-F\d]{6}|rgba?\([\d, ]+\)|\b(?:aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgrey|darkgreen|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|grey|green|greenyellow|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgrey|lightgreen|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen)\b)|([a-fA-F\d]{3,4}|[a-fA-F\d]{6}|[a-fA-F\d]{8})]\b)/;

        const colorClass = parentClasses.find(c => regex.test(c));
        return getCssColor(colorClass || "white");
    }


    //------------------------------------------------------------------------//
    //////////////////////////|                       |/////////////////////////
    //////////////////////////|      SLIDE LOGIC      |/////////////////////////
    //////////////////////////|                       |/////////////////////////
    //------------------------------------------------------------------------//

    function getCurrentSlideId() {
        // this need more love
        const location = window?.location
        if (location?.hash) {
            return location?.hash
        }

        return children?.[0]?.id || children?.[1]?.id;
    }

    /** Set the state.carousel from a current slide containing a qroll-carousel css class
     *
     * @param slide - HTMLelement
     */
    function createCarouselIfAny(slide: any) {
        state.carousel = {
            currentSlide: 0,
            currentSlideId: null,
            hasLoop: state.carousel.hasLoop,
            isVisible: false,
            slideCount: 0,
            htmlElement: null,
            clickLeft: () => { },
            clickRight: () => { },
            keyLeft: () => { },
            keyRight: () => { }
        }
        const oldNavLeft = grabId(ElementId.NAV_BUTTON_LEFT);
        const oldNavRight = grabId(ElementId.NAV_BUTTON_RIGHT);
        const oldNavPlots = grabId(ElementId.HORIZONTAL_NAV);

        if (oldNavLeft && oldNavRight) {
            document.body.removeChild(oldNavLeft);
            document.body.removeChild(oldNavRight);
        }
        if (oldNavPlots) {
            document.body.removeChild(oldNavPlots);
        }

        if ((Array.from(slide.classList).includes(CssClass.CAROUSEL))) {
            state.carousel.htmlElement = slide;
            state.carousel.hasLoop = Array.from(slide.classList).includes(CssClass.LOOP);
            state.carousel.isVisible = true;
            state.carousel.slideCount = slide.children.length;

            // get current transform css prop to deduce state.carousel.currentSlide
            state.carousel.currentSlide = Number((state.carousel.htmlElement?.children[0] as HTMLElement).dataset.carouselIndex);

            if (Array.from((state.carousel.htmlElement as HTMLElement).classList).includes(CssClass.SWAP) || !Array.from((state.carousel.htmlElement as HTMLElement).classList).includes(CssClass.LOOP)) {
                const transform = (state.carousel.htmlElement as HTMLElement).style.transform;
                const matches = transform.match(/translateX\((-?\d+)px\)/);
                if (matches && matches.length) {
                    state.carousel.currentSlide = Math.round(Math.abs(Number(matches[1]) / state.pageWidth)) === Infinity ? 0 : Math.round(Math.abs(Number(matches[1]) / state.pageWidth));
                }
            }

            createHorizontalNav();
            updateCarouselButtonState();
        } else {
            state.carousel.htmlElement = null;
            state.carousel.isVisible = false;
            state.carousel.slideCount = 0;
        }
    }

    /** Updates the translateY css property of the Parent 
     * 
     * @param pixels - value in pixels
     */
    function translateY(pixels: number) {
        parent.style.transform = `translateY(${pixels}px)`;
    }

    function translateX(carousel: HTMLElement, pixels: number) {
        carousel.style.transform = `translateX(${pixels}px)`;
    }

    function loopVerticallyFromPlotClick(targetIndex: number) {
        const slidesStep = targetIndex - Number(grabId(getCurrentSlideId().replace("#", "")).dataset.index);
        console.log({ slidesStep })
        if (slidesStep === 0) return;
        if (slidesStep > 0) {
            scrollFromTargetIndex(targetIndex, Direction.DOWN);
        } else {
            scrollFromTargetIndex(targetIndex, Direction.UP);
        }
    }

    function scrollFromTargetIndex(targetIndex: number, direction: ScrollDirection) {
        if (targetIndex > parent.children.length - 1) {
            targetIndex = 0;
        }

        let clones;

        if (direction === Direction.DOWN) {
            clones = reorderArrayByIndex(Array.from(parent.children), targetIndex - 1).map((child: { cloneNode: (arg0: boolean) => any; }) => child.cloneNode(true));
            parent.innerHTML = "";
            clones.forEach((clone: HTMLElement) => {
                parent.appendChild(clone);
            });
            scroll(Direction.DOWN)
        } else if (direction === Direction.UP) {
            clones = reorderArrayByIndex(Array.from(parent.children), targetIndex + 1).map((child: { cloneNode: (arg0: boolean) => any; }) => child.cloneNode(true));
            parent.innerHTML = "";
            clones.forEach((clone: HTMLElement) => {
                parent.appendChild(clone);
            });
            scroll(Direction.UP);
        }
    }


    /** Shuffles the order of slides to create an infinite loop (DOWN & UP directions)
     * 
     * @param direction - scroll direction
     * @returns without executing if a sliding is already in progress
     */
    function scroll(direction: ScrollDirection) {
        toggleBrowserNavigation(false);
        console.log(state.isSliding)

        // other possibility
        if (state.isSliding) return;
        let clone: string | Node;

        if (direction === Direction.DOWN) {
            if (state.isSliding) return;
            state.isSliding = true;
            clone = parent.children[0].cloneNode(true);
            parent.appendChild(clone);
            parent.setAttribute("style", `transform: translateY(-${state.pageHeight}px)`);

            clearTimeout(state.timeoutTransitionY);
            state.timeoutTransitionY = setTimeout(() => {
                parent.removeChild(parent.children[0]);
                parent.classList.remove(`qroll-transition-${state.transitionDuration}`);
                parent.setAttribute("style", "transform: translateX(0)");
                setTimeout(() => {
                    parent.classList.add(`qroll-transition-${state.transitionDuration}`);
                    createCarouselIfAny(parent.children[0]);
                    updateNav(parent.children[0].id)
                }, 100)
            }, state.transitionDuration);

            setTimeout(() => {
                state.isSliding = false
            }, state.transitionDuration)

        } else if (direction === Direction.UP) {
            if (state.isSliding) return;
            state.isSliding = true;
            clone = parent.children[parent.children.length - 1].cloneNode(true);

            clearTimeout(state.timeoutTransitionY);
            state.timeoutTransitionY = setTimeout(() => {
                parent.prepend(clone);
                parent.classList.remove(`qroll-transition-${state.transitionDuration}`);
                parent.setAttribute("style", `transform: translateY(-${state.pageHeight}px)`);
                parent.removeChild(parent.children[parent.children.length - 1]);

                setTimeout(() => {
                    parent.setAttribute("style", "transform: translateY(0)");
                    parent.classList.add(`qroll-transition-${state.transitionDuration}`);
                    createCarouselIfAny(parent.children[0]);
                    updateNav(parent.children[0].id)
                }, 10)
            }, 10)
            console.log(state.isSliding)
            setTimeout(() => {
                state.isSliding = false
            }, state.transitionDuration)
        }
    }


    //------------------------------------------------------------------------//
    //////////////////////////|                       |/////////////////////////
    //////////////////////////|       NAV LOGIC       |/////////////////////////
    //////////////////////////|                       |/////////////////////////
    //------------------------------------------------------------------------//

    function toggleBrowserNavigation(isOn: boolean) {
        setTimeout(() => {
            state.isBrowserNavigation = isOn;
        }, state.transitionDuration)
    }

    /** Scrolls the target slide into view; updates nav & nukeChildren after a timeout
     * 
     * @param slideIndex - int
     */
    function clickVerticalNavLink(slideIndex: number) {
        // make this work like the carousel
        toggleBrowserNavigation(false);

        const targetSlide = Array.from(children).find(child => Number(child.dataset.index) === slideIndex) as HTMLDivElement;
        const currentSlideId = getCurrentSlideId().replace("#", "");
        const currentSlideIndex = Number((Array.from(children).find(child => child.id === currentSlideId) as HTMLDivElement).dataset.index) || 0;
        const positionY = parent.getBoundingClientRect().y;

        if (!state.isLoop) {
            const slidesToScroll = Math.abs(slideIndex - currentSlideIndex);
            state.currentNoLoopSlide = currentSlideIndex + 1;

            if (Number(targetSlide.dataset.index) > currentSlideIndex) {
                for (let i = 0; i < slidesToScroll; i += 1) {
                    scrollWithoutLoop(1, positionY);
                }
            } else {
                for (let i = 0; i < slidesToScroll; i += 1) {
                    scrollWithoutLoop(-1, positionY, slidesToScroll);
                }
            }
            return;
        } else {
            loopVerticallyFromPlotClick(slideIndex);
        }
    }

    /** Reorders the Children starting from the given index and repaint the Parent with the new DOM order
     * 
     * @param slideIndex - integer
     */
    function nukeChildren(slideIndex: number) {
        children = reorderArrayByIndex(Array.from(children), slideIndex);
        parent.innerHTML = "";
        children.forEach(child => parent.appendChild(child));
    }

    /** Updates the hash from the slideId passed as a parameter; update the data-current-slide attribute to highlight the current selected slide
     * 
     * @param slideId - slide-v-{slideId}
     */
    function updateNav(slideId: string) {
        const nav = grabId(ElementId.NAV);
        updateLocation(slideId);
        const thatSlide = Array.from(children).find(child => child.id === slideId);

        if (nav) {
            Array.from(nav.getElementsByTagName(DomElement.A)).map((child: HTMLAnchorElement) => {
                child.dataset.currentSlide = `${child.dataset.index === thatSlide?.dataset.index}`;
            });
        }
    }

    /** Finds the current slide id and updates the nav
     * 
     */
    function updateNavFromCurrentSlideId() {
        let currentSlideId = getCurrentSlideId().replace("#", "");
        updateNav(currentSlideId);
    }

    /** Update location and history
     * 
     * @param slideId - str
     */
    function updateLocation(slideId: string) {
        location.hash = slideId;
        history.replaceState(null, '', location.hash);
    }

    /** Find current slide from hash; update the Children order and the nav
     * 
     */
    function updateOnHashChange() {
        createVerticalNav();
        // TODO: find a way to manage nav when !isLoop
        let currentSlideId = getCurrentSlideId().replace("#", "");
        const currentSlideIndex = Array.from(children).find(child => child.id === currentSlideId)?.dataset.index as unknown as string;
        if (state.isLoop) {
            children = reorderArrayByIndex(Array.from(children), +currentSlideIndex);
            nukeChildren(+currentSlideIndex);
            updateNav(currentSlideId);
        } else {
            translateY(-state.pageHeight * Number(currentSlideIndex));
            updateNav(currentSlideId);
            state.currentNoLoopSlide = +currentSlideIndex + 1
        }
    }

    /** Set active plot depending on active carousel slide
     * 
     */
    function udpateHorizontalNavPlots() {
        const plots = document.getElementsByClassName(CssClass.PLOT);
        Array.from(plots).forEach(plot => {
            plot.classList.remove(CssClass.PLOT_SELECTED);
        });
        if (state.carousel.currentSlide < 0) {
            state.carousel.currentSlide = (state.carousel.htmlElement as HTMLDivElement).children.length - 1;
        }
        plots[state.carousel.currentSlide].classList.add(CssClass.PLOT_SELECTED);
    }

    /** Detect url hash change & update DOM accordingly
     */
    function hashChangeEvent() {
        if (state.isBrowserNavigation) {
            const currentSlideId = getCurrentSlideId().replace("#", "");
            const currentSlideIndex = (Array.from(children).find(child => child.id === currentSlideId) as HTMLDivElement).dataset.index as string;
            if (state.isLoop) {
                nukeChildren(Number(currentSlideIndex));
            } else {
                translateY(-state.pageHeight * Number(currentSlideIndex));
            }
        }
        updateNavFromCurrentSlideId();
    }

    /** Hide carousel buttons when reaching start | end on non-loop mode
     */
    function updateCarouselButtonState() {
        if (!state.carousel.htmlElement || !state.carousel.htmlElement.children.length) return;

        if (Array.from((state.carousel.htmlElement as HTMLElement).classList).includes(CssClass.LOOP)) {
            // buttons will always be visible
            return;
        }

        const buttonRight = grabId(ElementId.NAV_BUTTON_RIGHT);
        const buttonLeft = grabId(ElementId.NAV_BUTTON_LEFT);

        if (state.carousel.currentSlide === (state.carousel.htmlElement as HTMLElement).children.length - 1) {
            // disable right button
            buttonRight.style.opacity = "0";
            buttonRight.style.cursor = "default";
            buttonRight.style.transform = "scale(0,0)";
        } else {
            buttonRight.style.opacity = "1";
            buttonRight.style.cursor = "pointer";
            buttonRight.style.transform = "scale(1,1)"
        }

        if (state.carousel.currentSlide === 0) {
            buttonLeft.style.opacity = "0";
            buttonLeft.style.cursor = "default";
            buttonLeft.style.transform = "scale(0,0)";
        } else {
            buttonLeft.style.opacity = "1";
            buttonLeft.style.cursor = "pointer";
            buttonLeft.style.transform = "scale(1,1)";
        }
    }

    function loopCarouselFromPlotClick(targetIndex: number) {
        const slidesStep = targetIndex - state.carousel.currentSlide;
        if (slidesStep === 0) return;
        if (slidesStep > 0) {
            loopCarouselToTargetIndex(targetIndex, Direction.RIGHT);
        } else {
            loopCarouselToTargetIndex(targetIndex, Direction.LEFT);
        }
    }


    function loopCarouselToTargetIndex(targetIndex: number, direction: ScrollDirection) {
        const carousel = state.carousel.htmlElement as HTMLElement;

        if (state.carousel.currentSlide === targetIndex) return;
        if (targetIndex > carousel.children.length - 1) {
            targetIndex = 0;
        }

        let clones;

        if (Array.from(carousel.classList).includes(CssClass.SWAP)) {
            // swap loop
        } else {
            // Regular loop: order array into a state where a slide by 1 is made possible
            if (direction === Direction.RIGHT) {
                clones = reorderArrayByCarouselIndex(Array.from(carousel.children), targetIndex - 1).map((el: { cloneNode: (arg0: boolean) => any; }) => el.cloneNode(true));
                carousel.innerHTML = "";
                clones.forEach((clone: HTMLElement) => {
                    carousel.appendChild(clone);
                });
                loopCarousel(Direction.RIGHT, targetIndex);

            } else if (direction === Direction.LEFT) {
                clones = reorderArrayByCarouselIndex(Array.from(carousel.children), targetIndex + 1).map((el: { cloneNode: (arg0: boolean) => any; }) => el.cloneNode(true));
                carousel.innerHTML = "";
                clones.forEach((clone: HTMLElement) => {
                    carousel.appendChild(clone);
                });
                loopCarousel(Direction.LEFT, targetIndex);
            }
        }
    }

    function loopCarousel(direction: ScrollDirection, targetIndex: number | undefined = undefined) {

        const carousel = state.carousel.htmlElement as HTMLDivElement;
        // MAYBE GET RID OF THE SWAP ALTOGETHER
        if (Array.from(carousel.classList).includes(CssClass.SWAP)) {
            switch (true) {
                case direction === Direction.RIGHT:
                    const lastDistance = (Array.from(carousel.children).at(-1) as HTMLElement).style.left;

                    for (let i = carousel.children.length - 1; i > 0; i -= 1) {
                        const temp = (carousel.children[i - 1] as HTMLElement).style.left;
                        (carousel.children[i - 1] as HTMLElement).style.left = (carousel.children[i] as HTMLElement).style.left;
                        (carousel.children[i] as HTMLElement).style.left = temp;
                    }
                    (carousel.children[0] as HTMLElement).style.left = lastDistance;

                    if (state.carousel.currentSlide === (state.carousel.htmlElement as HTMLDivElement).children.length - 1) {
                        state.carousel.currentSlide = 0;
                    } else {
                        state.carousel.currentSlide += 1;
                    }

                    break;

                case direction === Direction.LEFT:
                    const firstDistance = (carousel.children[0] as HTMLElement).style.left;

                    for (let i = 0; i < carousel.children.length; i += 1) {
                        const temp = (carousel.children[i] as HTMLElement).style.left;
                        if (i > 0) {
                            (carousel.children[i] as HTMLElement).style.left = (carousel.children[i - 1] as HTMLElement).style.left;
                            (carousel.children[i - 1] as HTMLElement).style.left = temp;
                        }
                    }

                    if (state.carousel.currentSlide === 0) {
                        state.carousel.currentSlide = carousel.children.length - 1;
                    } else {
                        state.carousel.currentSlide -= 1;
                    }

                    (Array.from(carousel.children).at(-1) as HTMLElement).style.left = firstDistance;

                    break;

                default:
                    break;

            }
        } else {
            // normal loop
            let firstSlideClone;
            if (state.isSliding) return;
            state.isSliding = true;

            switch (true) {
                case direction === Direction.RIGHT:
                    firstSlideClone = (carousel.children[0] as HTMLElement).cloneNode(true) as HTMLElement;
                    firstSlideClone.style.visibility = "hidden";
                    carousel.appendChild(firstSlideClone);
                    carousel.setAttribute("style", `transform: translateX(-${state.pageWidth}px)`);

                    clearTimeout(state.timeoutTransitionX);
                    state.timeoutTransitionX = setTimeout(() => {
                        carousel.removeChild(carousel.children[0]);
                        Array.from(carousel.children).forEach((child, i) => {
                            (child as HTMLElement).style.left = `${state.pageWidth * i}px`;
                            (child as HTMLElement).style.left = `${state.pageWidth * i}px`;
                        });
                        carousel.classList.remove(`qroll-transition-${state.transitionDuration}`);
                        carousel.setAttribute("style", `transform: translateX(0)`);
                        if (typeof targetIndex === "number") {
                            state.carousel.currentSlide = targetIndex
                        }
                        setTimeout(() => {
                            (carousel.children[carousel.children.length - 1] as HTMLElement).style.visibility = "initial";
                            state.isSliding = false;
                            carousel.classList.add(`qroll-transition-${state.transitionDuration}`);
                            udpateHorizontalNavPlots();
                        }, 100)
                    }, state.transitionDuration);

                    break;

                case direction === Direction.LEFT:
                    firstSlideClone = (carousel.children[carousel.children.length - 1] as HTMLElement).cloneNode(true) as HTMLElement;
                    firstSlideClone.style.left = `-${state.pageWidth}px`;
                    carousel.prepend(firstSlideClone);
                    carousel.setAttribute("style", `transform: translateX(${state.pageWidth}px)`);

                    clearTimeout(state.timeoutTransitionX);
                    state.timeoutTransitionX = setTimeout(() => {
                        carousel.removeChild(carousel.children[carousel.children.length - 1]);
                        Array.from(carousel.children).forEach((child, i) => {
                            (child as HTMLElement).style.left = `${state.pageWidth * i}px`;
                        });
                        state.isSliding = false;
                        if (typeof targetIndex === "number") {
                            state.carousel.currentSlide = targetIndex
                        }
                        udpateHorizontalNavPlots();
                    }, 10);
                    carousel.setAttribute("style", `transform: translateX(0)`);

                    break;
                default:
                    break;
            }
        }
    }


    //------------------------------------------------------------------------//
    //////////////////////////|                       |/////////////////////////
    //////////////////////////|    EVENT LISTENERS    |/////////////////////////
    //////////////////////////|                       |/////////////////////////
    //------------------------------------------------------------------------//

    /** Translate Y the Parent in case of non looping scroll
     * 
     * @param delta - number, positive will scroll down
     * @param positionY - number, current Y position of the parent
     */
    function scrollWithoutLoop(delta: number, positionY: number, slides: number = 1) {
        toggleBrowserNavigation(false);
        if (delta > 0) {
            if (state.currentNoLoopSlide > children.length - 1) {
                state.currentNoLoopSlide = children.length - 1;
            }
            translateY(-state.pageHeight * state.currentNoLoopSlide);
            state.currentNoLoopSlide += 1;

        } else {
            if (positionY <= -state.pageHeight) {
                translateY(positionY + state.pageHeight * slides);
                state.currentNoLoopSlide -= 1;
                if (state.currentNoLoopSlide < 1) {
                    state.currentNoLoopSlide = 1;
                }
            }
        }
        const activeSlide = Array.from(children).find((_child, i) => i === state.currentNoLoopSlide - 1) as HTMLElement;
        createCarouselIfAny(activeSlide);

        setTimeout(() => {
            state.isSliding = false;
            updateNav(activeSlide.id);
            setTimeout(() => {
                toggleBrowserNavigation(true);
            }, state.transitionDuration)
        }, state.transitionDuration);
    }

    /** Scrolls to the next slide depending on the computed scroll direction
     * 
     * @param event - KeyboardEvent
     * @returns without executing if the target element is a form field; or if the target is a scrollable island element
     */
    function keyboardEvent(event: KeyboardEvent) {
        const keyCode = event.code;
        const target = event.target as HTMLElement;
        const hasVerticalScrollBar = target.scrollHeight > target.clientHeight;
        // FOR LATER: const hasHorizontalScrollBar = event.target.scrollWidth > event.target.clientWidth;

        // ISSUE: tabing to an input located on another slide causes Y offset
        // if (keyCode === "Tab") {
        //     window.scrollTo(0, 0);
        //     document.body.scrollTop = 0;
        // }

        // exclusion cases
        const isInputField = [NodeName.TEXTAREA, NodeName.INPUT].includes(target.nodeName);
        const isScrollableIsland = hasVerticalScrollBar && target.nodeName !== NodeName.BODY;
        if ([isInputField, isScrollableIsland].includes(true)) return;

        const positionY = parent.getBoundingClientRect().y;

        const is = {
            loopDown: [KeyboardCode.ARROW_DOWN, KeyboardCode.SPACE].includes(keyCode) && state.isLoop,
            loopUp: [KeyboardCode.ARROW_UP].includes(keyCode) && state.isLoop,
            noLoopDown: [KeyboardCode.ARROW_DOWN, KeyboardCode.SPACE].includes(keyCode) && !state.isLoop && !state.isSliding,
            noLoopUp: [KeyboardCode.ARROW_UP].includes(keyCode) && !state.isLoop && !state.isSliding
        }

        switch (true) {
            case is.loopDown:
                scroll(Direction.DOWN);
                break;

            case is.noLoopDown:
                state.isSliding = true;
                scrollWithoutLoop(1, positionY);
                break;

            case is.loopUp:
                scroll(Direction.UP);
                break;

            case is.noLoopUp:
                state.isSliding = true;
                scrollWithoutLoop(-1, positionY);
                break;

            default:
                return;
        }
    }

    /** Sets state.eventTouchend to calculate touch direction
     * 
     * @param event - TouchEvent
     */
    function touchendEvent(event: TouchEvent) {
        state.eventTouchEnd = event.changedTouches?.[0] || state.eventTouchEnd;
    }

    /** Executes the scroll depending on a computed touch direction
     * 
     * @param event - MoveEvent
     * @returns without executing if the touch occurs inside a scrollable island element
     */
    function touchMoveEvent(event: MoveEvent) {
        // scroll events inside a scrollable element inside a slide must not trigger sliding
        const hasVerticalScrollBar = event.target.scrollHeight > event.target.clientHeight;
        // FOR LATER: const hasHorizontalScrollBar = event.target.scrollWidth > event.target.clientWidth;

        // exclusion cases
        const isScrollableIsland = !Array.from(event.target.classList).includes(CssClass.CHILD) && hasVerticalScrollBar;
        if ([isScrollableIsland].includes(true)) return;

        const deltaTouchY = (state.eventTouchStart?.clientY - state.eventTouchEnd?.clientY) ?? 0;
        const deltaTouchX = (state.eventTouchStart?.clientX - state.eventTouchEnd?.clientX) ?? 0;
        const positionY = parent.getBoundingClientRect().y;

        const currentSlideId = getCurrentSlideId().replace("#", "");
        const currentSlide = Array.from(children).find(child => child.id === currentSlideId) as HTMLDivElement;

        if (Array.from(currentSlide.classList).includes(CssClass.CAROUSEL)) {
            if (Math.abs(deltaTouchX) > Math.abs(deltaTouchY)) {
                if (deltaTouchX < 0) {
                    if (!state.isSlidingX) {
                        state.isSlidingX = true;
                        state.carousel.keyLeft();
                        udpateHorizontalNavPlots();
                        updateCarouselButtonState();
                        setTimeout(() => {
                            state.isSlidingX = false;
                        }, state.transitionDuration);
                    }
                } else {
                    if (!state.isSlidingX) {
                        state.isSlidingX = true;
                        state.carousel.keyRight();
                        udpateHorizontalNavPlots();
                        updateCarouselButtonState();
                        setTimeout(() => {
                            state.isSlidingX = false;
                        }, state.transitionDuration)
                    }
                }
                return;
            }
        }

        if (!state.isLoop && !state.isSliding) {
            state.isSliding = true;
            scrollWithoutLoop(deltaTouchY, positionY);
            return;
        }

        if (deltaTouchY > 0) {
            scroll(Direction.DOWN);
        } else if (deltaTouchY < 0) {
            scroll(Direction.UP);
        }
    }

    /** Sets state.eventTouchStart to calculate touch direction
     * 
     * @param event - TouchEvent
     */
    function touchstartEvent(event: TouchEvent) {
        state.eventTouchStart = event.changedTouches?.[0] || state.eventTouchStart;
    }

    /** Detects a wheel or a trackpad event, and tames down trackpad excessive scroll behavior.
     * 
     * @param event - MoveEvent
     * @returns without executing if the event occurs inside a scrollable island element
     */
    function wheelEvent(event: MoveEvent) {

        state.isTrackpad = detectTrackPad(event);
        // scroll events inside a scrollable element inside a slide must not trigger sliding
        const hasVerticalScrollBar = event.target.scrollHeight > event.target.clientHeight;
        // FOR LATER: const hasHorizontalScrollBar = event.target.scrollWidth > event.target.clientWidth;

        if (!Array.from(event.target.classList).includes(CssClass.CHILD) && hasVerticalScrollBar) {
            return;
        }

        // WITHOUT SCROLL LOOP
        const positionY = parent.getBoundingClientRect().y;
        if (!state.isLoop && !state.isSliding) {
            state.isSliding = true;
            scrollWithoutLoop(event.deltaY, positionY);
            return;
        }

        // WITH SCROLL LOOP
        if (state.isTrackpad) {
            state.isSliding = false;
            return;
        }

        if (event.deltaY === -0) {
            state.isSliding = false;
            return;
        } // fixes a bug that caused a snap to previous slide on trackpad when finger is lift up

        if (event.deltaY && event.deltaY > 0) {
            if (event.deltaY < state.trackpadSensitivityThreshold) {
                state.isSliding = false;
                return;
            }
            scroll(Direction.DOWN);
        } else {
            if (-event.deltaY < state.trackpadSensitivityThreshold) {
                state.isSliding = false;
                return;
            }
            scroll(Direction.UP);
        }
    }

    const documentEvents: EventTriggerListener[] = [
        { target: document, trigger: EventTrigger.KEYUP, method: keyboardEvent },
        { target: document, trigger: EventTrigger.TOUCHEND, method: touchendEvent },
        { target: document, trigger: EventTrigger.TOUCHMOVE, method: touchMoveEvent },
        { target: document, trigger: EventTrigger.TOUCHSTART, method: touchstartEvent },
        { target: document, trigger: EventTrigger.WHEEL, method: wheelEvent },
        { target: window, trigger: EventTrigger.HASHCHANGE, method: hashChangeEvent },
        { target: window, trigger: EventTrigger.RESIZE, method: resizeEvent },
    ];

    documentEvents.forEach(docEvent => {
        docEvent.target.addEventListener(docEvent.trigger, docEvent.method);
    });

    window.onunload = function () {
        documentEvents.forEach(docEvent => {
            docEvent.target.removeEventListener(docEvent.trigger, docEvent.method);
        });
    }

    window.onload = () => {
        updateOnHashChange();
        const currentSlideId = getCurrentSlideId().replace("#", '');
        const currentSlide = Array.from(children).find(child => child.id === currentSlideId) as HTMLDivElement;

        if ((Array.from(currentSlide.classList).includes(CssClass.CAROUSEL))) {
            state.carousel.htmlElement = currentSlide;
            state.carousel.isVisible = true;
            state.carousel.slideCount = currentSlide.children.length;
            createHorizontalNav();
        } else {
            state.carousel.htmlElement = null;
            state.carousel.isVisible = false;
            state.carousel.slideCount = 0;
            createHorizontalNav();
        }
        updateCarouselButtonState();
    }

    document.addEventListener(EventTrigger.CLICK, (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target) {
            return;
        }
        if (target.id === ElementId.NAV_BUTTON_LEFT) {
            state.carousel.clickLeft();
            udpateHorizontalNavPlots();
            updateCarouselButtonState();
        }
        if (target.id === ElementId.NAV_BUTTON_RIGHT) {
            state.carousel.clickRight();
            udpateHorizontalNavPlots();
            updateCarouselButtonState();
        }
        if (target.id.includes(CssClass.PLOT)) {
            const currentSlide = grabId(getCurrentSlideId().replace("#", ""));
            const index = target.id.replace("qroll-plot-", '');
            const plots = document.getElementsByClassName(CssClass.PLOT);
            Array.from(plots).forEach(plot => {
                plot.classList.remove(CssClass.PLOT_SELECTED);
            })
            target.classList.add(CssClass.PLOT_SELECTED);
            if (state.carousel.hasLoop) {
                loopCarouselFromPlotClick(Number(index));
            } else {
                translateX(currentSlide, -state.pageWidth * Number(index));
                state.carousel.currentSlide = Number(index);
                updateCarouselButtonState();
            }
        }
    });

    document.addEventListener(EventTrigger.KEYUP, (event: KeyboardEvent) => {
        const currentSlide = grabId(getCurrentSlideId().replace("#", ""));
        const hasCarousel = Array.from(currentSlide.classList).includes(CssClass.CAROUSEL);
        if (event.code === KeyboardCode.ARROW_RIGHT && hasCarousel) {
            state.carousel.keyRight();
            udpateHorizontalNavPlots();
            updateCarouselButtonState();
        }
        if (event.code === KeyboardCode.ARROW_LEFT && hasCarousel) {
            state.carousel.keyLeft();
            udpateHorizontalNavPlots();
            updateCarouselButtonState();
        }
    });

}

export default Main;

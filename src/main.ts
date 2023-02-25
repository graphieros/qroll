import { EventTriggerListener, MoveEvent, Options, ScrollDirection } from "../types";
import { CssClass, Direction, ElementId, KeyboardCode, NodeName, EventTrigger, DomElement } from "./constants";
import { applyEllipsis, createUid, detectTrackPad, grabByData, grabId, logError, reorderArrayByIndex, setTabIndex, spawn, walkTheDOM } from "./functions";

// TODO: find a way to include css

// TODO: options:
// > add css class to enable infinite horizontal loop

// IDEA: show icon to turn on/off scroll (basically add or remove the css class on parent)


// ISSUE: using the browser's history previous|next buttons does not update routing to slide in Chrome, Edge, Brave (but does in Firefox)

const Main = (parentName: string, _options: Options = {}) => {

    const state = {
        cssClassTransition: "",
        currentNoLoopSlide: 1,
        eventTouchEnd: null as unknown as Touch,
        eventTouchStart: null as unknown as Touch,
        isBrowserNavigation: false,
        isLoop: Array.from(grabId(ElementId.PARENT).classList).includes(CssClass.LOOP),
        isSliding: false,
        isTrackpad: false,
        pageHeight: (window as Window).innerHeight,
        parentClass: CssClass.PARENT,
        timeoutClassTransition: null as unknown as NodeJS.Timeout | number,
        timeoutDestroySlide: null as unknown as NodeJS.Timeout | number,
        timeoutTransitionY: null as unknown as NodeJS.Timeout | number,
        tooltipEllipsisLimit: 30,
        trackpadSensitivityThreshold: 30,
        transitionDuration: 500,
        userAgent: navigator.userAgent,
    }

    // this needs extra testing for all browsers to check if wheel event makes the scroll work !

    if (state.userAgent.match(/chrome|chromium|crios/i)) {
        state.trackpadSensitivityThreshold = 30;
    } else {
        state.trackpadSensitivityThreshold = 10;
    }

    //------------------------------------------------------------------------//
    //------------------------|    EVENT LISTENERS    |-----------------------//
    //------------------------------------------------------------------------//

    window.onload = () => {
        updateOnHashChange();
    }

    function hashChangeEvent() {
        if (state.isBrowserNavigation) {
            const currentSlideId = getCurrentSlideId().replace("#", "");
            const currentSlideIndex = (Array.from(children).find(child => child.id === currentSlideId) as any).dataset.index;
            if (state.isLoop) {
                nukeChildren(+currentSlideIndex);
            } else {
                translateY(-state.pageHeight * currentSlideIndex);
            }
        }
        updateNavFromCurrentSlideId();
    }

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
        const target: any = event.target;
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

    /** Sets the page height whenever the page is resized
     * 
     * @param event - resize event
     */
    function resizeEvent(event: Event) {
        state.pageHeight = (event.target as Window).innerHeight;
    }

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

        const deltaTouch = (state.eventTouchStart?.clientY - state.eventTouchEnd?.clientY) ?? 0;
        const positionY = parent.getBoundingClientRect().y;

        if (!state.isLoop && !state.isSliding) {
            state.isSliding = true;
            scrollWithoutLoop(deltaTouch, positionY);
            return;
        }

        if (deltaTouch > 0) {
            scroll(Direction.DOWN);
        } else if (deltaTouch < 0) {
            scroll(Direction.UP);
        }
    }

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
        if (state.isTrackpad) return;
        if (event.deltaY === -0) return; // fixes a bug that caused a snap to previous slide on trackpad when finger is lift up

        if (event.deltaY && event.deltaY > 0) {
            if (event.deltaY < state.trackpadSensitivityThreshold) return;
            scroll(Direction.DOWN);
        } else {
            if (-event.deltaY < state.trackpadSensitivityThreshold) return;
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

    //------------------------------------------------------------------------//
    //-------------------------|    DOM CREATION    |-------------------------//
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
        Array.from(element.children).forEach(child => walkTheDOM(child, setTabIndex))
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
            Array.from(children).forEach((child, i) => {
                const slideLinkWrapper = spawn(DomElement.DIV);
                slideLinkWrapper.classList.add(CssClass.NAV_ELEMENT_WRAPPER);
                const slideLink = spawn(DomElement.A);
                slideLink.setAttribute("tabindex", "1");
                slideLink.dataset.index = child.dataset.index;
                slideLink.addEventListener("click", () => clickVerticalNavLink(i));
                slideLink.addEventListener("keyup", (e) => {
                    if ([KeyboardCode.SPACE, KeyboardCode.ENTER].includes(e.key)) {
                        clickVerticalNavLink(i);
                    }
                });
                const span = spawn(DomElement.SPAN);
                span.innerHTML = "●";
                span.style.color = getNavColorFromParentClasses();

                slideLink.appendChild(span);

                const tooltip = spawn(DomElement.DIV) as any;
                tooltip.classList.add(CssClass.TOOLTIP_LEFT);
                tooltip.dataset.index = `${i}`;
                const slideTitle = Array.from(children).find(slide => Number(slide.dataset.index) === i)?.querySelectorAll("h1,h2,h3,h4")[0] as any;
                // TODO: slideTitle could be refined. If no h element is provided, we need to find the first words of the first p or article or whatever

                if (slideTitle) {
                    tooltip.setAttribute("style", `font-family:${getComputedStyle(slideTitle).fontFamily.split(",")[0]}`);
                    tooltip.innerHTML = applyEllipsis(slideTitle.textContent, state.tooltipEllipsisLimit);
                } else {
                    tooltip.setAttribute("style", `font-family:Helvetica`);
                    tooltip.innerHTML = `${i}`;
                }

                tooltip.addEventListener("click", () => clickVerticalNavLink(i));
                [tooltip, slideLink].forEach(el => slideLinkWrapper.appendChild(el));
                nav.appendChild(slideLinkWrapper);
            });

            document.body.appendChild(nav);
        }
    }

    //------------------------------------------------------------------------//
    //---------------------|     DEDUCED CSS CLASSES    |---------------------//
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
        // adding a color class to the parent, like 'kodex-nav-[rgb(128,211,135)]' or 'kodex-nav-[#6376DD]' or 'kodex-nav-[red]'
        const parentClasses = Array.from(parent.classList);
        const regex = /\bkodex-nav-\[(?:([a-zA-Z]+#[a-fA-F\d]{6}|#[a-fA-F\d]{6}|rgba?\([\d, ]+\)|\b(?:aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgrey|darkgreen|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|grey|green|greenyellow|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgrey|lightgreen|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen)\b)|([a-fA-F\d]{3,4}|[a-fA-F\d]{6}|[a-fA-F\d]{8})]\b)/;

        const colorClass = parentClasses.find(c => regex.test(c));
        return getCssColor(colorClass || "white");
    }

    //------------------------------------------------------------------------//
    //-------------------------|    SLIDE LOGIC    |--------------------------//
    //------------------------------------------------------------------------//

    function getCurrentSlideId() {
        // this need more love
        const location = window?.location
        if (location?.hash) {
            return location?.hash
        }

        return children?.[0]?.id || children?.[1]?.id;
    }

    /** Clone the next slide and append | prepend to parent depending on the vertical scroll direction
     * 
     * @param slideId - slide-v-{slideId}
     * @param direction - direction of the scroll
     */
    function duplicateSlide(slideId: string, direction: ScrollDirection) {
        const element = grabByData(slideId)?.cloneNode(true) as HTMLElement; // true also clones innerHTML
        element.dataset.slide = createUid();
        if (direction === Direction.DOWN) {
            parent.appendChild(element as HTMLElement);
        } else if (direction === Direction.UP) {
            parent.prepend(element);
        }
    }

    /** Destroys a slide after a timeout
     * 
     * @param slideId - slide-v-{slideId}
     */
    function destroySlide(slideId: string) {
        if (state.isSliding) {
            clearTimeout(state.timeoutDestroySlide);
            state.timeoutDestroySlide = setTimeout(() => {
                parent.removeChild(grabByData(slideId) as any);
                state.isSliding = false;
            }, state.transitionDuration)
        }
    }

    /** Offsets the parent on Y axis; destroys the old slide; updates location with the current slide
     * 
     * @param slideId - slide-v-{slideId}
     * @param nextSlideId - slide-v-{slideId}
     * @param direction - scroll direction
     */
    function snapSlide(slideId: string, nextSlideId: string, direction: ScrollDirection) {
        if (direction === Direction.DOWN) {
            parent.classList.add(state.cssClassTransition);
            translateY(-state.pageHeight);
            clearTimeout(state.timeoutClassTransition);
            state.timeoutClassTransition = setTimeout(() => parent.classList.remove(state.cssClassTransition), state.transitionDuration - state.transitionDuration * 0.1);
            clearTimeout(state.timeoutTransitionY);
            state.timeoutTransitionY = setTimeout(() => translateY(0), state.transitionDuration);
            destroySlide(slideId);
        } else if (direction === Direction.UP) {
            parent.classList.remove(state.cssClassTransition);
            translateY(-state.pageHeight);
            clearTimeout(state.timeoutClassTransition);
            // TODO: this random small timeout of 50 makes it work with the same apparent speed as the DOWN direction. We need to try other speeds, the make sure 50 / 500 (transitionDuration) is the right proportion, or if can even work this way
            state.timeoutClassTransition = setTimeout(() => parent.classList.add(state.cssClassTransition), 50);
            clearTimeout(state.timeoutTransitionY);
            state.timeoutTransitionY = setTimeout(() => translateY(0), 50);
            destroySlide(slideId);
        }
        const nextSlide = Array.from(children).find(child => child.dataset.slide === nextSlideId) as any;
        if ([Direction.DOWN, Direction.UP].includes(direction)) {
            setTimeout(() => updateNav(nextSlide.id), state.transitionDuration);
            setTimeout(() => {
                toggleBrowserNavigation(true);
            }, state.transitionDuration)
        }
    }

    /** Updates the translateY css property of the Parent 
     * 
     * @param pixels - value in pixels
     */
    function translateY(pixels: number) {
        parent.style.transform = `translateY(${pixels}px)`;
    }

    /** Finds and snapes to the next slide depending on the scroll direction
     * 
     * @param direction - scroll direction
     * @returns without executing if a sliding is already in progress
     */
    function scroll(direction: ScrollDirection) {
        toggleBrowserNavigation(false);

        if (state.isSliding) return;
        const currentSlideId = getCurrentSlideId().replace("#", "");
        const currentSlideIndex = (Array.from(children).find(child => child.id === currentSlideId) as any).dataset.index;

        nukeChildren(+currentSlideIndex);

        state.isSliding = true;
        let firstSlideId = children[0].dataset.slide as any; // scroll down
        let firstSlideNextId = children[1].dataset.slide as any;
        let previousSlideId = children[children.length - 1].dataset.slide as any; // scroll up

        if (direction === Direction.DOWN) {
            duplicateSlide(firstSlideId, direction);
            snapSlide(firstSlideId, firstSlideNextId, direction);
        } else if (direction === Direction.UP) {
            duplicateSlide(previousSlideId, direction);
            snapSlide(previousSlideId, previousSlideId, direction);
        }
    }

    //------------------------------------------------------------------------//
    //--------------------------|    NAV LOGIC    |---------------------------//
    //------------------------------------------------------------------------//

    function toggleBrowserNavigation(isOn: boolean) {
        setTimeout(() => {
            state.isBrowserNavigation = isOn;
        }, state.transitionDuration)
    }

    function restoreInitialSlideOrder() {
        children = reorderArrayByIndex(Array.from(children), 0);
    }

    /** Scrolls the target slide into view; updates nav & nukeChildren after a timeout
     * 
     * @param slideIndex - int
     */
    function clickVerticalNavLink(slideIndex: number) {
        toggleBrowserNavigation(false);

        const targetSlide = Array.from(children).find(child => Number(child.dataset.index) === slideIndex) as any;
        const currentSlideId = getCurrentSlideId().replace("#", "");
        const currentSlideIndex = Number((Array.from(children).find(child => child.id === currentSlideId) as any).dataset.index) || 0;
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
        }

        if (slideIndex === currentSlideIndex + 1) {
            scroll(Direction.DOWN);
            return;
        }
        if (slideIndex === currentSlideIndex - 1) {
            scroll(Direction.UP);
            return;
        }
        restoreInitialSlideOrder();
        targetSlide?.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => {
            updateLocation(targetSlide.id);
            updateNav(targetSlide.id);
            nukeChildren(slideIndex);
            setTimeout(() => {
                toggleBrowserNavigation(true)
            })
        }, state.transitionDuration);
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
            Array.from(nav.getElementsByTagName(DomElement.A)).map((child: any) => {
                child.dataset.currentSlide = child.dataset.index === thatSlide?.dataset.index;
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
     * @param slideId - slide-v-{slideId}
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
}

export default Main;

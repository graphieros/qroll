import { EventTriggerListener, MoveEvent, Options, ScrollDirection } from "../types";
import { CssClass, Direction, ElementId, KeyboardCode, NodeName, EventTrigger } from "./constants";
import { createUid, detectTrackPad, grabByData, grabId, logError, reorderArrayByIndex, setTabIndex, walkTheDOM } from "./functions";

// TODO: find a way to include css

// TODO: options:
// > add css class to enable infinite vertical loop
// > add css class to enable infinite horizontal loop

// ISSUE: using nav to slide up should respect the expected slide order and scroll direction

// ISSUE: using the browser's history previous|next buttons does not update routing to slide

const Main = (parentName: string, _options: Options = {}) => {

    let transitionDuration = 500;
    const parentClass = CssClass.PARENT;
    let isSliding = false;
    let pageHeight = (window as any).innerHeight;
    let eventTouchStart: Touch;
    let eventTouchEnd: Touch;
    let timeoutDestroySlide: any;
    let timeoutClassTransition: any;
    let timeoutTransitionY: any;
    let cssClassTransition: any;
    let isTrackpad = false;

    //------------------------------------------------------------------------//
    //------------------------|    EVENT LISTENERS    |-----------------------//
    //------------------------------------------------------------------------//

    window.onload = () => {
        // createVerticalNav();
        updateOnHashChange();
    }

    function hashChangeEvent() {
        updateNavFromCurrentSlideId();
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

    /** Sets the page height whenever the page is resized
     * 
     * @param event - resize event
     */
    function resizeEvent(event: Event) {
        pageHeight = (event.target as Window).innerHeight;
    }

    function touchendEvent(event: TouchEvent) {
        eventTouchEnd = event.changedTouches?.[0] || eventTouchEnd;
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

        const deltaTouch = (eventTouchStart?.clientY - eventTouchEnd?.clientY) ?? 0;
        if (deltaTouch > 0) {
            scroll(Direction.DOWN);
        } else if (deltaTouch < 0) {
            scroll(Direction.UP);
        }
    }

    function touchstartEvent(event: TouchEvent) {
        eventTouchStart = event.changedTouches?.[0] || eventTouchStart;
    }

    /** Detects a wheel or a trackpad event, and tames down trackpad excessive scroll behavior.
     * 
     * @param event - MoveEvent
     * @returns without executing if the event occurs inside a scrollable island element
     */
    function wheelEvent(event: MoveEvent) {
        isTrackpad = detectTrackPad(event);
        // scroll events inside a scrollable element inside a slide must not trigger sliding
        const hasVerticalScrollBar = event.target.scrollHeight > event.target.clientHeight;
        // FOR LATER: const hasHorizontalScrollBar = event.target.scrollWidth > event.target.clientWidth;
        if (!Array.from(event.target.classList).includes(CssClass.CHILD) && hasVerticalScrollBar) {
            return;
        }
        if (isTrackpad) return;
        if (event.deltaY === -0) return; // fixes a bug that caused a snap to previous slide on trackpad when finger is lift up
        if (event.deltaY && event.deltaY > 0) {
            if (event.deltaY < 7) return; // prevents touchpad excessive scrolling
            scroll(Direction.DOWN);
        } else {
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
            cssClassTransition = CssClass.TRANSITION_300;
            transitionDuration = 300;
            break;
        case Array.from(parent.classList).includes(CssClass.TRANSITION_400):
            cssClassTransition = CssClass.TRANSITION_400;
            transitionDuration = 400;
            break;
        case Array.from(parent.classList).includes(CssClass.TRANSITION_500):
            cssClassTransition = CssClass.TRANSITION_500;
            transitionDuration = 500;
            break;
        case Array.from(parent.classList).includes(CssClass.TRANSITION_600):
            cssClassTransition = CssClass.TRANSITION_600;
            transitionDuration = 600;
            break;
        case Array.from(parent.classList).includes(CssClass.TRANSITION_700):
            cssClassTransition = CssClass.TRANSITION_700;
            transitionDuration = 700;
            break;
        case Array.from(parent.classList).includes(CssClass.TRANSITION_800):
            cssClassTransition = CssClass.TRANSITION_800;
            transitionDuration = 800;
            break;
        case Array.from(parent.classList).includes(CssClass.TRANSITION_900):
            cssClassTransition = CssClass.TRANSITION_900;
            transitionDuration = 900;
            break;
        case Array.from(parent.classList).includes(CssClass.TRANSITION_1000):
            cssClassTransition = CssClass.TRANSITION_1000;
            transitionDuration = 1000;
            break;
        default:
            cssClassTransition = CssClass.TRANSITION_500;
            break;
    }

    parent.classList.add(parentClass);

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
            const oldNav = document.getElementById(ElementId.NAV) as HTMLElement;
            document.body.removeChild(oldNav);
        }
        if (Array.from(parent.classList).includes(CssClass.NAV)) {
            const nav = document.createElement("nav");
            nav.setAttribute("id", ElementId.NAV);
            nav.classList.add("alpra-nav-vertical");
            nav.setAttribute("style", `right:0; top:0; height: ${pageHeight}px; display:flex; align-items:center; justify-content:center; flex-direction: column;`);

            // TODO: find a way to order consistently when scroll occurs
            // TODO: highlight current page link
            Array.from(children).forEach((child, i) => {
                const slideLinkWrapper = document.createElement("DIV");
                slideLinkWrapper.classList.add(CssClass.NAV_ELEMENT_WRAPPER);
                const slideLink = document.createElement("a");
                slideLink.setAttribute("tabindex", "1");
                slideLink.dataset.index = child.dataset.index;
                slideLink.addEventListener("click", () => clickVerticalNavLink(i));
                slideLink.addEventListener("keyup", (e) => {
                    if ([KeyboardCode.SPACE, KeyboardCode.ENTER].includes(e.key)) {
                        clickVerticalNavLink(i);
                    }
                });
                slideLink.innerHTML = "●";
                // tooltip
                const tooltip = document.createElement("DIV") as any;

                tooltip.classList.add(CssClass.TOOLTIP_LEFT);
                tooltip.dataset.index = `${i}`;
                // find a way to get the content of the first h1 or h2 element of the corresponding slide
                // get computed style.fontfamily to apply it to the tooltip
                const slideTitle = Array.from(children).find(slide => Number(slide.dataset.index) === i)?.querySelectorAll("h1,h2,h3")[0] as any;

                tooltip.setAttribute("style", `font-family:${getComputedStyle(slideTitle).fontFamily.split(",")[0]}`);

                if (slideTitle) {
                    tooltip.innerHTML = slideTitle.textContent;
                } else {
                    tooltip.innerHTML = `${i}`;
                }

                tooltip.addEventListener("click", () => clickVerticalNavLink(i));

                slideLinkWrapper.appendChild(tooltip);
                slideLinkWrapper.appendChild(slideLink);
                nav.appendChild(slideLinkWrapper);
            });

            document.body.appendChild(nav);
        }
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
        if (isSliding) {
            clearTimeout(timeoutDestroySlide);
            timeoutDestroySlide = setTimeout(() => {
                parent.removeChild(grabByData(slideId) as any);
                isSliding = false;
            }, transitionDuration)
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
            parent.classList.add(cssClassTransition);
            translateY(-pageHeight);
            clearTimeout(timeoutClassTransition);
            timeoutClassTransition = setTimeout(() => parent.classList.remove(cssClassTransition), transitionDuration - transitionDuration * 0.1);
            clearTimeout(timeoutTransitionY);
            timeoutTransitionY = setTimeout(() => translateY(0), transitionDuration);
            destroySlide(slideId);
            updateLocation(nextSlideId);
        } else if (direction === Direction.UP) {
            parent.classList.remove(cssClassTransition);
            translateY(-pageHeight);
            clearTimeout(timeoutClassTransition);
            // TODO: this random small timeout of 50 makes it work with the same apparent speed as the DOWN direction. We need to try other speeds, the make sure 50 / 500 (transitionDuration) is the right proportion, or if can even work this way
            timeoutClassTransition = setTimeout(() => parent.classList.add(cssClassTransition), 50);
            clearTimeout(timeoutTransitionY);
            timeoutTransitionY = setTimeout(() => translateY(0), 50);
            destroySlide(slideId);
            updateLocation(nextSlideId);
        }
        const nextSlide = Array.from(children).find(child => child.dataset.slide === nextSlideId) as any;
        if ([Direction.DOWN, Direction.UP].includes(direction)) {
            setTimeout(() => updateNav(nextSlide.id), 600);
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
        if (isSliding) return;
        const currentSlideId = getCurrentSlideId().replace("#slide-v-", "");

        nukeChildren(+currentSlideId);

        isSliding = true;
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


    function restoreInitialSlideOrder() {
        children = reorderArrayByIndex(Array.from(children), 0);
    }

    /** Scrolls the target slide into view; updates nav & nukeChildren after a timeout
     * 
     * @param slideId - slide-v-{slideId}
     */
    function clickVerticalNavLink(slideId: number) {
        const targetSlide = Array.from(children).find(child => Number(child.dataset.index) === slideId) as any;
        const currentSlideIndex = Number(getCurrentSlideId().replace("#slide-v-", ""));

        if (slideId === currentSlideIndex + 1) {
            scroll(Direction.DOWN);
            return;
        }
        if (slideId === currentSlideIndex - 1) {
            scroll(Direction.UP);
            return;
        }
        restoreInitialSlideOrder();
        targetSlide?.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => {
            location.hash = targetSlide.id;
            updateNav(targetSlide.id);
            nukeChildren(slideId);
        }, transitionDuration);
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
        const nav = document.getElementById(ElementId.NAV);
        location.hash = slideId;
        const thatSlide = Array.from(children).find(child => child.id === slideId);

        if (nav) {
            Array.from(nav.getElementsByTagName("a")).map((child: any) => {
                child.dataset.currentSlide = child.dataset.index === thatSlide?.dataset.index;
            });
        }
    }

    /** Finds the current slide id and updates the nav
     * 
     */
    function updateNavFromCurrentSlideId() {
        let currentSlideId = getCurrentSlideId();
        if (currentSlideId.includes("#")) {
            currentSlideId = currentSlideId.replace("#", "");
        }
        updateNav(currentSlideId)
    }

    /** Update location and history
     * 
     * @param slideId - slide-v-{slideId}
     */
    function updateLocation(slideId: string) {
        const url = location.href;
        location.href = `#${slideId}`;
        history.replaceState(null, '', url);
    }

    /** Find current slide from hash; update the Children order and the nav
     * 
     */
    function updateOnHashChange() {
        createVerticalNav();
        let currentSlideId = getCurrentSlideId();
        if (currentSlideId.includes("#")) {
            currentSlideId = currentSlideId.replace("#", "");
        }
        const currentSlideIndex = Array.from(children).find(child => child.id === currentSlideId)?.dataset.index as unknown as string;
        children = reorderArrayByIndex(Array.from(children), +currentSlideIndex);
        nukeChildren(+currentSlideIndex);
        updateNav(currentSlideId);
    }
}

export default Main;

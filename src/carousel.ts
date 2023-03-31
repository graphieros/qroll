import { ScrollDirection, State } from "../types";
import { CssClass, CssDisplay, CssUnit, CssVisibility, Direction, DomElement, ElementAttribute, EventTrigger, KeyboardCode, NodeName, Svg } from "./constants";
import { detectTrackPad, grabId, walkTheDOM, setTabIndex, spawn, updateLocation, applyEllipsis, createUid } from "./functions";

export function togglePlayState({
    state,
    hCarousel,
    buttonPlayPause,
    buttonRight,
    buttonLeft,
    uid
}: { state: State, hCarousel: any, buttonPlayPause: HTMLElement, buttonRight: HTMLElement, buttonLeft: HTMLElement, uid: string }) {
    const status = hCarousel.dataset.autoSlide;
    if (status === "true") {
        hCarousel.dataset.autoSlide = "false";
        buttonPlayPause.innerHTML = Svg.PLAY;
    } else {
        hCarousel.dataset.autoSlide = "true";
        buttonPlayPause.innerHTML = Svg.PAUSE;
    }
    playPause({ carousel: hCarousel, buttonRight, buttonLeft, uid, state });
}

export function playPause({ carousel, buttonRight, buttonLeft, uid, state }: { carousel: HTMLElement, buttonRight: HTMLElement, buttonLeft: HTMLElement, uid: string, state: State }) {
    const direction = carousel.dataset.direction || Direction.RIGHT;
    const duration = Number(carousel.dataset.timer) || 5000;
    const thisInterval = state.intervals.find(i => i.id === uid);

    if (carousel.dataset.autoSlide === "false") {
        clearInterval(thisInterval.interval);
        thisInterval.interval = null;
    } else {
        const interval = setInterval(() => {
            if (direction === Direction.RIGHT) {
                buttonRight.click();
            } else {
                buttonLeft.click();
            }
        }, duration);
        thisInterval.interval = interval;
    }
}

export function slideComponentToDirection(state: State, direction: ScrollDirection, component: HTMLElement) {
    if (state.isSliding && component.dataset.autoSlide !== "true") {
        return;
    }
    if (component.dataset.autoSlide !== "true") {
        state.isSliding = true;
    }
    const hSlides = component.getElementsByClassName("qroll-carousel-component-horizontal-slide");
    const vSlides = component.getElementsByClassName("qroll-carousel-component-vertical-slide");
    const currentIndex = Number(component.dataset.carouselIndex);
    let nextIndex = 0;

    if ([Direction.RIGHT, Direction.LEFT].includes(direction)) {
        Array.from(hSlides).forEach((slide, i) => {
            (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
            if (direction === Direction.RIGHT) {
                nextIndex = currentIndex + 1 > hSlides.length - 1 ? 0 : currentIndex + 1;
                if (i === nextIndex) {
                    (slide as HTMLElement).classList.remove(CssClass.NO_TRANSITION);
                    (slide as HTMLElement).style.transform = `translateX(0)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.INITIAL;
                } else if (i === currentIndex) {
                    (slide as HTMLElement).classList.remove(CssClass.NO_TRANSITION);
                    (slide as HTMLElement).style.transform = `translateX(-100%)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                } else {
                    (slide as HTMLElement).style.transform = `translateX(100%)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                }

            } else if (direction === Direction.LEFT) {
                nextIndex = currentIndex - 1 < 0 ? hSlides.length - 1 : currentIndex - 1;
                if (i === nextIndex) {
                    (slide as HTMLElement).classList.remove(CssClass.NO_TRANSITION);
                    (slide as HTMLElement).style.transform = `translateX(0)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.INITIAL;
                } else if (i === currentIndex) {
                    (slide as HTMLElement).classList.remove(CssClass.NO_TRANSITION);
                    (slide as HTMLElement).style.transform = `translateX(100%)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                } else {
                    (slide as HTMLElement).style.transform = `translateX(-100%)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                }
            }

            component.dataset.carouselIndex = String(nextIndex);
            setTimeout(() => {
                state.isSliding = false;
            }, state.transitionDuration);
        });
    } else if ([Direction.UP, Direction.DOWN].includes(direction)) {

        Array.from(vSlides).forEach((slide, i) => {
            (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
            if (direction === Direction.DOWN) {
                nextIndex = currentIndex + 1 > vSlides.length - 1 ? 0 : currentIndex + 1;
                if (i === nextIndex) {
                    (slide as HTMLElement).classList.remove(CssClass.NO_TRANSITION);
                    (slide as HTMLElement).style.transform = `translateY(0)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.INITIAL;
                } else if (i === currentIndex) {
                    (slide as HTMLElement).classList.remove(CssClass.NO_TRANSITION);
                    (slide as HTMLElement).style.transform = `translateY(-100%)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                } else {
                    (slide as HTMLElement).style.transform = `translateY(100%)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                }
            } else if (direction === Direction.UP) {
                nextIndex = currentIndex - 1 < 0 ? vSlides.length - 1 : currentIndex - 1;
                if (i === nextIndex) {
                    (slide as HTMLElement).classList.remove(CssClass.NO_TRANSITION);
                    (slide as HTMLElement).style.transform = `translateY(0)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.INITIAL;
                } else if (i === currentIndex) {
                    (slide as HTMLElement).classList.remove(CssClass.NO_TRANSITION);
                    (slide as HTMLElement).style.transform = `translateY(100%)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                } else {
                    (slide as HTMLElement).style.transform = `translateY(-100%)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                }
            }
            component.dataset.carouselIndex = String(nextIndex);
            setTimeout(() => {
                state.isSliding = false;
            }, state.transitionDuration);
        })
    }

}

export function createCarouselComponents(state: State) {
    // use parent instead of slide ?
    // add an auto slide prop ?
    // horizontal
    const horizontalCarousels = document.getElementsByClassName("qroll-carousel-component-horizontal");
    const verticalCarousels = document.getElementsByClassName("qroll-carousel-component-vertical");

    Array.from(verticalCarousels).forEach((vCarousel, _i) => {
        (vCarousel as HTMLElement).dataset.carouselIndex = "0";
        const children = vCarousel.children;

        Array.from(children).forEach((child, j) => {
            (child as HTMLElement).dataset.index = String(j);
            (child as HTMLElement).classList.add(CssClass.NO_TRANSITION);
            (child as HTMLElement).classList.add("qroll-carousel-component-vertical-slide");
            if (j === children.length - 1) {
                (child as HTMLElement).style.transform = `translateY(-100%)`;
            } else if (j === 0) {
                (child as HTMLElement).style.transform = `translateY(0)`;
            } else {
                (child as HTMLElement).style.transform = `translateY(100%)`;
            }
        });

        const slides = Array.from(vCarousel.children).filter((child) => Array.from((child as HTMLElement).classList).includes("qroll-carousel-component-vertical-slide"));
        const widths = Array.from(slides).map(child => {
            return Number(window.getComputedStyle(child as HTMLElement).width.replace("px", ""));
        });
        const heights = Array.from(slides).map(child => {
            return Number(window.getComputedStyle(child as HTMLElement).height.replace("px", ""));
        });
        const maxContentWidth = Math.max(...widths);
        const maxContentHeight = Math.max(...heights);
        (vCarousel as HTMLElement).style.width = `${maxContentWidth}px`;
        (vCarousel as HTMLElement).style.height = `${maxContentHeight}px`;

        const buttonTop = spawn(DomElement.BUTTON);
        const buttonDown = spawn(DomElement.BUTTON);
        buttonTop.classList.add("qroll-component-button-top");
        buttonDown.classList.add("qroll-component-button-down");
        buttonTop.innerHTML = Svg.CHEVRON_TOP;
        buttonDown.innerHTML = Svg.CHEVRON_DOWN;

        buttonTop.addEventListener(EventTrigger.CLICK, () => slideComponentToDirection(state, Direction.UP, vCarousel as HTMLElement));
        buttonDown.addEventListener(EventTrigger.CLICK, () => slideComponentToDirection(state, Direction.DOWN, vCarousel as HTMLElement));

        [buttonTop, buttonDown].forEach(el => vCarousel.appendChild(el));

        // TODO: click to pause or pause/play button
        // refactor togglePlayState & playPause methods to make it work with both V & H

        if ((vCarousel as HTMLElement).dataset.autoSlide === "true") {
            const autoDirection = (vCarousel as HTMLElement).dataset.direction || Direction.DOWN;
            const duration = Number((vCarousel as HTMLElement).dataset.timer) || 5000;
            setInterval(() => {
                if (autoDirection === Direction.DOWN) {
                    buttonDown.click();
                } else {
                    buttonTop.click();
                }
            }, duration)
        }
    });

    Array.from(horizontalCarousels).forEach((hCarousel, _i) => {
        (hCarousel as HTMLElement).dataset.carouselIndex = "0";
        const children = hCarousel.children;

        Array.from(children).forEach((child, j) => {
            (child as HTMLElement).dataset.index = String(j);
            (child as HTMLElement).classList.add(CssClass.NO_TRANSITION);
            (child as HTMLElement).classList.add("qroll-carousel-component-horizontal-slide");
            if (j === children.length - 1) {
                (child as HTMLElement).style.transform = `translateX(-100%)`;
            } else if (j === 0) {
                (child as HTMLElement).style.transform = "translateX(0)";
            } else {
                (child as HTMLElement).style.transform = `translateX(100%)`;
            }
        });

        const slides = Array.from(hCarousel.children).filter((child) => Array.from((child as HTMLElement).classList).includes("qroll-carousel-component-horizontal-slide"));

        const heights = Array.from(slides).map(child => {
            return Number(window.getComputedStyle(child as HTMLElement).height.replace("px", ""));
        });
        const maxContentHeight = Math.max(...heights);
        (hCarousel as HTMLElement).style.height = `${maxContentHeight}px`;


        const buttonLeft = spawn(DomElement.BUTTON);
        const buttonRight = spawn(DomElement.BUTTON);
        buttonLeft.classList.add("qroll-component-button-left");
        buttonRight.classList.add("qroll-component-button-right");
        buttonLeft.innerHTML = Svg.CHEVRON_LEFT;
        buttonRight.innerHTML = Svg.CHEVRON_RIGHT;

        buttonRight.addEventListener(EventTrigger.CLICK, () => slideComponentToDirection(state, Direction.RIGHT, hCarousel as HTMLElement));
        buttonLeft.addEventListener(EventTrigger.CLICK, () => slideComponentToDirection(state, Direction.LEFT, hCarousel as HTMLElement));

        const buttonPlayPause = spawn(DomElement.BUTTON);
        buttonPlayPause.classList.add("qroll-component-button-play");
        buttonPlayPause.innerHTML = Svg.PAUSE;
        if (!(hCarousel as HTMLElement).dataset.autoSlide) {
            buttonPlayPause.style.display = "none";
        }

        const uid = createUid();
        state.intervals.push({
            id: uid,
            interval: null
        });

        if ((hCarousel as HTMLElement).dataset.autoSlide === "true") {
            playPause({
                carousel: hCarousel as HTMLElement,
                buttonRight,
                buttonLeft,
                uid,
                state
            });
        }

        buttonPlayPause.addEventListener(EventTrigger.CLICK, () => togglePlayState({
            hCarousel,
            buttonPlayPause,
            buttonRight,
            buttonLeft,
            uid,
            state
        }));

        [buttonLeft, buttonRight, buttonPlayPause].forEach(el => hCarousel.appendChild(el));
    })
}

/** Set up horizontal slides' translateX and visibility propreties based on the current horizontal index
 * 
 * @param state - the main state object
 * @param carousel - A direct child of the main parent Element
 */
export function setupHorizontalSlides(state: State, carousel: HTMLElement) {
    const parent = carousel.getElementsByClassName(CssClass.CAROUSEL_WRAPPER)[0];
    const slides = Array.from(parent.children).filter(slide => (Array.from(slide.classList).includes(CssClass.CAROUSEL_SLIDE)));
    const currentHIndex = Number((parent as HTMLElement).dataset.carouselIndex);

    slides.forEach((slide, i) => {
        (slide as HTMLElement).style.width = `${state.pageWidth}px`;
        if (i === currentHIndex) {
            (slide as HTMLElement).style.transform = "translateX(0)";
            (slide as HTMLElement).style.visibility = CssVisibility.INITIAL;
        } else if (i === (currentHIndex - 1 < 0 ? slides.length - 1 : currentHIndex - 1)) {
            (slide as HTMLElement).style.transform = `translateX(-${state.pageWidth}px)`;
        } else if (i === (currentHIndex + 1 > slides.length - 1 ? 0 : currentHIndex + 1)) {
            (slide as HTMLElement).style.transform = `translateX(${state.pageWidth}px)`;
        } else if (i > currentHIndex) {
            (slide as HTMLElement).style.transform = `translateX(${state.pageWidth}px)`;
        } else if (i < currentHIndex) {
            (slide as HTMLElement).style.transform = `translateX(-${state.pageWidth}px)`;
        }
    });

    setTimeout(() => {
        slides.forEach(slide => {
            (slide as HTMLElement).classList.remove(CssClass.NO_TRANSITION);
        });
    });
}

/** Update states of links & nav buttons on a carousel
 * 
 * @param carousel - A direct child of the main parent Element
 */
export function updateCarouselNav(carousel: HTMLElement) {
    const carouselWrapper = carousel.getElementsByClassName(CssClass.CAROUSEL_WRAPPER)[0];
    if (!carouselWrapper) return;
    const currentIndex = Number((carouselWrapper as HTMLElement).dataset.carouselIndex);
    const nav = carousel.getElementsByClassName(CssClass.NAV_HORIZONTAL)[0];
    const links = nav.children;
    Array.from(links).forEach((link, i) => {
        if (i === currentIndex) {
            link.classList.add(CssClass.NAV_LINK_SELECTED);
        } else {
            link.classList.remove(CssClass.NAV_LINK_SELECTED);
        }
    });
    const buttonLeft = carousel.getElementsByClassName(CssClass.NAV_BUTTON_LEFT)[0];
    const buttonRight = carousel.getElementsByClassName(CssClass.NAV_BUTTON_RIGHT)[0];

    if (!Array.from((carousel as HTMLElement).classList).includes(CssClass.LOOP)) {
        if (currentIndex === 0 && buttonLeft) {
            (buttonLeft as HTMLElement).style.display = CssDisplay.NONE;
        } else {
            (buttonLeft as HTMLElement).style.display = CssDisplay.FLEX;
        }
        if (currentIndex === links.length - 1 && buttonRight) {
            (buttonRight as HTMLElement).style.display = CssDisplay.NONE;
        } else {
            (buttonRight as HTMLElement).style.display = CssDisplay.FLEX;
        }
    }
}

/** Change a slide into a carousel
 * 
 * @param state - The global state object declared in main
 * @param carousel - HTMLElement, must be a direct child of the main Parent element
 */
export function createCarousel(state: State, carousel: HTMLElement) {
    if (!carousel) return;
    if (!(Array.from(carousel.classList).includes(CssClass.CAROUSEL))) return;

    const carouselSlides = carousel.children as unknown as HTMLElement[];
    const slideCount = carouselSlides.length - 1;

    const carouselWrapper = spawn(DomElement.DIV);
    carouselWrapper.classList.add(CssClass.CAROUSEL_WRAPPER);
    (carouselWrapper as HTMLElement).dataset.carouselIndex = "0";

    Array.from(carouselSlides).forEach((element, i) => {
        element.classList.add(CssClass.CAROUSEL_SLIDE);
        element.setAttribute(ElementAttribute.ID, element.id || `slide-h-${i}-${carousel.id}`);
        element.style.width = `${state.pageWidth}${CssUnit.PX}`;

        if (i === 0) {
            element.style.transform = 'translateX(0)';
        } else if (i === slideCount) {
            element.style.transform = `translateX(-${state.pageWidth}px)`;
            element.style.visibility = CssVisibility.HIDDEN;
        } else {
            element.style.transform = `translateX(${state.pageWidth}px)`;
            element.style.visibility = CssVisibility.HIDDEN;
        }

        element.dataset.carouselIndex = `${i}`;
        Array.from(element.children).forEach(child => walkTheDOM(child, setTabIndex));
        carouselWrapper.appendChild(element);
    });

    carousel.innerHTML = "";
    carousel.appendChild(carouselWrapper);

    // NAV
    const nav = spawn(DomElement.DIV);
    nav.classList.add(CssClass.NAV_HORIZONTAL);
    nav.dataset.slideIndex = carousel.dataset.index;

    const slides = Array.from(carousel.getElementsByClassName(CssClass.CAROUSEL_WRAPPER)[0].children);

    slides.filter(child => Array.from(child.classList).includes(CssClass.CAROUSEL_SLIDE)).forEach((slide, i) => {
        const link = spawn(DomElement.BUTTON);
        link.setAttribute(ElementAttribute.TABINDEX, "1");
        link.classList.add(CssClass.NAV_LINK);
        if (i === Number((carouselWrapper as HTMLElement).dataset.carouselIndex)) {
            link.classList.add(CssClass.NAV_LINK_SELECTED);
        } else {
            link.classList.remove(CssClass.NAV_LINK_SELECTED);
        }
        link.dataset.linkIndex = `${i}`;
        link.addEventListener(EventTrigger.CLICK, () => slideTo(i));

        const tooltip = spawn(DomElement.DIV);
        tooltip.classList.add(CssClass.TOOLTIP_TOP);
        tooltip.classList.add(CssClass.NO_TRANSITION);
        tooltip.dataset.index = `${i}`;
        const slideTitle = slide.querySelectorAll("h1,h2,h3,h4,h5,h6")[0];

        if ((slide as HTMLElement).dataset.title) {
            (tooltip as any).innerHTML = (slide as HTMLElement).dataset.title;
        } else if (slideTitle && slideTitle.textContent) {
            tooltip.setAttribute(ElementAttribute.STYLE, `font-family:${getComputedStyle(slideTitle).fontFamily.split(",")[0]}`);
            tooltip.innerHTML = applyEllipsis(slideTitle.textContent, state.tooltipEllipsisLimit);
        } else {
            tooltip.setAttribute(ElementAttribute.STYLE, `font-family:Helvetica`);
            tooltip.innerHTML = `${i}`;
        }

        if ((carousel as HTMLElement).dataset.tooltipCss) {
            tooltip.setAttribute(ElementAttribute.STYLE, (slide as HTMLElement).dataset.tooltipCss || "");
        }

        if (Array.from(carousel.classList).includes(CssClass.TOOLTIP)) {
            link.appendChild(tooltip);
        }

        nav.appendChild(link);
    });

    const buttonRight = spawn(DomElement.BUTTON);
    const buttonLeft = spawn(DomElement.BUTTON);
    buttonRight.classList.add(CssClass.NAV_BUTTON_RIGHT);
    buttonLeft.classList.add(CssClass.NAV_BUTTON_LEFT);
    buttonRight.innerHTML = Svg.CHEVRON_RIGHT;
    buttonLeft.innerHTML = Svg.CHEVRON_LEFT;

    function slideTo(index: number) {
        const currentIndex = Number((carouselWrapper as HTMLElement).dataset.carouselIndex);
        const nextIndex = index;

        if (state.isSliding) return;
        state.isSliding = true;

        if (currentIndex === nextIndex) {
            state.isSliding = false;
            return;
        };

        if (nextIndex > currentIndex) {
            // slide right
            slides.forEach((slide, i) => {
                if (i === nextIndex) {
                    (slide as HTMLElement).style.transform = "translateX(0)";
                } else if (i > nextIndex) {
                    (slide as HTMLElement).style.transform = `translateX(${state.pageWidth}px)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                } else if (i < nextIndex) {
                    (slide as HTMLElement).style.transform = `translateX(-${state.pageWidth}px)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                }
                else if (i === currentIndex) {
                    (slide as HTMLElement).style.transform = `translateX(-${state.pageWidth}px)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                } else if (i === (nextIndex + 1 > slides.length - 1 ? 0 : nextIndex + 1)) {
                    (slide as HTMLElement).style.transform = `translateX(${state.pageWidth}px)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                }
            });

            (slides[nextIndex] as HTMLElement).style.visibility = CssVisibility.INITIAL;
            carouselWrapper.dataset.carouselIndex = String(nextIndex);
            updateCarouselNav(carousel);
            updateLocation(`${carousel.id}/${nextIndex}`);

            setTimeout(() => {
                state.isSliding = false;
                state.wheelCount = 0;
            }, state.transitionDuration);
        } else {
            // slide left
            slides.forEach((slide, i) => {
                if (i === nextIndex) {
                    (slide as HTMLElement).style.transform = "translateX(0)";
                } else if (i > nextIndex) {
                    (slide as HTMLElement).style.transform = `translateX(${state.pageWidth}px)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                } else if (i < nextIndex) {
                    (slide as HTMLElement).style.transform = `translateX(-${state.pageWidth}px)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                } else if (i === currentIndex) {
                    (slide as HTMLElement).style.transform = `translateX(${state.pageWidth}px)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                } else if (i === (nextIndex - 1 < 0 ? slides.length - 1 : nextIndex - 1)) {
                    (slide as HTMLElement).style.transform = `translateX(-${state.pageWidth}px)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                }
            });

            (slides[nextIndex] as HTMLElement).style.visibility = CssVisibility.INITIAL;
            carouselWrapper.dataset.carouselIndex = String(nextIndex);
            updateCarouselNav(carousel);
            updateLocation(`${carousel.id}/${nextIndex}`);

            setTimeout(() => {
                state.isSliding = false;
                state.wheelCount = 0;
            }, state.transitionDuration);
        }
    }

    function slideRight() {
        if (state.isSliding) return;
        state.isSliding = true;

        const currentIndex = Number((carouselWrapper as HTMLElement).dataset.carouselIndex);
        const nextIndex = currentIndex + 1 > slides.length - 1 ? 0 : currentIndex + 1;

        slides.forEach((slide, i) => {
            if (i === nextIndex) {
                (slide as HTMLElement).style.transform = "translateX(0)";
            }
            if (i === currentIndex) {
                (slide as HTMLElement).style.transform = `translateX(-${state.pageWidth}px)`;
                (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
            }
            if (i === (nextIndex + 1 > slides.length - 1 ? 0 : nextIndex + 1)) {
                (slide as HTMLElement).style.transform = `translateX(${state.pageWidth}px)`;
                (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
            }
        });

        (slides[nextIndex] as HTMLElement).style.visibility = CssVisibility.INITIAL
        carouselWrapper.dataset.carouselIndex = String(nextIndex);
        updateCarouselNav(carousel);
        updateLocation(`${carousel.id}/${nextIndex}`);

        setTimeout(() => {
            state.isSliding = false;
            state.wheelCount = 0;
        }, state.transitionDuration)
    }

    function slideLeft() {
        if (state.isSliding) return;
        state.isSliding = true;

        const currentIndex = Number((carouselWrapper as HTMLElement).dataset.carouselIndex);
        const nextIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;

        slides.forEach((slide, i) => {
            if (i === nextIndex) {
                (slide as HTMLElement).style.transform = "translateX(0)";
            }
            if (i === currentIndex) {
                (slide as HTMLElement).style.transform = `translateX(${state.pageWidth}px)`;
                (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
            }
            if (i === (nextIndex - 1 < 0 ? slides.length - 1 : nextIndex - 1)) {
                (slide as HTMLElement).style.transform = `translateX(-${state.pageWidth}px)`;
                (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
            }
        });

        (slides[nextIndex] as HTMLElement).style.visibility = CssVisibility.INITIAL;
        carouselWrapper.dataset.carouselIndex = String(nextIndex);
        updateCarouselNav(carousel);
        updateLocation(`${carousel.id}/${nextIndex}`);

        setTimeout(() => {
            state.isSliding = false;
            state.wheelCount = 0;
        }, state.transitionDuration)
    }

    buttonRight.addEventListener(EventTrigger.CLICK, slideRight);
    buttonLeft.addEventListener(EventTrigger.CLICK, slideLeft);

    carousel.appendChild(buttonRight);
    carousel.appendChild(buttonLeft);
    carousel.appendChild(nav);

}

/** Set up slides' translateY & zIndex properties based on the current vertical index 
 * 
 * @param state - main state object
 * @param parent - The main parent element
 */
export function setupVerticalSlides(state: State, parent: HTMLElement) {
    const children = Array.from(parent.children).filter(child => Array.from(child.classList).includes(CssClass.SLIDE));

    Array.from(children).forEach((child, i) => {
        if (i === Number((parent as HTMLElement).dataset.currentVIndex)) {
            (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(0);`);
            (child as HTMLElement).style.zIndex = "1";
        } else {
            (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(${i < Number((parent as HTMLElement).dataset.currentVIndex) ? "-" : ""}${state.pageHeight}px)`);
            (child as HTMLElement).style.zIndex = "0";
            (child as HTMLElement).style.visibility = CssVisibility.HIDDEN;
        }
    });
}

/** Generate slide layout and event listeners
 * 
 * @param state - main state object
 * @param parent - The main parent element
 */
export function createMainLayout(state: State, parent: HTMLElement) {
    (parent as HTMLElement).dataset.currentVIndex = "0";
    (parent as HTMLElement).classList.add(CssClass.CAROUSEL_VERTICAL);

    const children = parent.children;
    state.pageHeight = window.innerHeight;

    Array.from(children).forEach((child, i) => {
        (child as HTMLElement).dataset.vIndex = `${i}`;
        (child as HTMLElement).classList.add(CssClass.SLIDE);
    });

    const slides = Array.from(children).filter(child => Array.from(child.classList).includes(CssClass.SLIDE));

    const buttonTop = spawn(DomElement.BUTTON);
    const buttonBottom = spawn(DomElement.BUTTON);
    buttonTop.setAttribute(ElementAttribute.TABINDEX, "1");
    buttonBottom.setAttribute(ElementAttribute.TABINDEX, "1");
    buttonTop.setAttribute(ElementAttribute.TYPE, DomElement.BUTTON);
    buttonBottom.setAttribute(ElementAttribute.TYPE, DomElement.BUTTON);
    buttonTop.classList.add(CssClass.NAV_BUTTON_TOP);
    buttonBottom.classList.add(CssClass.NAV_BUTTON_DOWN);

    function slideTo({
        isWheel = false,
        direction = undefined,
        targetIndex = undefined,
        skipHistory = false }:
        {
            isWheel?: boolean,
            direction?: String | undefined,
            targetIndex?: number | undefined,
            skipHistory?: boolean
        }
    ) {
        let differenceToTarget,
            targetDirection,
            isOverflowNext,
            isOverflowPrevious;

        const currentVIndex = Number((parent as HTMLElement).dataset.currentVIndex);

        if (targetIndex !== undefined) {
            isOverflowNext = targetIndex + 1 > slides.length - 1;
            isOverflowPrevious = targetIndex - 1 < 0;
        }

        if (!state.isLoop && isWheel) {
            if (currentVIndex === 0 && isOverflowNext) {
                state.isSliding = false;
                return;
            }
            if (currentVIndex === slides.length - 1 && isOverflowPrevious) {
                state.isSliding = false;
                return;
            }
        }

        if (targetIndex !== undefined) {
            differenceToTarget = currentVIndex - targetIndex;

            if (differenceToTarget === 0) {
                state.isSliding = false;
                return;
            };
            targetDirection = differenceToTarget > 0 ? Direction.DOWN : Direction.UP;

            switch (true) {
                case targetDirection === Direction.UP && isOverflowNext:
                    (parent as HTMLElement).dataset.currentVIndex = `0`;
                    break;

                case targetDirection === Direction.UP:
                    (parent as HTMLElement).dataset.currentVIndex = `${targetIndex + 1}`;
                    break;

                case targetDirection === Direction.DOWN && isOverflowPrevious:
                    (parent as HTMLElement).dataset.currentVIndex = `${slides.length - 1}`;
                    break;

                case targetDirection === Direction.DOWN:
                    (parent as HTMLElement).dataset.currentVIndex = `${targetIndex - 1}`;
                    break;

                default:
                    break;
            }

            slideTo({
                direction: targetDirection,
            });
            return;
        }

        if (direction === Direction.UP) {
            const nextIndex = currentVIndex - 1 < 0 ? slides.length - 1 : currentVIndex - 1;
            const previousIndex = currentVIndex + 1 > slides.length - 1 ? 0 : currentVIndex + 1;
            const currentSlide = Array.from(slides).find((_slide, i) => i === currentVIndex);
            const nextSlide = Array.from(slides).find((_slide, i) => i === nextIndex);

            const verticalCarouselComponents = document.getElementsByClassName("qroll-carousel-component-vertical");
            const horizontalCarouselComponents = document.getElementsByClassName("qroll-carousel-component-horizontal");

            Array.from(verticalCarouselComponents).forEach(el => (el as HTMLElement).style.opacity = "0");
            const theseVerticalCarouselComponents = (nextSlide as HTMLElement).getElementsByClassName("qroll-carousel-component-vertical");
            if (theseVerticalCarouselComponents.length) {
                Array.from(theseVerticalCarouselComponents).forEach(el => (el as HTMLElement).style.opacity = `1`);
            }
            Array.from(horizontalCarouselComponents).forEach(el => (el as HTMLElement).style.opacity = "0");
            const theseHorizontalCarouselComponents = (nextSlide as HTMLElement).getElementsByClassName("qroll-carousel-component-horizontal");
            if (theseHorizontalCarouselComponents.length) {
                Array.from(theseHorizontalCarouselComponents).forEach(el => (el as HTMLElement).style.opacity = `1`);
            }


            Array.from(children).filter(child => Array.from(child.classList).includes(CssClass.SLIDE)).forEach((child, i) => {
                if (i !== currentVIndex) {
                    if (nextIndex === 0) {
                        (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(-${state.pageHeight}px)`);
                    } else {
                        (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(${i < nextIndex ? "-" : ""}${state.pageHeight}px)`);
                    }
                    (child as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                    (child as HTMLElement).style.zIndex = "-1";

                    if ([nextIndex, previousIndex].includes(i)) {
                        (child as HTMLElement).style.zIndex = "1";
                    } else {
                        (child as HTMLElement).style.zIndex = "0";
                    }
                } else {
                    (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(0)`);
                    (child as HTMLElement).style.zIndex = "1";
                }
            });

            (currentSlide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
            (nextSlide as HTMLElement).style.visibility = CssVisibility.INITIAL;
            (currentSlide as HTMLElement).style.transform = `translateY(${state.pageHeight}px)`;
            (nextSlide as HTMLElement).style.transform = "translateY(0)";
            (parent as HTMLElement).dataset.currentVIndex = `${nextIndex}`;

            let id = nextSlide ? nextSlide.id : "";
            const nextSlideHasCarousel = Array.from((nextSlide as HTMLElement).classList).includes(CssClass.CAROUSEL);
            let currentCarouselIndex = getCurrentCarouselIndex(nextSlide as HTMLElement, true);
            if (nextSlideHasCarousel && currentCarouselIndex) {
                id += `/${currentCarouselIndex || 0}`;
            }

            updateNav();
            updateCarouselNav(nextSlide as HTMLElement);
            setTimeout(() => {
                state.isRouting = true;
                if (!skipHistory) {
                    updateLocation(id, clearRoutingTimeout);
                    state.wheelCount = 0;
                }
                state.isSliding = false;
            }, state.transitionDuration);
        }

        if (direction === Direction.DOWN) {
            const nextIndex = currentVIndex + 1 >= slides.length ? 0 : currentVIndex + 1;
            const previousIndex = currentVIndex - 1 < 0 ? slides.length - 1 : currentVIndex - 1;
            const currentSlide = Array.from(slides).find((_slide, i) => i === currentVIndex);
            const nextSlide = Array.from(slides).find((_slide, i) => i === nextIndex);

            const verticalCarouselComponents = document.getElementsByClassName("qroll-carousel-component-vertical");
            const horizontalCarouselComponents = document.getElementsByClassName("qroll-carousel-component-horizontal");

            Array.from(verticalCarouselComponents).forEach(el => (el as HTMLElement).style.opacity = "0");
            const theseVerticalCarouselComponents = (nextSlide as HTMLElement).getElementsByClassName("qroll-carousel-component-vertical");
            if (theseVerticalCarouselComponents.length) {
                Array.from(theseVerticalCarouselComponents).forEach(el => (el as HTMLElement).style.opacity = `1`);
            }
            Array.from(horizontalCarouselComponents).forEach(el => (el as HTMLElement).style.opacity = "0");
            const theseHorizontalCarouselComponents = (nextSlide as HTMLElement).getElementsByClassName("qroll-carousel-component-horizontal");
            if (theseHorizontalCarouselComponents.length) {
                Array.from(theseHorizontalCarouselComponents).forEach(el => (el as HTMLElement).style.opacity = `1`);
            }


            Array.from(children).filter(child => Array.from(child.classList).includes(CssClass.SLIDE)).forEach((child, i) => {
                if (i !== currentVIndex) {
                    if (nextIndex === slides.length - 1) {
                        (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(${state.pageHeight}px)`);
                    } else {
                        (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(${i < nextIndex ? "-" : ""}${state.pageHeight}px)`);
                    }
                    (child as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                    (child as HTMLElement).style.zIndex = "-1";
                    if ([nextIndex, previousIndex].includes(i)) {
                        (child as HTMLElement).style.zIndex = "1";
                    } else {
                        (child as HTMLElement).style.zIndex = "0";
                    }
                } else {
                    (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(0)`);
                    (child as HTMLElement).style.zIndex = "1";
                }
            });

            (currentSlide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
            (nextSlide as HTMLElement).style.visibility = CssVisibility.INITIAL;
            (currentSlide as HTMLElement).style.transform = `translateY(-${state.pageHeight}px)`;
            (nextSlide as HTMLElement).style.transform = "translateY(0)";
            (parent as HTMLElement).dataset.currentVIndex = `${nextIndex}`;

            let id = nextSlide ? nextSlide.id : "";
            const nextSlideHasCarousel = Array.from((nextSlide as HTMLElement).classList).includes(CssClass.CAROUSEL);
            let currentCarouselIndex = getCurrentCarouselIndex(nextSlide as HTMLElement, true);
            if (nextSlideHasCarousel && currentCarouselIndex) {
                id += `/${currentCarouselIndex || 0}`;
            }

            updateNav();
            updateCarouselNav(nextSlide as HTMLElement);
            setTimeout(() => {
                if (!skipHistory) {
                    state.isRouting = true;
                    updateLocation(id, clearRoutingTimeout);
                    state.wheelCount = 0;
                }
                state.isSliding = false;
            }, state.transitionDuration);
        }
    }

    const nav = spawn(DomElement.DIV);
    nav.classList.add(CssClass.NAV_VERTICAL);

    Array.from(slides).forEach((slide, i) => {
        const link = spawn(DomElement.BUTTON);
        link.setAttribute(ElementAttribute.TABINDEX, "1");
        link.classList.add(CssClass.NAV_LINK);
        link.classList.add(CssClass.NO_TRANSITION);
        (link as HTMLElement).dataset.index = `${i}`;
        link.addEventListener(EventTrigger.CLICK, () => {
            if (state.isSliding) return;
            state.isSliding = true;
            slideTo({
                direction: undefined,
                targetIndex: i
            })
        });
        const tooltip = spawn(DomElement.DIV);
        tooltip.classList.add(CssClass.TOOLTIP_LEFT);
        tooltip.classList.add(CssClass.NO_TRANSITION);
        tooltip.dataset.index = `${i}`;
        const slideTitle = Array.from(slides).find(slide => Number((slide as HTMLElement).dataset.index) === i)?.querySelectorAll("h1,h2,h3,h4,h5,h6")[0];
        if ((slide as HTMLElement).dataset.title) {
            (tooltip as any).innerHTML = (slide as HTMLElement).dataset.title;
            tooltip.setAttribute(ElementAttribute.STYLE, `font-family:Helvetica`);
        } else if (slideTitle && slideTitle.textContent) {
            tooltip.setAttribute(ElementAttribute.STYLE, `font-family:${getComputedStyle(slideTitle).fontFamily.split(",")[0]}`);
            tooltip.innerHTML = applyEllipsis(slideTitle.textContent, state.tooltipEllipsisLimit);
        } else {
            tooltip.setAttribute(ElementAttribute.STYLE, `font-family:Helvetica`);
            tooltip.innerHTML = `${i}`
        }

        if ((slide as HTMLElement).dataset.tooltipCss) {
            tooltip.setAttribute(ElementAttribute.STYLE, (slide as HTMLElement).dataset.tooltipCss || "")
        }

        if (Array.from(parent.classList).includes(CssClass.TOOLTIP)) {
            link.appendChild(tooltip);
        }
        nav.appendChild(link);
    });

    function updateNav() {
        const plots = nav.getElementsByClassName(CssClass.NAV_LINK);
        Array.from(plots).forEach((plot, i) => {
            if (i === Number((parent as HTMLElement).dataset.currentVIndex)) {
                plot.classList.add(CssClass.NAV_LINK_SELECTED);
            } else {
                plot.classList.remove(CssClass.NAV_LINK_SELECTED);
            }
        });

        if (!state.isLoop) {
            if (Number((parent as HTMLElement).dataset.currentVIndex) === 0) {
                (document.getElementsByClassName(CssClass.NAV_BUTTON_TOP)[0] as HTMLElement).style.display = CssDisplay.NONE;
            } else {
                (document.getElementsByClassName(CssClass.NAV_BUTTON_TOP)[0] as HTMLElement).style.display = CssDisplay.FLEX;
            }

            if (Number((parent as HTMLElement).dataset.currentVIndex) === slides.length - 1) {
                (document.getElementsByClassName(CssClass.NAV_BUTTON_DOWN)[0] as HTMLElement).style.display = CssDisplay.NONE;
            } else {
                (document.getElementsByClassName(CssClass.NAV_BUTTON_DOWN)[0] as HTMLElement).style.display = CssDisplay.FLEX;
            }
        }
    }

    buttonBottom.innerHTML = Svg.CHEVRON_DOWN;
    buttonTop.innerHTML = Svg.CHEVRON_TOP;

    // EVENTS
    buttonTop.addEventListener(EventTrigger.CLICK, () => {
        if (state.isSliding) return;
        state.isSliding = true;
        slideTo({ direction: Direction.UP })
    });
    buttonBottom.addEventListener(EventTrigger.CLICK, () => {
        if (state.isSliding) return;
        state.isSliding = true;
        slideTo({ direction: Direction.DOWN })
    });

    window.addEventListener(EventTrigger.WHEEL, (event: WheelEvent) => {
        const direction = event.deltaY > 0 ? Direction.DOWN : Direction.UP;
        if (state.wheelCount > 1) {
            return;
        }
        state.wheelCount += 1;
        const isTrackpad = detectTrackPad(event);
        if (state.isSliding || isTrackpad || !event.deltaY) return;
        state.isSliding = true;

        if (direction === Direction.DOWN) {
            slideTo({ isWheel: true, targetIndex: Number((parent as HTMLElement).dataset.currentVIndex) + 1 > slides.length - 1 ? 0 : Number((parent as HTMLElement).dataset.currentVIndex) + 1 });
        }
        if (direction === Direction.UP) {
            slideTo({ isWheel: true, targetIndex: Number((parent as HTMLElement).dataset.currentVIndex) - 1 < 0 ? slides.length - 1 : Number((parent as HTMLElement).dataset.currentVIndex) - 1 });
        }

        setTimeout(() => {
            state.isSliding = false;
            state.wheelCount = 0;
        }, state.transitionDuration);
    });

    document.addEventListener(EventTrigger.KEYUP, (event: KeyboardEvent) => {

        const keyCode = event.code;
        const target = event.target as HTMLElement;
        const hasVerticalScrollBar = target.scrollHeight > target.clientHeight;
        const isInputField = [NodeName.TEXTAREA, NodeName.INPUT].includes(target.nodeName);
        const isScrollableIsland = hasVerticalScrollBar && target.nodeName !== NodeName.BODY;
        if ([isInputField, isScrollableIsland].includes(true)) return;

        const parent = document.getElementsByClassName(CssClass.PARENT)[0];
        const currentSlideIndex = Number((parent as HTMLElement).dataset.currentVIndex);
        const thisCarousel = parent.children[currentSlideIndex];
        const carouselWrapper = thisCarousel.getElementsByClassName(CssClass.CAROUSEL_WRAPPER)[0];
        const buttonRight = thisCarousel.getElementsByClassName(CssClass.NAV_BUTTON_RIGHT)[0];
        const buttonLeft = thisCarousel.getElementsByClassName(CssClass.NAV_BUTTON_LEFT)[0];

        if (carouselWrapper && [KeyboardCode.ARROW_RIGHT, KeyboardCode.ARROW_LEFT].includes(keyCode)) {
            const carouselSlides = Array.from(carouselWrapper.children).filter(el => Array.from(el.classList).includes(CssClass.CAROUSEL_SLIDE));
            if (Array.from((thisCarousel as HTMLElement).classList).includes(CssClass.CAROUSEL) && carouselWrapper) {
                if (keyCode === KeyboardCode.ARROW_RIGHT) {

                    const currentIndex = Number((carouselWrapper as HTMLElement).dataset.carouselIndex);

                    if (!Array.from((thisCarousel as HTMLElement).classList).includes(CssClass.LOOP)) {
                        if ([carouselSlides.length - 1].includes(currentIndex)) {
                            state.isSliding = false;
                            state.wheelCount = 0;
                            return;
                        }
                    }
                    (buttonRight as HTMLElement).click();

                    setTimeout(() => {
                        state.isSliding = false;
                        state.wheelCount = 0;
                    }, state.transitionDuration);
                    return;
                }
                if (keyCode === KeyboardCode.ARROW_LEFT) {
                    const currentIndex = Number((carouselWrapper as HTMLElement).dataset.carouselIndex);

                    if (!Array.from((thisCarousel as HTMLElement).classList).includes(CssClass.LOOP)) {
                        if ([0].includes(currentIndex)) {
                            state.isSliding = false;
                            state.wheelCount = 0;
                            return;
                        }
                    }

                    (buttonLeft as HTMLElement).click();

                    setTimeout(() => {
                        state.isSliding = false;
                        state.wheelCount = 0;
                    }, state.transitionDuration);
                    return;
                }
            }
        }


        if (state.isSliding) return;
        state.isSliding = true;

        const isntLoopAndIsLastSlide = !state.isLoop && Number((parent as HTMLElement).dataset.currentVIndex) === slides.length - 1;
        const isntLoopAndFirstSlide = !state.isLoop && Number((parent as HTMLElement).dataset.currentVIndex) === 0;

        switch (true) {
            case [KeyboardCode.ARROW_DOWN, KeyboardCode.SPACE].includes(keyCode) && isntLoopAndIsLastSlide:
                state.isSliding = false;
                break;

            case [KeyboardCode.ARROW_UP].includes(keyCode) && isntLoopAndFirstSlide:
                state.isSliding = false;
                break;

            case [KeyboardCode.ARROW_DOWN, KeyboardCode.SPACE].includes(keyCode):
                slideTo({ targetIndex: Number((parent as HTMLElement).dataset.currentVIndex) + 1 > slides.length - 1 ? 0 : Number((parent as HTMLElement).dataset.currentVIndex) + 1 })
                break;

            case [KeyboardCode.ARROW_UP].includes(keyCode):
                slideTo({ targetIndex: Number((parent as HTMLElement).dataset.currentVIndex) - 1 < 0 ? slides.length - 1 : Number((parent as HTMLElement).dataset.currentVIndex) - 1 })
                break;

            default:
                state.isSliding = false;
                return;
        }
    });

    document.addEventListener(EventTrigger.TOUCHSTART, (event: TouchEvent) => {
        state.isSliding = true;
        state.eventTouchStart = event.changedTouches?.[0] || state.eventTouchStart;
    });

    document.addEventListener(EventTrigger.TOUCHEND, (event: any) => {
        state.isSliding = false;
        state.eventTouchEnd = event.changedTouches?.[0] || state.eventTouchEnd;
        const hasVerticalScrollBar = event.target.scrollHeight > event.target.clientHeight;

        // exclusion cases
        const isScrollableIsland = !Array.from(event.target.classList).includes(CssClass.CHILD) && hasVerticalScrollBar;
        if ([isScrollableIsland].includes(true)) return;
        if (state.isSliding) {
            setTimeout(() => {
                state.isSliding = false;
            });
        };

        if (!state.isSliding) {
            const deltaTouchY = (state.eventTouchStart.clientY - state.eventTouchEnd?.clientY) ?? 0;
            const deltaTouchX = (state.eventTouchStart.clientX - state.eventTouchEnd?.clientX) ?? 0;
            if (Math.abs(deltaTouchY) < 5 || Math.abs(deltaTouchX) < 5) return;

            if (Math.abs(deltaTouchX) > Math.abs(deltaTouchY)) {
                const parent = document.getElementsByClassName(CssClass.PARENT)[0];
                const currentSlideIndex = Number((parent as HTMLElement).dataset.currentVIndex);
                const thisCarousel = parent.children[currentSlideIndex];
                const carouselWrapper = thisCarousel.getElementsByClassName(CssClass.CAROUSEL_WRAPPER)[0];
                if (!carouselWrapper) return;

                const carouselSlides = Array.from(carouselWrapper.children).filter(el => Array.from(el.classList).includes(CssClass.CAROUSEL_SLIDE));
                if (deltaTouchX > 0) {
                    // right
                    if (state.isSliding) return;
                    state.isSliding = true;
                    const currentIndex = Number((carouselWrapper as HTMLElement).dataset.carouselIndex);
                    const nextIndex = currentIndex + 1 > carouselSlides.length - 1 ? 0 : currentIndex + 1;

                    if (!Array.from((thisCarousel as HTMLElement).classList).includes(CssClass.LOOP)) {
                        if ([carouselSlides.length - 1].includes(currentIndex)) {
                            state.isSliding = false;
                            state.wheelCount = 0;
                            return;
                        }
                    }

                    carouselSlides.forEach((slide, i) => {
                        if (i === nextIndex) {
                            (slide as HTMLElement).style.transform = "translateX(0)";
                        }
                        if (i === currentIndex) {
                            (slide as HTMLElement).style.transform = `translateX(-${state.pageWidth}px)`;
                            (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                        }
                        if (i === (nextIndex + 1 > carouselSlides.length - 1 ? 0 : nextIndex + 1)) {
                            (slide as HTMLElement).style.transform = `translateX(${state.pageWidth}px)`;
                            (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                        }
                    });

                    (carouselSlides[nextIndex] as HTMLElement).style.visibility = CssVisibility.INITIAL;
                    (carouselWrapper as HTMLElement).dataset.carouselIndex = String(nextIndex);
                    updateCarouselNav(thisCarousel as HTMLElement);
                    updateLocation(`${thisCarousel.id}/${nextIndex}`);

                    setTimeout(() => {
                        state.isSliding = false;
                        state.wheelCount = 0;
                    }, state.transitionDuration);
                } else {
                    // left
                    if (state.isSliding) return;
                    state.isSliding = true;

                    const currentIndex = Number((carouselWrapper as HTMLElement).dataset.carouselIndex);
                    const nextIndex = currentIndex - 1 < 0 ? carouselSlides.length - 1 : currentIndex - 1;

                    if (!Array.from((thisCarousel as HTMLElement).classList).includes(CssClass.LOOP)) {
                        if ([0].includes(currentIndex)) {
                            state.isSliding = false;
                            state.wheelCount = 0;
                            return;
                        }
                    }

                    carouselSlides.forEach((slide, i) => {
                        if (i === nextIndex) {
                            (slide as HTMLElement).style.transform = "translateX(0)";
                        }
                        if (i === currentIndex) {
                            (slide as HTMLElement).style.transform = `translateX(${state.pageWidth}px)`;
                            (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                        }
                        if (i === (nextIndex - 1 < 0 ? carouselSlides.length - 1 : nextIndex - 1)) {
                            (slide as HTMLElement).style.transform = `translateX(-${state.pageWidth}px)`;
                            (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                        }
                    });

                    (carouselSlides[nextIndex] as HTMLElement).style.visibility = CssVisibility.INITIAL;
                    (carouselWrapper as HTMLElement).dataset.carouselIndex = String(nextIndex);
                    updateCarouselNav(thisCarousel as HTMLElement);
                    updateLocation(`${thisCarousel.id}/${nextIndex}`);

                    setTimeout(() => {
                        state.isSliding = false;
                        state.wheelCount = 0;
                    }, state.transitionDuration);
                }
            } else {
                const direction = deltaTouchY > 0 ? Direction.DOWN : Direction.UP;
                const parent = document.getElementsByClassName(CssClass.PARENT)[0];
                const currentSlideIndex = Number((parent as HTMLElement).dataset.currentVIndex);
                if (!state.isLoop) {
                    if (direction === Direction.UP) {
                        slideTo({ isWheel: true, targetIndex: currentSlideIndex - 1 })
                    } else {
                        slideTo({ isWheel: true, targetIndex: currentSlideIndex + 1 })
                    }
                } else {
                    slideTo({ direction });
                }
            }
        }
    });

    window.addEventListener(EventTrigger.RESIZE, () => {
        state.pageHeight = window.innerHeight;
        state.pageWidth = window.innerWidth;
        setupVerticalSlides(state, parent);
        const carousels = document.getElementsByClassName(CssClass.CAROUSEL);
        Array.from(carousels).forEach(carousel => setupHorizontalSlides(state, (carousel as HTMLElement)))
    });

    function getCurrentSlideId() {
        const location = window?.location;
        if (location?.hash) {
            return location?.hash.split("/")[0];
        }
        return slides[0].id || slides[1].id;
    }

    function getCurrentCarouselIndex(slide: HTMLElement, isSliding: boolean = false) {
        let carouselIndex = "";

        const carouselWrapper = slide.getElementsByClassName(CssClass.CAROUSEL_WRAPPER)[0];

        if (slide && carouselWrapper) {
            carouselIndex = (carouselWrapper as HTMLElement).dataset.carouselIndex || "";
        }

        const location = window?.location;
        if (location?.hash && !isSliding) {
            return location?.hash.split("/")[1] || carouselIndex;
        }
        return carouselIndex;
    }

    window.onload = () => {
        const currentSlideId = getCurrentSlideId().replace("#", "");
        const targetIndex = Number(grabId(currentSlideId).dataset.index);
        parent.dataset.currentVIndex = `${targetIndex}`;
        Array.from(children).filter(child => (Array.from(child.classList).includes(CssClass.SLIDE))).forEach((child) => {
            child.classList.add(CssClass.NO_TRANSITION);
        });
        setupVerticalSlides(state, parent);
        updateNav();
        restoreCarousel();
        updateCarouselNav(grabId(currentSlideId));
        setTimeout(() => {
            Array.from(children).filter(child => (Array.from(child.classList).includes(CssClass.SLIDE))).forEach((child) => {
                child.classList.remove(CssClass.NO_TRANSITION);
            });
        }, state.transitionDuration);
    }

    function clearRoutingTimeout() {
        clearTimeout(state.timeoutRouter)
        state.timeoutRouter = setTimeout(() => {
            state.isRouting = false;
            state.isSliding = false;
            state.wheelCount = 0;
        }, 10); // RA likes 10 because it's a "proper" digit

    }

    function restoreCarousel() {
        const currentSlideId = getCurrentSlideId().replace("#", "");
        // if has carousel position to slide in url
        if (Array.from(grabId(currentSlideId).classList).includes(CssClass.CAROUSEL)) {
            const currentCarouselIndex = Number(getCurrentCarouselIndex(grabId(currentSlideId)));
            const carouselWrapper = grabId(currentSlideId).getElementsByClassName(CssClass.CAROUSEL_WRAPPER)[0];
            const carouselSlides = Array.from(carouselWrapper.children).filter(el => Array.from(el.classList).includes(CssClass.CAROUSEL_SLIDE));
            (carouselWrapper as HTMLElement).dataset.carouselIndex = String(currentCarouselIndex);

            carouselSlides.forEach((slide) => {
                (slide as HTMLElement).classList.add(CssClass.NO_TRANSITION);
            });
            setupHorizontalSlides(state, grabId(currentSlideId));
        }
    }

    window.addEventListener(EventTrigger.HASHCHANGE, () => {
        if (state.isRouting) return;
        state.isRouting = true;
        const currentSlideId = getCurrentSlideId().replace("#", "");
        const targetIndex = Number(grabId(currentSlideId).dataset.index);
        slideTo({ targetIndex, skipHistory: true });
        restoreCarousel();
        updateCarouselNav(grabId(currentSlideId));
        updateNav();
        clearRoutingTimeout();
    })

    parent.appendChild(nav);
    parent.appendChild(buttonTop);
    parent.appendChild(buttonBottom);
}

const carousel = {
    createCarousel,
    createCarouselComponents,
    createMainLayout,
}

export default carousel;

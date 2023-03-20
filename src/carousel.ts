import { State } from "../types";
import { CssClass, CssDisplay, CssUnit, CssVisibility, Direction, DomElement, ElementAttribute, ElementId, EventTrigger, KeyboardCode, NodeName } from "./constants";
import { detectTrackPad, grabId, walkTheDOM, setTabIndex, spawn, updateLocation, applyEllipsis } from "./functions";

export function setUpCarousels(state: State, carousel: HTMLElement) {
    const parent = carousel.getElementsByClassName("qroll-slide-carousel-wrapper")[0];
    const slides = Array.from(parent.children).filter(slide => (Array.from(slide.classList).includes(CssClass.CAROUSEL_SLIDE)));
    const currentHIndex = Number((parent as HTMLElement).dataset.carouselIndex);

    slides.forEach((slide, i) => {
        (slide as HTMLElement).style.width = `${state.pageWidth}px`;
        if (i === currentHIndex) {
            (slide as HTMLElement).style.transform = "translateX(0)";
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
}

export function updateCarouselNav(carousel: HTMLElement) {
    const carouselWrapper = carousel.getElementsByClassName("qroll-slide-carousel-wrapper")[0];
    if (!carouselWrapper) return;
    const currentIndex = Number((carouselWrapper as HTMLElement).dataset.carouselIndex);
    const nav = carousel.getElementsByClassName("qroll-horizontal-nav")[0];
    const links = nav.children;
    Array.from(links).forEach((link, i) => {
        if (i === currentIndex) {
            link.classList.add("qroll-nav-link-selected");
        } else {
            link.classList.remove("qroll-nav-link-selected");
        }
    });
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
    carouselWrapper.classList.add("qroll-slide-carousel-wrapper");
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
    nav.classList.add("qroll-horizontal-nav");
    nav.dataset.slideIndex = carousel.dataset.index;

    const slides = Array.from(carousel.getElementsByClassName("qroll-slide-carousel-wrapper")[0].children);

    slides.filter(child => Array.from(child.classList).includes(CssClass.CAROUSEL_SLIDE)).forEach((slide, i) => {
        const link = spawn(DomElement.DIV);
        link.classList.add("qroll-nav-link");
        if (i === Number((carouselWrapper as HTMLElement).dataset.carouselIndex)) {
            link.classList.add("qroll-nav-link-selected");
        } else {
            link.classList.remove("qroll-nav-link-selected");
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

        if (Array.from(carousel.classList).includes("qroll-tooltip")) {
            link.appendChild(tooltip);
        }

        nav.appendChild(link);
    });

    const buttonRight = spawn(DomElement.BUTTON);
    const buttonLeft = spawn(DomElement.BUTTON);

    buttonRight.classList.add("qroll-carousel-horizontal-button-right");
    buttonLeft.classList.add("qroll-carousel-horizontal-button-left");

    buttonRight.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>`;
    buttonLeft.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>`;

    function slideTo(index: number) {
        const currentIndex = Number((carouselWrapper as HTMLElement).dataset.carouselIndex);
        const nextIndex = index;
        if (currentIndex === nextIndex) return;
        if (state.isSliding) return;
        state.isSliding = true;

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

        setTimeout(() => {
            state.isSliding = false;
            state.wheelCount = 0;
        }, state.transitionDuration)
    }

    buttonRight.addEventListener(EventTrigger.CLICK, slideRight);
    buttonLeft.addEventListener(EventTrigger.CLICK, slideLeft);

    // TODO touch event

    carousel.appendChild(buttonRight);
    carousel.appendChild(buttonLeft);
    carousel.appendChild(nav);

}

/** Update the state and event listeners of existing nested carousels
 * 
 * @param slide - HTMLElement, must be a direct child of the main Parent element
 * @param isResize - boolean, if true will not recreate event listeners
 */
export function updateNestedCarousels(slide: HTMLElement, isResize: boolean = false) {
    const carousels = Array.from(slide.getElementsByClassName(CssClass.NESTED_CAROUSEL)).filter(el => !!el);
    if (!carousels || !carousels.length) return;

    Array.from(carousels).forEach((carousel, index) => {
        if (!Array.from(carousel.classList).includes(CssClass.NESTED_CAROUSEL)) return;

        const currentIndex = Number((carousel as HTMLElement).dataset.nestedCarouselIndex);

        const childrenCount = Array.from(carousel.children).filter(child => Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD)).length;
        const carouselBox = (carousel as HTMLElement).getBoundingClientRect();

        Array.from(carousel.children)
            .filter(child => Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD))
            .forEach((child, i) => {
                const diff = i - currentIndex;
                (child as HTMLElement).style.left = `${carouselBox.width * diff}${CssUnit.PX}`;
            });

        const navLeft = grabId(`${ElementId.NESTED_CAROUSEL_NAV_LEFT}${slide.id}_${index}`);
        const navRight = grabId(`${ElementId.NESTED_CAROUSEL_NAV_RIGHT}${slide.id}_${index}`);

        const isEndRight = () => Number((carousel as HTMLElement).dataset.nestedCarouselIndex) >= childrenCount - 1;
        const isEndLeft = () => Number((carousel as HTMLElement).dataset.nestedCarouselIndex) <= 0;

        const updateNav = () => {
            if (isEndRight() && !Array.from(carousel.classList).includes(CssClass.LOOP)) {
                navRight.style.display = CssDisplay.NONE;
            } else {
                navRight.style.display = CssDisplay.FLEX;
            }

            if (isEndLeft() && !Array.from(carousel.classList).includes(CssClass.LOOP)) {
                navLeft.style.display = CssDisplay.NONE;
            } else {
                navLeft.style.display = CssDisplay.FLEX;
            }

            if (Array.from(carousel.classList).includes(CssClass.PROGRESS)) {
                const progressBar = carousel.getElementsByClassName(CssClass.NESTED_CAROUSEL_PROGRESS_BAR)[0];
                progressBar.setAttribute(ElementAttribute.STYLE, `width:${Number((carousel as HTMLElement).dataset.nestedCarouselIndex) / (childrenCount - 1) * 100}%;${(carousel as HTMLElement).dataset.progressCss}`);
            }
        }

        function clickRight() {
            const wrapperBox = (carousel as HTMLElement).getBoundingClientRect();
            if (Number((carousel as HTMLElement).dataset.nestedCarouselIndex) >= childrenCount - 1) {
                if (Array.from(carousel.classList).includes(CssClass.LOOP)) {
                    Array.from(carousel.children)
                        .filter(child => Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD))
                        .forEach((child, i) => {
                            (child as HTMLElement).style.left = `${wrapperBox.width * i}${CssUnit.PX}`;
                        });
                    (carousel as HTMLElement).dataset.nestedCarouselIndex = "0";
                    updateNav();
                }
                return;
            } else {
                (carousel as HTMLElement).dataset.nestedCarouselIndex = `${Number((carousel as HTMLElement).dataset.nestedCarouselIndex) + 1}`;
                Array.from(carousel.children).forEach((child, i) => {
                    if (!Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD)) return;
                    (child as HTMLElement).style.left = Number((child as HTMLElement).style.left.replace(CssUnit.PX, "")) - wrapperBox.width + CssUnit.PX;
                });

                updateNav();
            }
        }

        function clickLeft() {
            const wrapperBox = (carousel as HTMLElement).getBoundingClientRect();
            if (Number((carousel as HTMLElement).dataset.nestedCarouselIndex) <= 0) {
                if (Array.from(carousel.classList).includes(CssClass.LOOP)) {
                    Array.from(carousel.children)
                        .filter(child => Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD))
                        .reverse()
                        .forEach((child, i) => {
                            (child as HTMLElement).style.left = `-${wrapperBox.width * i}${CssUnit.PX}`;
                        });
                    (carousel as HTMLElement).dataset.nestedCarouselIndex = `${Array.from(carousel.children).filter(child => Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD)).length - 1}`;
                    updateNav();
                }
                return;
            } else {
                (carousel as HTMLElement).dataset.nestedCarouselIndex = `${Number((carousel as HTMLElement).dataset.nestedCarouselIndex) - 1}`;
                Array.from(carousel.children)
                    .filter(child => Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD))
                    .forEach((child) => {
                        (child as HTMLElement).style.left = Number((child as HTMLElement).style.left.replace(CssUnit.PX, "")) + wrapperBox.width + CssUnit.PX;
                    });

                updateNav();
            }
        }

        if (!isResize) {
            // Resizing does not need to regester already existing eventListeners
            navRight.removeEventListener(EventTrigger.CLICK, clickRight);
            navLeft.removeEventListener(EventTrigger.CLICK, clickLeft);
            navRight.addEventListener(EventTrigger.CLICK, clickRight);
            navLeft.addEventListener(EventTrigger.CLICK, clickLeft);
        }
    });
}

export function setUpSlides(state: State, parent: HTMLElement) {
    const children = Array.from(parent.children).filter(child => Array.from(child.classList).includes(CssClass.SLIDE));

    Array.from(children).forEach((child, i) => {
        if (i === Number((parent as HTMLElement).dataset.currentVIndex)) {
            (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(0);`)
        } else {
            (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(${i < Number((parent as HTMLElement).dataset.currentVIndex) ? "-" : ""}${state.pageHeight}px)`);
            (child as HTMLElement).style.visibility = CssVisibility.HIDDEN;
        }
    });
}

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
    buttonTop.setAttribute(ElementAttribute.TYPE, DomElement.BUTTON);
    buttonBottom.setAttribute(ElementAttribute.TYPE, DomElement.BUTTON);
    buttonTop.classList.add(CssClass.NAV_BUTTON_TOP);
    buttonBottom.classList.add(CssClass.NAV_BUTTON_DOWN);

    function slideTo({
        direction = undefined,
        targetIndex = undefined,
        skipHistory = false }:
        {
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

        if (targetIndex !== undefined) {
            differenceToTarget = currentVIndex - targetIndex;

            if (differenceToTarget === 0) return;
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
            const currentSlide = Array.from(slides).find((_slide, i) => i === currentVIndex);
            const nextSlide = Array.from(slides).find((_slide, i) => i === nextIndex);

            Array.from(children).filter(child => Array.from(child.classList).includes(CssClass.SLIDE)).forEach((child, i) => {
                if (i !== currentVIndex) {
                    if (nextIndex === 0) {
                        (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(-${state.pageHeight}px)`);
                    } else {
                        (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(${i < nextIndex ? "-" : ""}${state.pageHeight}px)`);
                    }
                    (child as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                } else {
                    (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(0)`);
                }
            });

            (currentSlide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
            (nextSlide as HTMLElement).style.visibility = CssVisibility.INITIAL;
            (currentSlide as HTMLElement).style.transform = `translateY(${state.pageHeight}px)`;
            (nextSlide as HTMLElement).style.transform = "translateY(0)";
            (parent as HTMLElement).dataset.currentVIndex = `${nextIndex}`;

            updateNav();
            setTimeout(() => {
                const id = nextSlide ? nextSlide.id : "";
                if (!skipHistory) {
                    state.isRouting = true;
                    updateLocation(id, clearRoutingTimeout);
                    state.wheelCount = 0;
                }
                state.isSliding = false;
            }, state.transitionDuration);
        }

        if (direction === Direction.DOWN) {
            const nextIndex = currentVIndex + 1 >= slides.length ? 0 : currentVIndex + 1;
            const currentSlide = Array.from(slides).find((_slide, i) => i === currentVIndex);
            const nextSlide = Array.from(slides).find((_slide, i) => i === nextIndex);

            Array.from(children).filter(child => Array.from(child.classList).includes(CssClass.SLIDE)).forEach((child, i) => {
                if (i !== currentVIndex) {
                    if (nextIndex === slides.length - 1) {
                        (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(${state.pageHeight}px)`);
                    } else {
                        (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(${i < nextIndex ? "-" : ""}${state.pageHeight}px)`);
                    }
                    (child as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                } else {
                    (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(0)`);
                }
            });

            (currentSlide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
            (nextSlide as HTMLElement).style.visibility = CssVisibility.INITIAL;
            (currentSlide as HTMLElement).style.transform = `translateY(-${state.pageHeight}px)`;
            (nextSlide as HTMLElement).style.transform = "translateY(0)";
            (parent as HTMLElement).dataset.currentVIndex = `${nextIndex}`;
            updateNav();
            setTimeout(() => {
                const id = nextSlide ? nextSlide.id : "";
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
        const link = spawn(DomElement.DIV);
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

        if (Array.from(parent.classList).includes("qroll-tooltip")) {
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

    buttonBottom.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" height="30px" width="30px"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>`;
    buttonTop.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" height="30px" width="30px"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>`;

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

    document.addEventListener(EventTrigger.WHEEL, (event: WheelEvent) => {
        if (state.wheelCount > 1) {
            return;
        }
        state.wheelCount += 1;
        const isTrackpad = detectTrackPad(event);
        if (state.isSliding || isTrackpad || !event.deltaY) return;
        state.isSliding = true;
        const direction = event.deltaY > 0 ? Direction.DOWN : Direction.UP;

        if (!state.isLoop) {
            if (direction === Direction.DOWN) {
                if (Number((parent as HTMLElement).dataset.currentVIndex) === slides.length - 1) {
                    state.isSliding = false;
                    return;
                };
                slideTo({ targetIndex: Number((parent as HTMLElement).dataset.currentVIndex) + 1 > slides.length - 1 ? 0 : Number((parent as HTMLElement).dataset.currentVIndex) + 1 })
            }
            if (direction === Direction.UP) {
                if (Number((parent as HTMLElement).dataset.currentVIndex) === 0) {
                    state.isSliding = false;
                    return;
                }
            }
        }

        if (direction === Direction.DOWN) {
            slideTo({ targetIndex: Number((parent as HTMLElement).dataset.currentVIndex) + 1 > slides.length - 1 ? 0 : Number((parent as HTMLElement).dataset.currentVIndex) + 1 });
        }
        if (direction === Direction.UP) {
            slideTo({ targetIndex: Number((parent as HTMLElement).dataset.currentVIndex) - 1 < 0 ? slides.length - 1 : Number((parent as HTMLElement).dataset.currentVIndex) - 1 });
        }


        setTimeout(() => {
            state.isSliding = false;
            state.wheelCount = 0;
        }, state.transitionDuration < 800 ? 800 : state.transitionDuration);
    });

    document.addEventListener(EventTrigger.KEYUP, (event: KeyboardEvent) => {

        const keyCode = event.code;
        const target = event.target as HTMLElement;
        const hasVerticalScrollBar = target.scrollHeight > target.clientHeight;
        const isInputField = [NodeName.TEXTAREA, NodeName.INPUT].includes(target.nodeName);
        const isScrollableIsland = hasVerticalScrollBar && target.nodeName !== NodeName.BODY;
        if ([isInputField, isScrollableIsland].includes(true)) return;

        // carousel management

        const parent = document.getElementsByClassName("qroll-parent")[0];
        const currentSlideIndex = Number((parent as HTMLElement).dataset.currentVIndex);
        const thisCarousel = parent.children[currentSlideIndex];
        const carouselWrapper = thisCarousel.getElementsByClassName("qroll-slide-carousel-wrapper")[0];

        if (carouselWrapper && ["ArrowRight", "ArrowLeft"].includes(keyCode)) {
            const carouselSlides = Array.from(carouselWrapper.children).filter(el => Array.from(el.classList).includes("qroll-carousel-slide"));
            if (Array.from((thisCarousel as HTMLElement).classList).includes("qroll-carousel") && carouselWrapper) {
                if (keyCode === "ArrowRight") {
                    if (state.isSliding) return;
                    state.isSliding = true;
                    const currentIndex = Number((carouselWrapper as HTMLElement).dataset.carouselIndex);
                    const nextIndex = currentIndex + 1 > carouselSlides.length - 1 ? 0 : currentIndex + 1;
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

                    setTimeout(() => {
                        state.isSliding = false;
                        state.wheelCount = 0;
                    }, state.transitionDuration);
                    return;
                }
                if (keyCode === "ArrowLeft") {
                    if (state.isSliding) return;
                    state.isSliding = true;

                    const currentIndex = Number((carouselWrapper as HTMLElement).dataset.carouselIndex);
                    const nextIndex = currentIndex - 1 < 0 ? carouselSlides.length - 1 : currentIndex - 1;

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
        let direction;

        if (!state.isLoop) {
            if (direction === Direction.DOWN) {
                if (Number((parent as HTMLElement).dataset.currentVIndex) === slides.length - 1) {
                    state.isSliding = false;
                    return;
                };
            }
            if (direction === Direction.UP) {
                if (Number((parent as HTMLElement).dataset.currentVIndex) === 0) {
                    state.isSliding = false;
                    return;
                }
            }
        }

        switch (true) {
            case [KeyboardCode.ARROW_DOWN, KeyboardCode.SPACE].includes(keyCode):
                direction = Direction.DOWN;
                slideTo({ targetIndex: Number((parent as HTMLElement).dataset.currentVIndex) + 1 > slides.length - 1 ? 0 : Number((parent as HTMLElement).dataset.currentVIndex) + 1 })
                break;

            case [KeyboardCode.ARROW_UP].includes(keyCode):
                direction = Direction.UP;
                slideTo({ targetIndex: Number((parent as HTMLElement).dataset.currentVIndex) - 1 < 0 ? slides.length - 1 : Number((parent as HTMLElement).dataset.currentVIndex) - 1 })
                break;

            default:
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
                const parent = document.getElementsByClassName("qroll-parent")[0];
                const currentSlideIndex = Number((parent as HTMLElement).dataset.currentVIndex);
                const thisCarousel = parent.children[currentSlideIndex];
                const carouselWrapper = thisCarousel.getElementsByClassName("qroll-slide-carousel-wrapper")[0];
                if (!carouselWrapper) return;

                const carouselSlides = Array.from(carouselWrapper.children).filter(el => Array.from(el.classList).includes("qroll-carousel-slide"));
                if (deltaTouchX > 0) {
                    // right
                    if (state.isSliding) return;
                    state.isSliding = true;
                    const currentIndex = Number((carouselWrapper as HTMLElement).dataset.carouselIndex);
                    const nextIndex = currentIndex + 1 > carouselSlides.length - 1 ? 0 : currentIndex + 1;
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

                    setTimeout(() => {
                        state.isSliding = false;
                        state.wheelCount = 0;
                    }, state.transitionDuration);
                }
            } else {
                const direction = deltaTouchY > 0 ? Direction.DOWN : Direction.UP;

                if (!state.isLoop) {
                    if (direction === Direction.DOWN) {
                        if (Number((parent as HTMLElement).dataset.currentVIndex) === slides.length - 1) {
                            state.isSliding = false;
                            return;
                        };
                    }
                    if (direction === Direction.UP) {
                        if (Number((parent as HTMLElement).dataset.currentVIndex) === 0) {
                            state.isSliding = false;
                            return;
                        }
                    }
                }

                slideTo({ direction });
            }
        }
    });

    window.addEventListener(EventTrigger.RESIZE, () => {
        state.pageHeight = window.innerHeight;
        state.pageWidth = window.innerWidth;
        setUpSlides(state, parent);
        const carousels = document.getElementsByClassName(CssClass.CAROUSEL);
        Array.from(carousels).forEach(carousel => setUpCarousels(state, (carousel as HTMLElement)))
    });

    function getCurrentSlideId() {
        const location = window?.location;
        if (location?.hash) {
            return location?.hash;
        }
        return slides[0].id || slides[1].id;
    }

    window.onload = () => {
        const currentSlideId = getCurrentSlideId().replace("#", "");
        const targetIndex = Number(grabId(currentSlideId).dataset.index);
        parent.dataset.currentVIndex = `${targetIndex}`;
        Array.from(children).filter(child => (Array.from(child.classList).includes(CssClass.SLIDE))).forEach((child) => {
            child.classList.add(CssClass.NO_TRANSITION);
        });
        setUpSlides(state, parent);

        updateNav();
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
        }, state.transitionDuration + 10);

    }


    window.addEventListener(EventTrigger.HASHCHANGE, () => {
        if (state.isRouting) return;
        state.isRouting = true;
        const currentSlideId = getCurrentSlideId().replace("#", "");
        const targetIndex = Number(grabId(currentSlideId).dataset.index);
        slideTo({ targetIndex, skipHistory: true });
        updateNav();
        clearRoutingTimeout();
    })

    parent.appendChild(nav);
    parent.appendChild(buttonTop);
    parent.appendChild(buttonBottom);
}

const carousel = {
    createCarousel,
    createMainLayout,
    updateNestedCarousels
}

export default carousel;

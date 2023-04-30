import { ScrollDirection } from "../types";
import { CssClass, CssDisplay, CssUnit, CssVisibility, DataAttribute, Direction, DomElement, ElementAttribute, EventTrigger, KeyboardCode, NodeName, Svg } from "./constants";
import { detectTrackPad, grabId, walkTheDOM, setTabIndex, spawn, updateLocation, applyEllipsis, createUid, updateMetaTags } from "./functions";
import { getCurrentSlideIndex } from "./interface";
import Main from "./main";

/** Set up dialog elements from client DIV elements that must be direct children of the main Parent element
 */
export function createDialogs() {
    const dialogBeacons = document.getElementsByClassName(CssClass.DIALOG);

    Array.from(dialogBeacons).forEach((beacon, i) => {
        const dialog = spawn(DomElement.DIALOG);
        const id = (beacon as HTMLElement).dataset.id || `qroll_dialog_${i}`;
        dialog.setAttribute(ElementAttribute.ID, id);
        const content = spawn(DomElement.DIV);
        content.classList.add(CssClass.DIALOG_CONTENT);
        content.innerHTML = beacon.innerHTML;
        beacon.innerHTML = "";

        const hasCloseButton = (beacon as HTMLElement).dataset.closeButton === DataAttribute.TRUE;
        const hasTitle = (beacon as HTMLElement).dataset.title;
        const hasCssClasses = (beacon as HTMLElement).dataset.cssClasses;

        if (hasCloseButton) {
            const closeButton = spawn(DomElement.BUTTON);
            closeButton.classList.add(CssClass.DIALOG_BUTTON_CLOSE);
            closeButton.innerHTML = Svg.CLOSE;
            const abortCloseButton = new AbortController();
            closeButton.addEventListener(EventTrigger.CLICK, () => closeDialog(id), { signal: abortCloseButton.signal });
            Main.state().events.push({
                element: closeButton,
                trigger: EventTrigger.CLICK,
                callback: () => closeDialog(id),
                aborter: abortCloseButton
            });
            dialog.appendChild(closeButton);
        }

        if (hasTitle) {
            const title = spawn(DomElement.DIV);
            const text = (beacon as HTMLElement).dataset.title;
            title.classList.add(CssClass.DIALOG_TITLE);
            title.innerHTML = text || "";
            if (text) {
                dialog.appendChild(title);
            }
        }
        dialog.appendChild(content);
        dialog.classList.add(CssClass.DIALOG_BODY);
        if (hasCssClasses) {
            const cssClasses = (beacon as HTMLElement).dataset.cssClasses?.split(" ") as any;
            if (cssClasses.length) {
                cssClasses.forEach((cssClass: string) => {
                    dialog.classList.add(cssClass);
                });
            }
        }
        beacon.appendChild(dialog);
        Main.state().modalIds.push(id);
    });
}

/** Set up slides and sliding logic for dialog nested carousel components
 * 
 * @param dialog
 */
export function initDialogCarousels(dialog: HTMLDialogElement) {
    const hCarousels = dialog.querySelectorAll(DataAttribute.CAROUSEL);
    const content = dialog.getElementsByClassName(CssClass.DIALOG_CONTENT)[0];
    (content as HTMLElement).style.overflowX = CssVisibility.HIDDEN;
    Array.from(hCarousels).forEach(hCarousel => {
        (hCarousel as HTMLElement).classList.add(CssClass.DIALOG_CAROUSEL);
    });

    Array.from(hCarousels).forEach(hCarousel => {
        if ((hCarousel as HTMLElement).dataset.carouselIndex) {
            return;
        }
        (hCarousel as HTMLElement).dataset.carouselIndex = "0";
        (hCarousel as HTMLElement).style.width = "100%";
        (hCarousel as HTMLElement).style.position = "relative";
        const children = hCarousel.children;
        Array.from(children).forEach((child, j) => {
            (child as HTMLElement).dataset.index = String(j);
            (child as HTMLElement).classList.add(CssClass.NO_TRANSITION);
            (child as HTMLElement).classList.add(CssClass.CAROUSEL_HORIZONTAL_SLIDE);
            if (j === children.length - 1) {
                (child as HTMLElement).style.transform = `translateX(-100%)`;
                (child as HTMLElement).style.visibility = CssVisibility.HIDDEN;
            } else if (j === 0) {
                (child as HTMLElement).style.transform = `translateX(0)`;
            } else {
                (child as HTMLElement).style.transform = `translateX(100%)`;
                (child as HTMLElement).style.visibility = CssVisibility.HIDDEN;
            }
        });
        const slides = Array.from(hCarousel.children).filter((child) => Array.from((child as HTMLElement).classList).includes(CssClass.CAROUSEL_HORIZONTAL_SLIDE));
        const heights = Array.from(slides).map(child => {
            return Number(window.getComputedStyle(child as HTMLElement).height.replace("px", ""));
        });
        const maxContentHeight = Math.max(...heights);
        (hCarousel as HTMLElement).style.height = `${maxContentHeight}px`;
        const buttonLeft = spawn(DomElement.BUTTON);
        const buttonRight = spawn(DomElement.BUTTON);
        buttonLeft.classList.add(CssClass.CAROUSEL_BUTTON_LEFT);
        buttonRight.classList.add(CssClass.CAROUSEL_BUTTON_RIGHT);
        buttonLeft.innerHTML = Svg.CHEVRON_LEFT;
        buttonRight.innerHTML = Svg.CHEVRON_RIGHT;

        const abortButtonRight = new AbortController();
        buttonRight.addEventListener(EventTrigger.CLICK, () => slideComponentToDirection({ direction: Direction.RIGHT, component: hCarousel as HTMLElement }), { signal: abortButtonRight.signal });
        Main.state().events.push({
            element: buttonRight,
            trigger: EventTrigger.CLICK,
            callback: () => slideComponentToDirection({ direction: Direction.RIGHT, component: hCarousel as HTMLElement }),
            aborter: abortButtonRight
        });

        const abortButtonLeft = new AbortController();
        buttonLeft.addEventListener(EventTrigger.CLICK, () => slideComponentToDirection({ direction: Direction.LEFT, component: hCarousel as HTMLElement }), { signal: abortButtonLeft.signal });
        Main.state().events.push({
            element: buttonLeft,
            trigger: EventTrigger.CLICK,
            callback: slideComponentToDirection({ direction: Direction.LEFT, component: hCarousel as HTMLElement }),
            aborter: abortButtonLeft
        });

        const buttonPlayPause = spawn(DomElement.BUTTON);
        buttonPlayPause.classList.add(CssClass.CAROUSEL_BUTTON_PLAY);
        buttonPlayPause.innerHTML = Svg.PAUSE;
        if (!(hCarousel as HTMLElement).dataset.autoSlide) {
            buttonPlayPause.style.display = CssDisplay.NONE;
        }

        const uid = createUid();

        Main.state().intervals.push({
            id: uid,
            interval: null,
        });

        (hCarousel as HTMLElement).dataset.uid = uid;

        if ((hCarousel as HTMLElement).dataset.autoSlide === DataAttribute.PAUSE) {
            (hCarousel as HTMLElement).dataset.autoSlide = DataAttribute.TRUE;
        }

        if ((hCarousel as HTMLElement).dataset.autoSlide === DataAttribute.TRUE) {
            playPause({
                carousel: hCarousel as HTMLElement,
                buttonNext: buttonRight,
                buttonPrevious: buttonLeft,
                uid
            });
        }
        const abortPlayPause = new AbortController();
        buttonPlayPause.addEventListener(EventTrigger.CLICK, () => togglePlayState({
            carousel: hCarousel,
            buttonPlayPause,
            buttonNext: buttonRight,
            buttonPrevious: buttonLeft,
            uid
        }), { signal: abortPlayPause.signal });

        Main.state().events.push({
            element: buttonPlayPause,
            trigger: EventTrigger.CLICK,
            callback: () => togglePlayState({
                carousel: hCarousel,
                buttonPlayPause,
                buttonNext: buttonRight,
                buttonPrevious: buttonLeft,
                uid
            }),
            aborter: abortPlayPause
        });

        [buttonLeft, buttonRight, buttonPlayPause].forEach(e => hCarousel.appendChild(e));
    });
}

/** Get right, left & pause buttons from a carousel element
 * 
 * @param carousel - An horizontal carousel element
 * @returns an object with left, right & pause buttons
 */
export function getCarouselButtons(carousel: HTMLElement) {
    const buttonPlayPause = (carousel as HTMLElement).getElementsByClassName(CssClass.CAROUSEL_BUTTON_PLAY)[0] as HTMLElement;
    const buttonNext = (carousel as HTMLElement).getElementsByClassName(CssClass.CAROUSEL_BUTTON_RIGHT)[0] as HTMLElement;
    const buttonPrevious = (carousel as HTMLElement).getElementsByClassName(CssClass.CAROUSEL_BUTTON_LEFT)[0] as HTMLElement;
    return { buttonPlayPause, buttonNext, buttonPrevious };
}

/** Open a dialog element by id, and initialize optional nested carousels (and restart previously auto sliding carousel automatically paused when closing the dialog)
 * 
 * @param id - dialog element id
 */
export function openDialog(id: string) {
    const modal = document.getElementById(id) as HTMLDialogElement;
    if (modal) {
        const hCarousels = modal.querySelectorAll(DataAttribute.CAROUSEL);
        if (hCarousels && hCarousels.length) {
            initDialogCarousels(modal);
            Array.from(hCarousels).forEach(carousel => {
                if ((carousel as HTMLElement).dataset.autoSlide === DataAttribute.PAUSE) {
                    (carousel as HTMLElement).dataset.autoSlide = DataAttribute.FALSE;
                    const { buttonPlayPause, buttonNext, buttonPrevious } = getCarouselButtons(carousel as HTMLElement);
                    togglePlayState({
                        carousel,
                        buttonPlayPause,
                        buttonNext,
                        buttonPrevious,
                        uid: (carousel as HTMLElement).dataset.uid,
                    });
                }
            });
        }
        modal.showModal();
    }
}

/** Close a dialog element by id. Will pause any nested auto sliding carousel.
 * 
 * @param id - dialog element id
 */
export function closeDialog(id: string) {
    const modal = document.getElementById(id) as HTMLDialogElement;
    const hCarousels = modal.querySelectorAll(DataAttribute.CAROUSEL);
    Array.from(hCarousels).forEach(carousel => {
        if ((carousel as HTMLElement).dataset.autoSlide === DataAttribute.TRUE) {
            const { buttonPlayPause, buttonNext, buttonPrevious } = getCarouselButtons(carousel as HTMLElement);
            togglePlayState({
                carousel,
                buttonPlayPause,
                buttonNext,
                buttonPrevious,
                uid: (carousel as HTMLElement).dataset.uid,
            });
            (carousel as HTMLElement).dataset.autoSlide = DataAttribute.PAUSE;
        }
    });
    if (modal) {
        modal.close();
    }
}

/** Check if any dialog element is currently open
 * 
 * @returns true if any dialog is currently open
 */
export function isDialogOpen(): boolean {
    const dialogs = Main.state().modalIds.map((id: string) => {
        const dialog = document.getElementById(id) as HTMLDialogElement;
        return dialog.open
    });
    if (dialogs.includes(true)) {
        Main.state().isSliding = true;
    } else {
        Main.state().isSliding = false;
    }
    return Main.state().isSliding;
}

/** Play | Pause manager for auto sliding carousel components
 * 
 * @param param0 - config object
 */
export function togglePlayState({
    carousel,
    buttonPlayPause,
    buttonNext,
    buttonPrevious,
    uid
}: { carousel: any, buttonPlayPause: HTMLElement, buttonNext: HTMLElement, buttonPrevious: HTMLElement, uid: any }) {
    const status = carousel.dataset.autoSlide;
    if (status === DataAttribute.TRUE) {
        carousel.dataset.autoSlide = DataAttribute.FALSE;
        buttonPlayPause.innerHTML = Svg.PLAY;
    } else {
        carousel.dataset.autoSlide = DataAttribute.TRUE;
        buttonPlayPause.innerHTML = Svg.PAUSE;
    }
    playPause({ carousel, buttonNext, buttonPrevious, uid });
}

/** Interval manager for auto sliding carousel components
 * 
 * @param param0 - config object
 */
export function playPause({ carousel, buttonNext, buttonPrevious, uid }: { carousel: HTMLElement, buttonNext: HTMLElement, buttonPrevious: HTMLElement, uid: string }) {
    const direction = carousel.dataset.direction as ScrollDirection || Direction.RIGHT;
    const duration = Number(carousel.dataset.timer) || 5000;
    const thisInterval = Main.state().intervals.find((i: { id: string; }) => i.id === uid);

    if (carousel.dataset.autoSlide === DataAttribute.FALSE) {
        clearInterval(thisInterval.interval);
        thisInterval.interval = null;
    } else {
        const interval = setInterval(() => {
            if ([Direction.RIGHT, Direction.DOWN].includes(direction)) {
                buttonNext.click();
            } else {
                buttonPrevious.click();
            }
        }, duration);
        thisInterval.interval = interval;
    }
}

/** Sliding manager for auto sliding carousel components
 * 
 * @param direction - UP | RIGHT | DOWN | LEFT
 * @param component - auto sliding carousel component
 */
export function slideComponentToDirection({ direction, component }: { direction: ScrollDirection, component: HTMLElement }) {
    if (Main.state() && Main.state().isSliding && component.dataset.autoSlide !== DataAttribute.TRUE) {
        return;
    }
    if (Main.state() && component.dataset.autoSlide !== DataAttribute.TRUE) {
        Main.state().isSliding = true;
    }
    const hSlides = component.getElementsByClassName(CssClass.CAROUSEL_HORIZONTAL_SLIDE);
    const vSlides = component.getElementsByClassName(CssClass.CAROUSEL_VERTICAL_SLIDE);
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
            if (Main.state()) {
                Main.state().timeouts.t0 = setTimeout(() => {
                    Main.state().isSliding = false;
                }, Main.state().transitionDuration);
            }
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
            if (Main.state()) {
                Main.state().timeouts.t1 = setTimeout(() => {
                    Main.state().isSliding = false;
                }, Main.state().transitionDuration);
            }
        });
    }
}

/** Set up carousel components, and auto sliding features
 * 
 */
export function createCarouselComponents() {
    const horizontalCarousels = document.getElementsByClassName(CssClass.CAROUSEL_HORIZONTAL_COMPONENT);
    const verticalCarousels = document.getElementsByClassName(CssClass.CAROUSEL_VERTICAL_COMPONENT);

    Array.from(verticalCarousels).forEach((vCarousel, _i) => {
        (vCarousel as HTMLElement).dataset.carouselIndex = "0";
        const children = vCarousel.children;

        Array.from(children).forEach((child, j) => {
            (child as HTMLElement).dataset.index = String(j);
            (child as HTMLElement).classList.add(CssClass.NO_TRANSITION);
            (child as HTMLElement).classList.add(CssClass.CAROUSEL_VERTICAL_SLIDE);
            if (j === children.length - 1) {
                (child as HTMLElement).style.transform = `translateY(-100%)`;
            } else if (j === 0) {
                (child as HTMLElement).style.transform = `translateY(0)`;
            } else {
                (child as HTMLElement).style.transform = `translateY(100%)`;
            }
        });

        const slides = Array.from(vCarousel.children).filter((child) => Array.from((child as HTMLElement).classList).includes(CssClass.CAROUSEL_VERTICAL_SLIDE));
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
        buttonTop.classList.add(CssClass.CAROUSEL_BUTTON_TOP);
        buttonDown.classList.add(CssClass.CAROUSEL_BUTTON_DOWN);
        buttonTop.innerHTML = Svg.CHEVRON_TOP;
        buttonDown.innerHTML = Svg.CHEVRON_DOWN;

        const abortButtonTop = new AbortController();
        buttonTop.addEventListener(EventTrigger.CLICK, () => slideComponentToDirection({ direction: Direction.UP, component: vCarousel as HTMLElement }), { signal: abortButtonTop.signal });
        Main.state().events.push({
            element: buttonTop,
            trigger: EventTrigger.CLICK,
            callback: () => slideComponentToDirection({ direction: Direction.UP, component: vCarousel as HTMLElement }),
            aborter: abortButtonTop
        });

        const abortButtonDown = new AbortController();
        buttonDown.addEventListener(EventTrigger.CLICK, () => slideComponentToDirection({ direction: Direction.DOWN, component: vCarousel as HTMLElement }), { signal: abortButtonDown.signal });
        Main.state().events.push({
            element: buttonDown,
            trigger: EventTrigger.CLICK,
            callback: () => slideComponentToDirection({ direction: Direction.DOWN, component: vCarousel as HTMLElement }),
            aborter: abortButtonDown
        });

        const buttonPlayPause = spawn(DomElement.BUTTON);
        buttonPlayPause.classList.add(CssClass.CAROUSEL_BUTTON_PLAY);
        buttonPlayPause.innerHTML = Svg.PAUSE;
        if (!(vCarousel as HTMLElement).dataset.autoSlide) {
            buttonPlayPause.style.display = CssDisplay.NONE;
        }

        const uid = createUid();
        Main.state().intervals.push({
            id: uid,
            interval: null
        });

        if ((vCarousel as HTMLElement).dataset.autoSlide === DataAttribute.TRUE) {
            playPause({
                carousel: vCarousel as HTMLElement,
                buttonNext: buttonDown,
                buttonPrevious: buttonTop,
                uid
            });
        }

        const abortPlayPause = new AbortController();
        buttonPlayPause.addEventListener(EventTrigger.CLICK, () => togglePlayState({
            carousel: vCarousel,
            buttonPlayPause,
            buttonNext: buttonDown,
            buttonPrevious: buttonTop,
            uid
        }), { signal: abortPlayPause.signal });

        Main.state().events.push({
            element: buttonPlayPause,
            trigger: EventTrigger.CLICK,
            callback: () => togglePlayState({
                carousel: vCarousel,
                buttonPlayPause,
                buttonNext: buttonDown,
                buttonPrevious: buttonTop,
                uid
            }),
            aborter: abortPlayPause
        });

        [buttonTop, buttonDown, buttonPlayPause].forEach(e => vCarousel.appendChild(e));
    });

    Array.from(horizontalCarousels).forEach((hCarousel, _i) => {
        (hCarousel as HTMLElement).dataset.carouselIndex = "0";
        const children = hCarousel.children;

        Array.from(children).forEach((child, j) => {
            (child as HTMLElement).dataset.index = String(j);
            (child as HTMLElement).classList.add(CssClass.NO_TRANSITION);
            (child as HTMLElement).classList.add(CssClass.CAROUSEL_HORIZONTAL_SLIDE);
            if (j === children.length - 1) {
                (child as HTMLElement).style.transform = `translateX(-100%)`;
            } else if (j === 0) {
                (child as HTMLElement).style.transform = "translateX(0)";
            } else {
                (child as HTMLElement).style.transform = `translateX(100%)`;
            }
        });

        const slides = Array.from(hCarousel.children).filter((child) => Array.from((child as HTMLElement).classList).includes(CssClass.CAROUSEL_HORIZONTAL_SLIDE));

        const heights = Array.from(slides).map(child => {
            return Number(window.getComputedStyle(child as HTMLElement).height.replace("px", ""));
        });
        const maxContentHeight = Math.max(...heights);
        (hCarousel as HTMLElement).style.height = `${maxContentHeight}px`;


        const buttonLeft = spawn(DomElement.BUTTON);
        const buttonRight = spawn(DomElement.BUTTON);
        buttonLeft.classList.add(CssClass.CAROUSEL_BUTTON_LEFT);
        buttonRight.classList.add(CssClass.CAROUSEL_BUTTON_RIGHT);
        buttonLeft.innerHTML = Svg.CHEVRON_LEFT;
        buttonRight.innerHTML = Svg.CHEVRON_RIGHT;

        const abortButtonRight = new AbortController();
        buttonRight.addEventListener(EventTrigger.CLICK, () => slideComponentToDirection({ direction: Direction.RIGHT, component: hCarousel as HTMLElement }), { signal: abortButtonRight.signal });
        Main.state().events.push({
            element: buttonRight,
            trigger: EventTrigger.CLICK,
            callback: () => slideComponentToDirection({ direction: Direction.RIGHT, component: hCarousel as HTMLElement }),
            aborter: abortButtonRight
        });

        const abortButtonLeft = new AbortController();
        buttonLeft.addEventListener(EventTrigger.CLICK, () => slideComponentToDirection({ direction: Direction.LEFT, component: hCarousel as HTMLElement }), { signal: abortButtonLeft.signal });
        Main.state().events.push({
            element: buttonLeft,
            trigger: EventTrigger.CLICK,
            callback: () => slideComponentToDirection({ direction: Direction.LEFT, component: hCarousel as HTMLElement }),
            aborter: abortButtonLeft
        });

        const buttonPlayPause = spawn(DomElement.BUTTON);
        buttonPlayPause.classList.add(CssClass.CAROUSEL_BUTTON_PLAY);
        buttonPlayPause.innerHTML = Svg.PAUSE;
        if (!(hCarousel as HTMLElement).dataset.autoSlide) {
            buttonPlayPause.style.display = CssDisplay.NONE;
        }

        const uid = createUid();
        Main.state().intervals.push({
            id: uid,
            interval: null
        });

        if ((hCarousel as HTMLElement).dataset.autoSlide === DataAttribute.TRUE) {
            playPause({
                carousel: hCarousel as HTMLElement,
                buttonNext: buttonRight,
                buttonPrevious: buttonLeft,
                uid
            });
        }

        const abortPlayPause = new AbortController();
        buttonPlayPause.addEventListener(EventTrigger.CLICK, () => togglePlayState({
            carousel: hCarousel,
            buttonPlayPause,
            buttonNext: buttonRight,
            buttonPrevious: buttonLeft,
            uid
        }), { signal: abortPlayPause.signal });

        Main.state().events.push({
            element: buttonPlayPause,
            trigger: EventTrigger.CLICK,
            callback: () => togglePlayState({
                carousel: hCarousel,
                buttonPlayPause,
                buttonNext: buttonRight,
                buttonPrevious: buttonLeft,
                uid
            }),
            aborter: abortPlayPause
        });

        [buttonLeft, buttonRight, buttonPlayPause].forEach(e => hCarousel.appendChild(e));
    })
}

/** Set up horizontal slides' translateX and visibility propreties based on the current horizontal index
 * 
 * @param carousel - A direct child of the main parent Element
 */
export function setupHorizontalSlides(carousel: HTMLElement) {
    const parent = carousel.getElementsByClassName(CssClass.CAROUSEL_WRAPPER)[0];
    const slides = Array.from(parent.children).filter(slide => (Array.from(slide.classList).includes(CssClass.CAROUSEL_SLIDE))) as HTMLElement[];
    const currentHIndex = Number((parent as HTMLElement).dataset.carouselIndex);

    slides.forEach((slide, i) => {
        slide.style.width = `${Main.state().pageWidth}px`;
        if (i === currentHIndex) {
            slide.style.transform = "translateX(0)";
            slide.style.visibility = CssVisibility.INITIAL;
        } else if (i === (currentHIndex - 1 < 0 ? slides.length - 1 : currentHIndex - 1)) {
            slide.style.transform = `translateX(-${Main.state().pageWidth}px)`;
        } else if (i === (currentHIndex + 1 > slides.length - 1 ? 0 : currentHIndex + 1)) {
            slide.style.transform = `translateX(${Main.state().pageWidth}px)`;
        } else if (i > currentHIndex) {
            slide.style.transform = `translateX(${Main.state().pageWidth}px)`;
        } else if (i < currentHIndex) {
            slide.style.transform = `translateX(-${Main.state().pageWidth}px)`;
        }
    });
    Main.state().timeouts.t2 = setTimeout(() => {
        slides.forEach(slide => {
            slide.classList.remove(CssClass.NO_TRANSITION);
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
    const buttonLeft = carousel.getElementsByClassName(CssClass.NAV_BUTTON_LEFT)[0] as HTMLElement;
    const buttonRight = carousel.getElementsByClassName(CssClass.NAV_BUTTON_RIGHT)[0] as HTMLElement;

    if (!Array.from((carousel as HTMLElement).classList).includes(CssClass.LOOP)) {
        if (currentIndex === 0 && buttonLeft) {
            buttonLeft.style.opacity = '0';
            buttonLeft.style.transform = 'scale(0,0)';
            buttonLeft.style.cursor = 'default';
        } else {
            buttonLeft.style.opacity = '1';
            buttonLeft.style.transform = 'scale(1,1)';
            buttonLeft.style.cursor = 'pointer';
        }
        if (currentIndex === links.length - 1 && buttonRight) {
            buttonRight.style.opacity = '0';
            buttonRight.style.transform = 'scale(0,0)';
            buttonRight.style.cursor = 'default';

        } else {
            buttonRight.style.opacity = '1';
            buttonRight.style.transform = 'scale(1,1)';
            buttonRight.style.cursor = 'pointer';
        }
    }
}

/** Change a slide into a carousel
 * 
 * @param carousel - HTMLElement, must be a direct child of the main Parent element
 */
export function createCarousel(carousel: HTMLElement) {
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
        element.style.width = `${Main.state().pageWidth}${CssUnit.PX}`;

        if (i === 0) {
            element.style.transform = 'translateX(0)';
        } else if (i === slideCount) {
            element.style.transform = `translateX(-${Main.state().pageWidth}px)`;
            element.style.visibility = CssVisibility.HIDDEN;
        } else {
            element.style.transform = `translateX(${Main.state().pageWidth}px)`;
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
        const abortLink = new AbortController();
        link.addEventListener(EventTrigger.CLICK, () => slideTo(i), { signal: abortLink.signal });

        Main.state().events.push({
            element: link,
            trigger: EventTrigger.CLICK,
            callback: () => slideTo(i),
            aborter: abortLink
        });


        const tooltip = spawn(DomElement.DIV);
        tooltip.classList.add(CssClass.TOOLTIP_TOP);
        tooltip.classList.add(CssClass.NO_TRANSITION);
        tooltip.dataset.index = `${i}`;
        const slideTitle = slide.querySelectorAll("h1,h2,h3,h4,h5,h6")[0];

        if ((slide as HTMLElement).dataset.title) {
            (tooltip as any).innerHTML = (slide as HTMLElement).dataset.title;
        } else if (slideTitle && slideTitle.textContent) {
            tooltip.setAttribute(ElementAttribute.STYLE, `font-family:${getComputedStyle(slideTitle).fontFamily.split(",")[0]}`);
            tooltip.innerHTML = applyEllipsis(slideTitle.textContent, Main.state().tooltipEllipsisLimit);
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

        if (Main.state().isSliding) return;
        Main.state().isSliding = true;

        if (currentIndex === nextIndex) {
            Main.state().isSliding = false;
            return;
        };

        if (nextIndex > currentIndex) {
            // slide right
            slides.forEach((slide, i) => {
                if (i === nextIndex) {
                    (slide as HTMLElement).style.transform = "translateX(0)";
                } else if (i > nextIndex) {
                    (slide as HTMLElement).style.transform = `translateX(${Main.state().pageWidth}px)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                } else if (i < nextIndex) {
                    (slide as HTMLElement).style.transform = `translateX(-${Main.state().pageWidth}px)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                }
                else if (i === currentIndex) {
                    (slide as HTMLElement).style.transform = `translateX(-${Main.state().pageWidth}px)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                } else if (i === (nextIndex + 1 > slides.length - 1 ? 0 : nextIndex + 1)) {
                    (slide as HTMLElement).style.transform = `translateX(${Main.state().pageWidth}px)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                }
            });

            (slides[nextIndex] as HTMLElement).style.visibility = CssVisibility.INITIAL;
            carouselWrapper.dataset.carouselIndex = String(nextIndex);
            updateCarouselNav(carousel);
            updateLocation(`${carousel.id}/${nextIndex}`);

            Main.state().timeouts.t3 = setTimeout(() => {
                Main.state().isSliding = false;
                Main.state().wheelCount = 0;
            }, Main.state().transitionDuration);
        } else {
            // slide left
            slides.forEach((slide, i) => {
                if (i === nextIndex) {
                    (slide as HTMLElement).style.transform = "translateX(0)";
                } else if (i > nextIndex) {
                    (slide as HTMLElement).style.transform = `translateX(${Main.state().pageWidth}px)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                } else if (i < nextIndex) {
                    (slide as HTMLElement).style.transform = `translateX(-${Main.state().pageWidth}px)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                } else if (i === currentIndex) {
                    (slide as HTMLElement).style.transform = `translateX(${Main.state().pageWidth}px)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                } else if (i === (nextIndex - 1 < 0 ? slides.length - 1 : nextIndex - 1)) {
                    (slide as HTMLElement).style.transform = `translateX(-${Main.state().pageWidth}px)`;
                    (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                }
            });

            (slides[nextIndex] as HTMLElement).style.visibility = CssVisibility.INITIAL;
            carouselWrapper.dataset.carouselIndex = String(nextIndex);
            updateCarouselNav(carousel);
            updateLocation(`${carousel.id}/${nextIndex}`);

            Main.state().timeouts.t4 = setTimeout(() => {
                Main.state().isSliding = false;
                Main.state().wheelCount = 0;
            }, Main.state().transitionDuration);
        }
    }

    function slideRight() {
        if (Main.state().isSliding) return;
        Main.state().isSliding = true;

        const currentIndex = Number((carouselWrapper as HTMLElement).dataset.carouselIndex);
        const nextIndex = currentIndex + 1 > slides.length - 1 ? 0 : currentIndex + 1;

        slides.forEach((slide, i) => {
            if (i === nextIndex) {
                (slide as HTMLElement).style.transform = "translateX(0)";
            }
            if (i === currentIndex) {
                (slide as HTMLElement).style.transform = `translateX(-${Main.state().pageWidth}px)`;
                (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
            }
            if (i === (nextIndex + 1 > slides.length - 1 ? 0 : nextIndex + 1)) {
                (slide as HTMLElement).style.transform = `translateX(${Main.state().pageWidth}px)`;
                (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
            }
        });

        (slides[nextIndex] as HTMLElement).style.visibility = CssVisibility.INITIAL
        carouselWrapper.dataset.carouselIndex = String(nextIndex);
        updateCarouselNav(carousel);
        updateLocation(`${carousel.id}/${nextIndex}`);

        Main.state().timeouts.t5 = setTimeout(() => {
            Main.state().isSliding = false;
            Main.state().wheelCount = 0;
        }, Main.state().transitionDuration)
    }

    function slideLeft() {
        if (Main.state().isSliding) return;
        Main.state().isSliding = true;

        const currentIndex = Number((carouselWrapper as HTMLElement).dataset.carouselIndex);
        const nextIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;

        slides.forEach((slide, i) => {
            if (i === nextIndex) {
                (slide as HTMLElement).style.transform = "translateX(0)";
            }
            if (i === currentIndex) {
                (slide as HTMLElement).style.transform = `translateX(${Main.state().pageWidth}px)`;
                (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
            }
            if (i === (nextIndex - 1 < 0 ? slides.length - 1 : nextIndex - 1)) {
                (slide as HTMLElement).style.transform = `translateX(-${Main.state().pageWidth}px)`;
                (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
            }
        });

        (slides[nextIndex] as HTMLElement).style.visibility = CssVisibility.INITIAL;
        carouselWrapper.dataset.carouselIndex = String(nextIndex);
        updateCarouselNav(carousel);
        updateLocation(`${carousel.id}/${nextIndex}`);

        Main.state().timeouts.t6 = setTimeout(() => {
            Main.state().isSliding = false;
            Main.state().wheelCount = 0;
        }, Main.state().transitionDuration)
    }

    const abortButtonRight = new AbortController();
    buttonRight.addEventListener(EventTrigger.CLICK, slideRight, { signal: abortButtonRight.signal });
    Main.state().events.push({
        element: buttonRight,
        trigger: EventTrigger.CLICK,
        callback: slideRight,
        aborter: abortButtonRight
    });
    const abortButtonLeft = new AbortController();
    buttonLeft.addEventListener(EventTrigger.CLICK, slideLeft, { signal: abortButtonLeft.signal });
    Main.state().events.push({
        element: buttonLeft,
        trigger: EventTrigger.CLICK,
        callback: slideLeft,
        aborter: abortButtonLeft
    });

    [buttonRight, buttonLeft, nav].forEach(e => carousel.appendChild(e));
}

/** Set up slides' translateY & zIndex properties based on the current vertical index 
 * 
 * @param parent - The main parent element
 */
export function setupVerticalSlides(parent: HTMLElement) {
    const children = Array.from(parent.children).filter(child => Array.from(child.classList).includes(CssClass.SLIDE));

    const isLastSlide = getCurrentSlideIndex() === children.length - 1;
    const isFirstSlide = getCurrentSlideIndex() === 0;

    Array.from(children).forEach((child, i) => {
        if (i === Number((parent as HTMLElement).dataset.currentVIndex)) {
            (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(0);`);
            (child as HTMLElement).style.zIndex = "1";
        } else {
            if (isLastSlide && i === 0) {
                (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(${Main.state().pageHeight}px)`);
            } else if (isFirstSlide && i === children.length - 1) {
                (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(-${Main.state().pageHeight}px)`);
            } else {
                (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(${i < Number((parent as HTMLElement).dataset.currentVIndex) ? "-" : ""}${Main.state().pageHeight}px)`);
            }
            (child as HTMLElement).style.zIndex = "0";
            (child as HTMLElement).style.visibility = CssVisibility.HIDDEN;
        }
    });
}

/** Generate slide layout and event listeners
 * 
 * @param parent - The main parent element
 */
export function createMainLayout(parent: HTMLElement) {
    (parent as HTMLElement).dataset.currentVIndex = "0";
    (parent as HTMLElement).classList.add(CssClass.CAROUSEL_VERTICAL);

    // TODO: better management of excluded classes
    const children = Array.from(parent.children).filter(child => !Array.from(child.classList).includes(CssClass.DIALOG) && !Array.from(child.classList).includes(CssClass.MENU));

    Main.state().pageHeight = window.innerHeight;

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

        if (!Main.state().isLoop && isWheel) {
            if (currentVIndex === 0 && isOverflowNext) {
                Main.state().isSliding = false;
                return;
            }
            if (currentVIndex === slides.length - 1 && isOverflowPrevious) {
                Main.state().isSliding = false;
                return;
            }
        }

        if (targetIndex !== undefined) {
            differenceToTarget = currentVIndex - targetIndex;

            if (differenceToTarget === 0) {
                Main.state().isSliding = false;
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

            const verticalCarouselComponents = document.getElementsByClassName(CssClass.CAROUSEL_VERTICAL_COMPONENT);
            const horizontalCarouselComponents = document.getElementsByClassName(CssClass.CAROUSEL_HORIZONTAL_COMPONENT);

            Array.from(verticalCarouselComponents).forEach(el => (el as HTMLElement).style.opacity = "0");
            const theseVerticalCarouselComponents = (nextSlide as HTMLElement).getElementsByClassName(CssClass.CAROUSEL_VERTICAL_COMPONENT);
            if (theseVerticalCarouselComponents.length) {
                Array.from(theseVerticalCarouselComponents).forEach(el => (el as HTMLElement).style.opacity = `1`);
            }
            Array.from(horizontalCarouselComponents).forEach(el => (el as HTMLElement).style.opacity = "0");
            const theseHorizontalCarouselComponents = (nextSlide as HTMLElement).getElementsByClassName(CssClass.CAROUSEL_HORIZONTAL_COMPONENT);
            if (theseHorizontalCarouselComponents.length) {
                Array.from(theseHorizontalCarouselComponents).forEach(el => (el as HTMLElement).style.opacity = `1`);
            }

            Array.from(children).filter(child => Array.from(child.classList).includes(CssClass.SLIDE)).forEach((child, i) => {
                if (i !== currentVIndex) {
                    if (nextIndex === 0) {
                        (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(-${Main.state().pageHeight}px)`);
                    } else {
                        (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(${i < nextIndex ? "-" : ""}${Main.state().pageHeight}px)`);
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
                    (child as HTMLElement).style.zIndex = "2";
                }
            });

            (currentSlide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
            (nextSlide as HTMLElement).style.visibility = CssVisibility.INITIAL;
            (currentSlide as HTMLElement).style.transform = `translateY(${Main.state().pageHeight}px)`;
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

            Main.state().timeouts.t7 = setTimeout(() => {
                Main.state().isRouting = true;
                if (!skipHistory) {
                    updateMetaTags(nextSlide as HTMLElement);
                    updateLocation(id, clearRoutingTimeout);
                    Main.state().wheelCount = 0;
                }
                Main.state().isSliding = false;
            }, Main.state().transitionDuration);
        }

        if (direction === Direction.DOWN) {
            const nextIndex = currentVIndex + 1 >= slides.length ? 0 : currentVIndex + 1;
            const previousIndex = currentVIndex - 1 < 0 ? slides.length - 1 : currentVIndex - 1;
            const currentSlide = Array.from(slides).find((_slide, i) => i === currentVIndex);
            const nextSlide = Array.from(slides).find((_slide, i) => i === nextIndex);

            const verticalCarouselComponents = document.getElementsByClassName(CssClass.CAROUSEL_VERTICAL_COMPONENT);
            const horizontalCarouselComponents = document.getElementsByClassName(CssClass.CAROUSEL_HORIZONTAL_COMPONENT);

            Array.from(verticalCarouselComponents).forEach(el => (el as HTMLElement).style.opacity = "0");
            const theseVerticalCarouselComponents = (nextSlide as HTMLElement).getElementsByClassName(CssClass.CAROUSEL_VERTICAL_COMPONENT);
            if (theseVerticalCarouselComponents.length) {
                Array.from(theseVerticalCarouselComponents).forEach(el => (el as HTMLElement).style.opacity = `1`);
            }
            Array.from(horizontalCarouselComponents).forEach(el => (el as HTMLElement).style.opacity = "0");
            const theseHorizontalCarouselComponents = (nextSlide as HTMLElement).getElementsByClassName(CssClass.CAROUSEL_HORIZONTAL_COMPONENT);
            if (theseHorizontalCarouselComponents.length) {
                Array.from(theseHorizontalCarouselComponents).forEach(el => (el as HTMLElement).style.opacity = `1`);
            }


            Array.from(children).filter(child => Array.from(child.classList).includes(CssClass.SLIDE)).forEach((child, i) => {
                if (i !== currentVIndex) {
                    if (nextIndex === slides.length - 1) {
                        (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(${Main.state().pageHeight}px)`);
                    } else {
                        (child as HTMLElement).setAttribute(ElementAttribute.STYLE, `transform:translateY(${i < nextIndex ? "-" : ""}${Main.state().pageHeight}px)`);
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
                    (child as HTMLElement).style.zIndex = "2";
                }
            });

            (currentSlide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
            (nextSlide as HTMLElement).style.visibility = CssVisibility.INITIAL;
            (currentSlide as HTMLElement).style.transform = `translateY(-${Main.state().pageHeight}px)`;
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

            Main.state().timeouts.t8 = setTimeout(() => {
                if (!skipHistory) {
                    Main.state().isRouting = true;
                    updateMetaTags(nextSlide as HTMLElement);
                    updateLocation(id, clearRoutingTimeout);
                    Main.state().wheelCount = 0;
                }
                Main.state().isSliding = false;
            }, Main.state().transitionDuration);
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
        const abortLink = new AbortController();
        link.addEventListener(EventTrigger.CLICK, () => {
            if (Main.state().isSliding) return;
            Main.state().isSliding = true;
            slideTo({
                direction: undefined,
                targetIndex: i
            }), { signal: abortLink.signal }
        });
        Main.state().events.push({
            element: link,
            trigger: EventTrigger.CLICK,
            callback: () => {
                if (Main.state().isSliding) return;
                Main.state().isSliding = true;
                slideTo({
                    direction: undefined,
                    targetIndex: i
                })
            },
            aborter: abortLink
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
            tooltip.innerHTML = applyEllipsis(slideTitle.textContent, Main.state().tooltipEllipsisLimit);
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

        if (!Main.state().isLoop) {
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
    const abortButtonTop = new AbortController();
    buttonTop.addEventListener(EventTrigger.CLICK, () => {
        if (Main.state().isSliding) return;
        Main.state().isSliding = true;
        slideTo({ direction: Direction.UP })
    }, { signal: abortButtonTop.signal });
    if (Main.state().events) {
        Main.state().events.push({
            element: buttonTop,
            trigger: EventTrigger.CLICK,
            callback: () => {
                if (Main.state().isSliding) return;
                Main.state().isSliding = true;
                slideTo({ direction: Direction.UP })
            },
            aborter: abortButtonTop
        });
    }

    const abortButtonBottom = new AbortController();
    buttonBottom.addEventListener(EventTrigger.CLICK, () => {
        if (Main.state().isSliding) return;
        Main.state().isSliding = true;
        slideTo({ direction: Direction.DOWN })
    }, { signal: abortButtonBottom.signal });
    if (Main.state().events) {
        Main.state().events.push({
            element: buttonBottom,
            trigger: EventTrigger.CLICK,
            callback: () => {
                if (Main.state().isSliding) return;
                Main.state().isSliding = true;
                slideTo({ direction: Direction.DOWN })
            },
            aborter: abortButtonBottom
        });
    }

    function wheel(event: any) {
        if (isDialogOpen()) {
            return;
        }

        if (Main.state().wheelCount > 0) {
            return;
        }

        if (Main.state().pauseSliding) return;

        Main.state().wheelCount += 1;
        const direction = event.deltaY > 0 ? Direction.DOWN : Direction.UP;
        const isTrackpad = detectTrackPad(event);

        if (Main.state().isSliding || isTrackpad || !event.deltaY) return;
        Main.state().isSliding = true;

        if (direction === Direction.DOWN) {
            slideTo({ isWheel: true, targetIndex: Number((parent as HTMLElement).dataset.currentVIndex) + 1 > slides.length - 1 ? 0 : Number((parent as HTMLElement).dataset.currentVIndex) + 1 });
        }
        if (direction === Direction.UP) {
            slideTo({ isWheel: true, targetIndex: Number((parent as HTMLElement).dataset.currentVIndex) - 1 < 0 ? slides.length - 1 : Number((parent as HTMLElement).dataset.currentVIndex) - 1 });
        }

        Main.state().timeouts.t9 = setTimeout(() => {
            Main.state().isSliding = false;
            Main.state().wheelCount = 0;
        }, Main.state().transitionDuration);
    }

    const abortWheel = new AbortController();
    window.addEventListener(EventTrigger.WHEEL, (event: WheelEvent) => wheel(event), { signal: abortWheel.signal });
    Main.state().events.push({
        element: window,
        trigger: EventTrigger.WHEEL,
        callback: wheel,
        aborter: abortWheel
    });

    function keyup(event: any) {
        if (isDialogOpen()) {
            return;
        }

        if (Main.state().wheelCount > 0) {
            return;
        }

        if (Main.state().pauseSliding) return;

        Main.state().wheelCount += 1;

        const keyCode = event.code;
        const target = event.target as HTMLElement;
        const hasVerticalScrollBar = target.scrollHeight > target.clientHeight;
        const isInputField = [NodeName.TEXTAREA, NodeName.INPUT].includes(target.nodeName);
        const isScrollableIsland = hasVerticalScrollBar && target.nodeName !== NodeName.BODY;
        if ([isInputField, isScrollableIsland].includes(true)) return;

        const parent = document.getElementsByClassName(CssClass.PARENT)[0];
        const currentSlideIndex = Number((parent as HTMLElement).dataset.currentVIndex);
        const thisCarousel = Array.from(parent.children).filter(child => Array.from(child.classList).includes(CssClass.CHILD))[currentSlideIndex];
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
                            Main.state().isSliding = false;
                            Main.state().wheelCount = 0;
                            return;
                        }
                    }
                    (buttonRight as HTMLElement).click();

                    Main.state().timeouts.t10 = setTimeout(() => {
                        Main.state().isSliding = false;
                        Main.state().wheelCount = 0;
                    }, Main.state().transitionDuration);
                    return;
                }
                if (keyCode === KeyboardCode.ARROW_LEFT) {
                    const currentIndex = Number((carouselWrapper as HTMLElement).dataset.carouselIndex);

                    if (!Array.from((thisCarousel as HTMLElement).classList).includes(CssClass.LOOP)) {
                        if ([0].includes(currentIndex)) {
                            Main.state().isSliding = false;
                            Main.state().wheelCount = 0;
                            return;
                        }
                    }

                    (buttonLeft as HTMLElement).click();

                    Main.state().timeouts.t11 = setTimeout(() => {
                        Main.state().isSliding = false;
                        Main.state().wheelCount = 0;
                    }, Main.state().transitionDuration);
                    return;
                }
            }
        }

        if (Main.state().isSliding) return;
        Main.state().isSliding = true;

        const isntLoopAndIsLastSlide = !Main.state().isLoop && Number((parent as HTMLElement).dataset.currentVIndex) === slides.length - 1;
        const isntLoopAndFirstSlide = !Main.state().isLoop && Number((parent as HTMLElement).dataset.currentVIndex) === 0;

        switch (true) {
            case [KeyboardCode.ARROW_DOWN, KeyboardCode.SPACE].includes(keyCode) && isntLoopAndIsLastSlide:
                Main.state().isSliding = false;
                break;

            case [KeyboardCode.ARROW_UP].includes(keyCode) && isntLoopAndFirstSlide:
                Main.state().isSliding = false;
                break;

            case [KeyboardCode.ARROW_DOWN, KeyboardCode.SPACE].includes(keyCode):
                slideTo({ targetIndex: Number((parent as HTMLElement).dataset.currentVIndex) + 1 > slides.length - 1 ? 0 : Number((parent as HTMLElement).dataset.currentVIndex) + 1 })
                break;

            case [KeyboardCode.ARROW_UP].includes(keyCode):
                slideTo({ targetIndex: Number((parent as HTMLElement).dataset.currentVIndex) - 1 < 0 ? slides.length - 1 : Number((parent as HTMLElement).dataset.currentVIndex) - 1 })
                break;

            default:
                Main.state().isSliding = false;
                Main.state().wheelCount = 0;
                return;
        }
    }

    const abortKeyup = new AbortController();
    document.addEventListener(EventTrigger.KEYUP, (event: KeyboardEvent) => keyup(event), { signal: abortKeyup.signal });
    if (Main.state().events) {
        Main.state().events.push({
            element: document,
            trigger: EventTrigger.KEYUP,
            callback: keyup,
            aborter: abortKeyup
        });
    }

    function startTouch(event: any) {
        Main.state().isSliding = true;
        Main.state().eventTouchStart = event.changedTouches?.[0] || Main.state().eventTouchStart;
    }
    const abortTouchstart = new AbortController();
    document.addEventListener(EventTrigger.TOUCHSTART, (event: TouchEvent) => startTouch(event), { signal: abortTouchstart.signal });

    if (Main.state().events) {
        Main.state().events.push({
            element: document,
            trigger: EventTrigger.TOUCHSTART,
            callback: startTouch,
            aborter: abortTouchstart
        });
    }

    function endTouch(event: any) {
        if (Main.state().pauseSliding) return;
        Main.state().isSliding = false;
        Main.state().eventTouchEnd = event.changedTouches?.[0] || Main.state().eventTouchEnd;
        const hasVerticalScrollBar = event.target.scrollHeight > event.target.clientHeight;

        if (isDialogOpen()) {
            return;
        }

        // exclusion cases
        const isScrollableIsland = !Array.from(event.target.classList).includes(CssClass.CHILD) && hasVerticalScrollBar;
        if ([isScrollableIsland].includes(true)) return;
        if (Main.state().isSliding) {
            Main.state().timeouts.t12 = setTimeout(() => {
                Main.state().isSliding = false;
            });
        };

        if (!Main.state().isSliding) {
            const deltaTouchY = (Main.state().eventTouchStart.clientY - Main.state().eventTouchEnd?.clientY) ?? 0;
            const deltaTouchX = (Main.state().eventTouchStart.clientX - Main.state().eventTouchEnd?.clientX) ?? 0;
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
                    if (Main.state().isSliding) return;
                    Main.state().isSliding = true;
                    const currentIndex = Number((carouselWrapper as HTMLElement).dataset.carouselIndex);
                    const nextIndex = currentIndex + 1 > carouselSlides.length - 1 ? 0 : currentIndex + 1;

                    if (!Array.from((thisCarousel as HTMLElement).classList).includes(CssClass.LOOP)) {
                        if ([carouselSlides.length - 1].includes(currentIndex)) {
                            Main.state().isSliding = false;
                            Main.state().wheelCount = 0;
                            return;
                        }
                    }

                    carouselSlides.forEach((slide, i) => {
                        if (i === nextIndex) {
                            (slide as HTMLElement).style.transform = "translateX(0)";
                        }
                        if (i === currentIndex) {
                            (slide as HTMLElement).style.transform = `translateX(-${Main.state().pageWidth}px)`;
                            (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                        }
                        if (i === (nextIndex + 1 > carouselSlides.length - 1 ? 0 : nextIndex + 1)) {
                            (slide as HTMLElement).style.transform = `translateX(${Main.state().pageWidth}px)`;
                            (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                        }
                    });

                    (carouselSlides[nextIndex] as HTMLElement).style.visibility = CssVisibility.INITIAL;
                    (carouselWrapper as HTMLElement).dataset.carouselIndex = String(nextIndex);
                    updateCarouselNav(thisCarousel as HTMLElement);
                    updateLocation(`${thisCarousel.id}/${nextIndex}`);

                    Main.state().timeouts.t13 = setTimeout(() => {
                        Main.state().isSliding = false;
                        Main.state().wheelCount = 0;
                    }, Main.state().transitionDuration);
                } else {
                    // left
                    if (Main.state().isSliding) return;
                    Main.state().isSliding = true;

                    const currentIndex = Number((carouselWrapper as HTMLElement).dataset.carouselIndex);
                    const nextIndex = currentIndex - 1 < 0 ? carouselSlides.length - 1 : currentIndex - 1;

                    if (!Array.from((thisCarousel as HTMLElement).classList).includes(CssClass.LOOP)) {
                        if ([0].includes(currentIndex)) {
                            Main.state().isSliding = false;
                            Main.state().wheelCount = 0;
                            return;
                        }
                    }

                    carouselSlides.forEach((slide, i) => {
                        if (i === nextIndex) {
                            (slide as HTMLElement).style.transform = "translateX(0)";
                        }
                        if (i === currentIndex) {
                            (slide as HTMLElement).style.transform = `translateX(${Main.state().pageWidth}px)`;
                            (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                        }
                        if (i === (nextIndex - 1 < 0 ? carouselSlides.length - 1 : nextIndex - 1)) {
                            (slide as HTMLElement).style.transform = `translateX(-${Main.state().pageWidth}px)`;
                            (slide as HTMLElement).style.visibility = CssVisibility.HIDDEN;
                        }
                    });

                    (carouselSlides[nextIndex] as HTMLElement).style.visibility = CssVisibility.INITIAL;
                    (carouselWrapper as HTMLElement).dataset.carouselIndex = String(nextIndex);
                    updateCarouselNav(thisCarousel as HTMLElement);
                    updateLocation(`${thisCarousel.id}/${nextIndex}`);

                    Main.state().timeouts.t14 = setTimeout(() => {
                        Main.state().isSliding = false;
                        Main.state().wheelCount = 0;
                    }, Main.state().transitionDuration);
                }
            } else {
                const direction = deltaTouchY > 0 ? Direction.DOWN : Direction.UP;
                const parent = document.getElementsByClassName(CssClass.PARENT)[0];
                const currentSlideIndex = Number((parent as HTMLElement).dataset.currentVIndex);
                if (!Main.state().isLoop) {
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
    }

    const abortTouchend = new AbortController();
    document.addEventListener(EventTrigger.TOUCHEND, (event: any) => endTouch(event), { signal: abortTouchend.signal });
    if (Main.state().events) {
        Main.state().events.push({
            element: document,
            trigger: EventTrigger.TOUCHEND,
            callback: endTouch,
            aborter: abortTouchend
        });
    }

    function resize() {
        Main.state().pageHeight = window.innerHeight;
        Main.state().pageWidth = window.innerWidth;
        setupVerticalSlides(parent);
        const carousels = document.getElementsByClassName(CssClass.CAROUSEL);
        Array.from(carousels).forEach(carousel => setupHorizontalSlides((carousel as HTMLElement)))
    }

    const abortResize = new AbortController();
    window.addEventListener(EventTrigger.RESIZE, resize, { signal: abortResize.signal });
    if (Main.state().events) {
        Main.state().events.push({
            element: window,
            trigger: EventTrigger.RESIZE,
            callback: resize,
            aborter: abortResize
        });
    }

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

    // TODO: export as a qrollReset function
    // if typeof window === 'undefined' return; 
    window.onload = () => {
        const currentSlideId = getCurrentSlideId().replace("#", "") || Array.from(parent.children).filter(c => Array.from(c.classList).includes(CssClass.CHILD))[0].id;
        const targetIndex = Number(grabId(currentSlideId).dataset.index);
        parent.dataset.currentVIndex = `${targetIndex}`;
        Array.from(children).filter(child => (Array.from(child.classList).includes(CssClass.SLIDE))).forEach((child) => {
            child.classList.add(CssClass.NO_TRANSITION);
        });
        setupVerticalSlides(parent);
        updateNav();
        restoreCarousel();
        updateCarouselNav(grabId(currentSlideId));
        updateMetaTags(grabId(currentSlideId) as HTMLElement);

        Main.state().timeouts.t15 = setTimeout(() => {
            Array.from(children).filter(child => (Array.from(child.classList).includes(CssClass.SLIDE))).forEach((child) => {
                child.classList.remove(CssClass.NO_TRANSITION);
            });
        }, Main.state().transitionDuration);
    }

    function clearRoutingTimeout() {
        clearTimeout(Main.state().timeoutRouter)
        Main.state().timeoutRouter = setTimeout(() => {
            Main.state().isRouting = false;
            Main.state().isSliding = false;
            Main.state().wheelCount = 0;
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
            setupHorizontalSlides(grabId(currentSlideId));
        }
    }

    function hashChange() {
        if (Main.state().isRouting) return;
        Main.state().isRouting = true;
        const currentSlideId = getCurrentSlideId().replace("#", "");
        const targetIndex = Number(grabId(currentSlideId).dataset.index);
        slideTo({ targetIndex, skipHistory: true });
        restoreCarousel();
        updateCarouselNav(grabId(currentSlideId));
        updateNav();
        clearRoutingTimeout();
    }

    const abortHashchange = new AbortController();
    window.addEventListener(EventTrigger.HASHCHANGE, hashChange, { signal: abortHashchange.signal });
    if (Main.state().events) {
        Main.state().events.push({
            element: window,
            trigger: EventTrigger.HASHCHANGE,
            callback: hashChange,
            aborter: abortHashchange
        });
    }

    [nav, buttonTop, buttonBottom].forEach(e => parent.appendChild(e));
}

const carousel = {
    createCarousel,
    createCarouselComponents,
    createDialogs,
    createMainLayout,
    closeDialog,
    openDialog,
    setupVerticalSlides,
}

export default carousel;

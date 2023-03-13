import { CssClass, CssDisplay, CssUnit, DomElement, ElementAttribute, ElementId, EventTrigger } from "./constants";
import { createUid, getNavColorFromParentClasses, grabId, walkTheDOM, setTabIndex, spawn } from "./functions";

/** Change a slide into a carousel
 * 
 * @param state - The global state object declared in main
 * @param carousel - HTMLElement, must be a direct child of the main Parent element
 */
export function createCarousel(state: any, carousel: HTMLElement) {
    if (!carousel) return;
    if (!(Array.from(carousel.classList).includes(CssClass.CAROUSEL))) return;

    const carouselSlides = carousel.children as unknown as HTMLElement[];

    for (let i = 0; i < carouselSlides.length; i += 1) {
        const uid = createUid();
        const element = carouselSlides[i];
        element.classList.add(CssClass.CAROUSEL_SLIDE);
        element.dataset.carousel = uid;
        element.setAttribute(ElementAttribute.ID, element.id || `slide-h-${i}-${carousel.id}`);
        element.style.width = `${state.pageWidth}${CssUnit.PX}`;
        element.style.left = `${state.pageWidth * i}${CssUnit.PX}`;
        element.dataset.carouselIndex = `${i}`;
        Array.from(element.children).forEach(child => walkTheDOM(child, setTabIndex));
    }
}


/** Creates nested carousels based on the presence of the corresponding css class of any div included in a slide.
 * 
 * @param slide - HTMLElement, must be a direct child of the main Parent element
 * @param parent  - HTMLElement, the main Parent element
 */
export function createNestedCarousels(slide: HTMLElement, parent: HTMLElement) {
    // will work with deep nodes inside the slide
    const carousels = Array.from(slide.getElementsByClassName(CssClass.NESTED_CAROUSEL)).filter(el => !!el);
    if (!carousels || !carousels.length) return;

    Array.from(carousels).forEach((carousel, index) => {
        if (!Array.from(carousel.classList).includes(CssClass.NESTED_CAROUSEL)) return;
        carousel.classList.add(CssClass.NESTED_CAROUSEL_WRAPPER);
        (carousel as HTMLElement).dataset.nestedCarouselIndex = "0";
        (carousel as HTMLElement).dataset.nestedCarouselOrder = `${index}`;

        const children = carousel.children;
        const carouselBox = carousel.getBoundingClientRect();

        Array.from(children).forEach((child, i) => {
            child.classList.add(CssClass.NESTED_CAROUSEL_CHILD);
            (child as HTMLElement).dataset.nestedCarouselChildIndex = `${i}`;
            (child as HTMLElement).style.left = `${carouselBox.width * i}${CssUnit.PX}`;
            switch (true) {
                case Array.from(carousel.classList).includes(CssClass.TRANSITION_300):
                    child.classList.add(CssClass.TRANSITION_300)
                    break;
                case Array.from(carousel.classList).includes(CssClass.TRANSITION_400):
                    child.classList.add(CssClass.TRANSITION_400)
                    break;
                case Array.from(carousel.classList).includes(CssClass.TRANSITION_500):
                    child.classList.add(CssClass.TRANSITION_500)
                    break;
                case Array.from(carousel.classList).includes(CssClass.TRANSITION_600):
                    child.classList.add(CssClass.TRANSITION_600)
                    break;
                case Array.from(carousel.classList).includes(CssClass.TRANSITION_700):
                    child.classList.add(CssClass.TRANSITION_700)
                    break;
                case Array.from(carousel.classList).includes(CssClass.TRANSITION_800):
                    child.classList.add(CssClass.TRANSITION_800)
                    break;
                case Array.from(carousel.classList).includes(CssClass.TRANSITION_900):
                    child.classList.add(CssClass.TRANSITION_900)
                    break;
                case Array.from(carousel.classList).includes(CssClass.TRANSITION_1000):
                    child.classList.add(CssClass.TRANSITION_1000)
                    break;

                default:
                    child.classList.add(CssClass.TRANSITION_500)
                    break;
            }
        });

        const childrenCount = Array.from(carousel.children).filter(child => (Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD))).length;

        const navLeft = spawn(DomElement.BUTTON);
        const navRight = spawn(DomElement.BUTTON);

        navLeft.setAttribute(ElementAttribute.TYPE, DomElement.BUTTON);
        navRight.setAttribute(ElementAttribute.TYPE, DomElement.BUTTON);

        navLeft.setAttribute(ElementAttribute.TABINDEX, "1");
        navRight.setAttribute(ElementAttribute.TABINDEX, "1");

        navLeft.setAttribute(ElementAttribute.ID, `${ElementId.NESTED_CAROUSEL_NAV_LEFT}${slide.id}_${index}`);
        navRight.setAttribute(ElementAttribute.ID, `${ElementId.NESTED_CAROUSEL_NAV_RIGHT}${slide.id}_${index}`);

        navLeft.classList.add(CssClass.NESTED_CAROUSEL_BUTTON_LEFT);
        navRight.classList.add(CssClass.NESTED_CAROUSEL_BUTTON_RIGHT);

        navLeft.innerHTML = `<svg id="${ElementId.NESTED_CAROUSEL_NAV_LEFT}${slide.id}_${index}" class="qroll-icon-chevron" xmlns="http://www.w3.org/2000/svg" height="100%" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="${getNavColorFromParentClasses(parent)}" ><path id="${ElementId.NESTED_CAROUSEL_NAV_LEFT}${slide.id}_${index}" stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>`;
        navRight.innerHTML = `<svg id="${ElementId.NESTED_CAROUSEL_NAV_RIGHT}${slide.id}_${index}" class="qroll-icon-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3"><path id="${ElementId.NESTED_CAROUSEL_NAV_RIGHT}${slide.id}_${index}" stroke-linecap="round" stroke-linejoin="round" stroke="${getNavColorFromParentClasses(parent)}" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>`;

        let progressBar: any;
        if (Array.from(carousel.classList).includes(CssClass.PROGRESS)) {
            progressBar = spawn(DomElement.DIV);
            progressBar.classList.add(CssClass.NESTED_CAROUSEL_PROGRESS_BAR);
            progressBar.setAttribute(ElementAttribute.STYLE, `${(carousel as HTMLElement).dataset.progressCss}`)
        }

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
                progressBar.setAttribute(ElementAttribute.STYLE, `width:${Number((carousel as HTMLElement).dataset.nestedCarouselIndex) / (childrenCount - 1) * 100}%;${(carousel as HTMLElement).dataset.progressCss}`)
            }
        };

        navRight.addEventListener(EventTrigger.CLICK, () => {
            if (Number((carousel as HTMLElement).dataset.nestedCarouselIndex) >= childrenCount - 1) {
                if (Array.from(carousel.classList).includes(CssClass.LOOP)) {
                    Array.from(carousel.children)
                        .filter(child => Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD))
                        .forEach((child, i) => {
                            (child as HTMLElement).style.left = `${carouselBox.width * i}${CssUnit.PX}`;
                        });
                    (carousel as HTMLElement).dataset.nestedCarouselIndex = "0";
                    updateNav();
                }
                return;
            } else {
                (carousel as HTMLElement).dataset.nestedCarouselIndex = `${Number((carousel as HTMLElement).dataset.nestedCarouselIndex) + 1}`;
                Array.from(carousel.children)
                    .filter(child => Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD))
                    .forEach((child) => {
                        (child as HTMLElement).style.left = Number((child as HTMLElement).style.left.replace(CssUnit.PX, "")) - carouselBox.width + CssUnit.PX;
                    });
                updateNav();
            }
        });

        navLeft.addEventListener(EventTrigger.CLICK, () => {
            if (Number((carousel as HTMLElement).dataset.nestedCarouselIndex) <= 0) {
                if (Array.from(carousel.classList).includes(CssClass.LOOP)) {
                    Array.from(carousel.children)
                        .filter(child => Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD))
                        .reverse()
                        .forEach((child, i) => {
                            (child as HTMLElement).style.left = `-${carouselBox.width * i}${CssUnit.PX}`;
                        });
                    (carousel as HTMLElement).dataset.nestedCarouselIndex = `${Array.from(carousel.children).filter(child => Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD)).length - 1}`;
                    updateNav();
                }
                return;
            } else {
                (carousel as HTMLElement).dataset.nestedCarouselIndex = `${Number((carousel as HTMLElement).dataset.nestedCarouselIndex) - 1}`;
                Array.from(carousel.children)
                    .forEach((child, i) => {
                        if (!Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD)) return;
                        (child as HTMLElement).style.left = Number((child as HTMLElement).style.left.replace(CssUnit.PX, "")) + carouselBox.width + CssUnit.PX;
                    });
                updateNav();
            }
        });

        updateNav();

        if (Array.from(carousel.classList).includes(CssClass.PROGRESS)) {
            carousel.appendChild(progressBar);
        }

        carousel.appendChild(navLeft);
        carousel.appendChild(navRight);
    });
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

const carousel = {
    createCarousel,
    createNestedCarousels,
    updateNestedCarousels
}

export default carousel;

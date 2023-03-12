import { CssClass, DomElement, ElementId, EventTrigger } from "./constants";
import { createUid, getNavColorFromParentClasses, grabId, walkTheDOM, setTabIndex, spawn } from "./functions";

export function createCarousel(state: any, carousel: HTMLElement) {
    if (!carousel) return;
    if (!(Array.from(carousel.classList).includes(CssClass.CAROUSEL))) return;

    const carouselSlides = carousel.children as unknown as HTMLElement[];

    for (let i = 0; i < carouselSlides.length; i += 1) {
        const uid = createUid();
        const element = carouselSlides[i];
        element.classList.add(CssClass.CAROUSEL_SLIDE);
        element.dataset.carousel = uid;
        element.setAttribute("id", element.id || `slide-h-${i}-${carousel.id}`);
        element.style.width = `${state.pageWidth}px`;
        element.style.left = `${state.pageWidth * i}px`;
        element.dataset.carouselIndex = `${i}`;
        Array.from(element.children).forEach(child => walkTheDOM(child, setTabIndex));
    }
}

export function createNestedCarousels(slide: HTMLElement, parent: HTMLElement) {
    // will work with deep nodes inside the slide
    const carousels = Array.from(slide.getElementsByClassName(CssClass.NESTED_CAROUSEL)).filter(el => !!el);
    if (!carousels || !carousels.length) return;

    if (!carousels) return;
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
            (child as HTMLElement).style.left = `${carouselBox.width * i}px`;
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

        const kidCount = Array.from(carousel.children).filter(kid => (Array.from(kid.classList).includes(CssClass.NESTED_CAROUSEL_CHILD))).length;

        const navLeft = spawn(DomElement.BUTTON);
        const navRight = spawn(DomElement.BUTTON);

        navLeft.setAttribute("type", DomElement.BUTTON);
        navRight.setAttribute("type", DomElement.BUTTON);

        navLeft.setAttribute("tabindex", "1");
        navRight.setAttribute("tabindex", "1");

        navLeft.setAttribute("id", `${ElementId.NESTED_CAROUSEL_NAV_LEFT}${slide.id}_${index}`);
        navRight.setAttribute("id", `${ElementId.NESTED_CAROUSEL_NAV_RIGHT}${slide.id}_${index}`);

        navLeft.classList.add(CssClass.NESTED_CAROUSEL_BUTTON_LEFT);
        navRight.classList.add(CssClass.NESTED_CAROUSEL_BUTTON_RIGHT);

        navLeft.innerHTML = `<svg id="${ElementId.NESTED_CAROUSEL_NAV_LEFT}${slide.id}_${index}" class="qroll-icon-chevron" xmlns="http://www.w3.org/2000/svg" height="100%" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="${getNavColorFromParentClasses(parent)}" ><path id="${ElementId.NESTED_CAROUSEL_NAV_LEFT}${slide.id}_${index}" stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>`;
        navRight.innerHTML = `<svg id="${ElementId.NESTED_CAROUSEL_NAV_RIGHT}${slide.id}_${index}" class="qroll-icon-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3"><path id="${ElementId.NESTED_CAROUSEL_NAV_RIGHT}${slide.id}_${index}" stroke-linecap="round" stroke-linejoin="round" stroke="${getNavColorFromParentClasses(parent)}" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>`;

        // progress bar
        let progressBar: any;
        if (Array.from(carousel.classList).includes("qroll-progress")) {
            progressBar = spawn(DomElement.DIV);
            progressBar.classList.add("qroll-nested-carousel-progress-bar");
            progressBar.setAttribute("style", `${(carousel as HTMLElement).dataset.progressCss}`)
        }

        const isEndRight = () => Number((carousel as HTMLElement).dataset.nestedCarouselIndex) >= kidCount - 1;
        const isEndLeft = () => Number((carousel as HTMLElement).dataset.nestedCarouselIndex) <= 0;

        const updateNav = () => {
            if (isEndRight() && !Array.from(carousel.classList).includes(CssClass.LOOP)) {
                navRight.style.display = "none";
            } else {
                navRight.style.display = "flex";
            }

            if (isEndLeft() && !Array.from(carousel.classList).includes(CssClass.LOOP)) {
                navLeft.style.display = "none";
            } else {
                navLeft.style.display = "flex";
            }

            if (Array.from(carousel.classList).includes("qroll-progress")) {
                progressBar.setAttribute("style", `width:${Number((carousel as HTMLElement).dataset.nestedCarouselIndex) / (kidCount - 1) * 100}%;${(carousel as HTMLElement).dataset.progressCss}`)
            }

        }


        navRight.addEventListener("click", () => {
            if (Number((carousel as HTMLElement).dataset.nestedCarouselIndex) >= kidCount - 1) {
                if (Array.from(carousel.classList).includes(CssClass.LOOP)) {
                    Array.from(carousel.children).filter(child => Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD)).forEach((child, i) => {
                        (child as HTMLElement).style.left = `${carouselBox.width * i}px`;
                    });
                    (carousel as HTMLElement).dataset.nestedCarouselIndex = "0";
                    updateNav();
                }
                return;
            } else {
                (carousel as HTMLElement).dataset.nestedCarouselIndex = `${Number((carousel as HTMLElement).dataset.nestedCarouselIndex) + 1}`;
                Array.from(carousel.children).forEach((child, i) => {
                    if (!Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD)) return;
                    (child as HTMLElement).style.left = Number((child as HTMLElement).style.left.replace("px", "")) - carouselBox.width + "px";
                });

                updateNav();
            }
        });

        navLeft.addEventListener("click", () => {
            if (Number((carousel as HTMLElement).dataset.nestedCarouselIndex) <= 0) {
                if (Array.from(carousel.classList).includes(CssClass.LOOP)) {
                    Array.from(carousel.children).filter(child => Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD)).reverse().forEach((child, i) => {
                        (child as HTMLElement).style.left = `-${carouselBox.width * i}px`;
                    });
                    (carousel as HTMLElement).dataset.nestedCarouselIndex = `${Array.from(carousel.children).filter(child => Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD)).length - 1}`;
                    updateNav();
                }
                return;
            } else {
                (carousel as HTMLElement).dataset.nestedCarouselIndex = `${Number((carousel as HTMLElement).dataset.nestedCarouselIndex) - 1}`;
                Array.from(carousel.children).forEach((child, i) => {
                    if (!Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD)) return;
                    (child as HTMLElement).style.left = Number((child as HTMLElement).style.left.replace("px", "")) + carouselBox.width + "px"
                });

                updateNav();
            }

        });

        updateNav();

        if (Array.from(carousel.classList).includes("qroll-progress")) {
            carousel.appendChild(progressBar)
        }

        carousel.appendChild(navLeft);
        carousel.appendChild(navRight);

    })
}

export function updateNestedCarousels(slide: HTMLElement, isResize: boolean = false) {
    const carousels = Array.from(slide.getElementsByClassName(CssClass.NESTED_CAROUSEL)).filter(el => !!el);
    if (!carousels) return;

    Array.from(carousels).forEach((carousel, index) => {
        if (!Array.from(carousel.classList).includes(CssClass.NESTED_CAROUSEL)) return;

        const currentIndex = Number((carousel as HTMLElement).dataset.nestedCarouselIndex);

        const kidCount = Array.from(carousel.children).filter(child => Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD)).length;
        const carouselBox = (carousel as HTMLElement).getBoundingClientRect();

        Array.from(carousel.children)
            .filter(child => Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD))
            .forEach((child, i) => {
                const diff = i - currentIndex;
                (child as HTMLElement).style.left = `${carouselBox.width * diff}px`;
            });

        const navLeft = grabId(`${ElementId.NESTED_CAROUSEL_NAV_LEFT}${slide.id}_${index}`);
        const navRight = grabId(`${ElementId.NESTED_CAROUSEL_NAV_RIGHT}${slide.id}_${index}`);

        const isEndRight = () => Number((carousel as HTMLElement).dataset.nestedCarouselIndex) >= kidCount - 1;
        const isEndLeft = () => Number((carousel as HTMLElement).dataset.nestedCarouselIndex) <= 0;

        const updateNav = () => {
            if (isEndRight() && !Array.from(carousel.classList).includes(CssClass.LOOP)) {
                navRight.style.display = "none";
            } else {
                navRight.style.display = "flex";
            }

            if (isEndLeft() && !Array.from(carousel.classList).includes(CssClass.LOOP)) {
                navLeft.style.display = "none";
            } else {
                navLeft.style.display = "flex";
            }

            if (Array.from(carousel.classList).includes("qroll-progress")) {
                const progressBar = carousel.getElementsByClassName("qroll-nested-carousel-progress-bar")[0];
                progressBar.setAttribute("style", `width:${Number((carousel as HTMLElement).dataset.nestedCarouselIndex) / (kidCount - 1) * 100}%;${(carousel as HTMLElement).dataset.progressCss}`);
            }
        }

        function clickRight() {
            const wrapperBox = (carousel as HTMLElement).getBoundingClientRect();
            if (Number((carousel as HTMLElement).dataset.nestedCarouselIndex) >= kidCount - 1) {
                if (Array.from(carousel.classList).includes(CssClass.LOOP)) {
                    Array.from(carousel.children).filter(child => Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD)).forEach((child, i) => {
                        (child as HTMLElement).style.left = `${wrapperBox.width * i}px`;
                    });
                    (carousel as HTMLElement).dataset.nestedCarouselIndex = "0";
                    updateNav();
                }
                return;
            } else {
                (carousel as HTMLElement).dataset.nestedCarouselIndex = `${Number((carousel as HTMLElement).dataset.nestedCarouselIndex) + 1}`;
                Array.from(carousel.children).forEach((child, i) => {
                    if (!Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD)) return;
                    (child as HTMLElement).style.left = Number((child as HTMLElement).style.left.replace("px", "")) - wrapperBox.width + "px";
                });

                updateNav();
            }
        }

        function clickLeft() {
            const wrapperBox = (carousel as HTMLElement).getBoundingClientRect();
            if (Number((carousel as HTMLElement).dataset.nestedCarouselIndex) <= 0) {
                if (Array.from(carousel.classList).includes(CssClass.LOOP)) {
                    Array.from(carousel.children).filter(child => Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD)).reverse().forEach((child, i) => {
                        (child as HTMLElement).style.left = `-${wrapperBox.width * i}px`;
                    });
                    (carousel as HTMLElement).dataset.nestedCarouselIndex = `${Array.from(carousel.children).filter(child => Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD)).length - 1}`;
                    updateNav();
                }
                return;
            } else {
                (carousel as HTMLElement).dataset.nestedCarouselIndex = `${Number((carousel as HTMLElement).dataset.nestedCarouselIndex) - 1}`;
                Array.from(carousel.children).forEach((child, i) => {
                    if (!Array.from(child.classList).includes(CssClass.NESTED_CAROUSEL_CHILD)) return;
                    (child as HTMLElement).style.left = Number((child as HTMLElement).style.left.replace("px", "")) + wrapperBox.width + "px"
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

    })

}

const carousel = {
    createCarousel,
    createNestedCarousels,
    updateNestedCarousels
}

export default carousel;

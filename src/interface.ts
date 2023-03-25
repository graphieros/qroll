import { CssClass } from "./constants";
/** Exposed interface. Get all the descendants of the qroll-main element.
 * 
 * @returns an array of slides
 */
export function getSlides() {
    const slides = document.getElementsByClassName(CssClass.CHILD);
    const nav = document.getElementsByClassName(CssClass.NAV_VERTICAL)[0].getElementsByClassName(CssClass.TOOLTIP_LEFT);
    if (slides.length) {
        return Array.from(slides).map((slide, i) => {
            return {
                element: slide,
                index: i,
                title: nav[i] ? nav[i].innerHTML : '',
                hasCarousel: Array.from(slide.classList).includes(CssClass.CAROUSEL)
            }
        });
    }
    return "There are no slides.";
}

/** Exposed interface. Slide down 1 slide. If called while currently on the last slide, will loop to the first slide.
 * 
 */
export function slideDown() {
    (document.getElementsByClassName(CssClass.NAV_BUTTON_DOWN)[0] as HTMLElement).click();
}

/** Exposed interface. Slide up 1 slide. If called while currently on the first slide, will loop to the last slide.
 * 
 */
export function slideUp() {
    (document.getElementsByClassName(CssClass.NAV_BUTTON_TOP)[0] as HTMLElement).click();
}

export function slideToIndex(index: number) {
    const nav = document.getElementsByClassName(CssClass.NAV_VERTICAL)[0];
    const links = nav.getElementsByClassName(CssClass.NAV_LINK);
    try {
        (links[index] as HTMLElement).click();
    }
    catch (error) {
        throw new Error(`The specified index does not correspond to an existing slide. Max index available: ${links.length - 1}; index provided: ${index}`);
    }
}

export function getCurrentSlideIndex() {
    const parent = document.getElementsByClassName(CssClass.MAIN)[0];
    if (!parent) {
        return "No parent element has been found. Did you add the 'qroll-parent' id, and the 'qroll-main' css class to your parent HTML element ?"
    } else {
        return Number((parent as HTMLElement).dataset.currentVIndex);
    }
}

const publicInterface = {
    getCurrentSlideIndex,
    getSlides,
    slideDown,
    slideUp,
    slideToIndex
}

export default publicInterface;

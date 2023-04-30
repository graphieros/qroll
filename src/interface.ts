import { Slide } from "../types";
import { CssClass } from "./constants";

/** Exposed interface. Get all the descendants of the qroll-main element.
 * 
 * @returns an array of slides
 */
export function getSlides(): Slide[] | string {
    const slides = document.getElementsByClassName(CssClass.CHILD);
    const nav = document.getElementsByClassName(CssClass.NAV_VERTICAL)[0].getElementsByClassName(CssClass.TOOLTIP_LEFT);
    if (slides.length) {
        return Array.from(slides).map((slide, i) => {
            return {
                element: slide,
                index: i,
                title: nav[i] ? nav[i].innerHTML : '',
                hasCarousel: Array.from(slide.classList).includes(CssClass.CAROUSEL)
            } as Slide
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

/** Exposed interface. Slide to target index and optional target horizontal slide index.
 * 
 * @param index - index of the target slide
 * @param slide - index of the target horizontal slide
 */
export function slideToIndex(index: number, slide: number | null = null) {
    if (slide !== null) {
        const targetSlide = document.getElementsByClassName(CssClass.CHILD)[index];
        const mainNav = document.getElementsByClassName(CssClass.NAV_VERTICAL)[0];
        const links = mainNav.getElementsByClassName(CssClass.NAV_LINK);
        const horizontalNav = targetSlide.getElementsByClassName("qroll-nav-link");
        try {
            (horizontalNav[slide] as HTMLElement).click();
            (links[index] as HTMLElement).click(); // necessary to make it work when the target index is already on target slide
        }
        catch (error) {
            throw new Error(`The specified index does not correspond to an existing slide.\n> Max index available: ${links.length - 1}\n> Max slide available: ${horizontalNav.length - 1}\n> Index provided: ${index}\n> Slide provided: ${slide}`)
        }
        return;
    }

    const nav = document.getElementsByClassName(CssClass.NAV_VERTICAL)[0];
    const links = nav.getElementsByClassName(CssClass.NAV_LINK);
    try {
        (links[index] as HTMLElement).click();
    }
    catch (error) {
        throw new Error(`The specified index does not correspond to an existing slide.\n> Max index available: ${links.length - 1}\n> Index provided: ${index}`);
    }
}

/** Exposed interface. Returns the current slide index
 * 
 * @returns the current slide index
 */
export function getCurrentSlideIndex() {
    const parent = document.getElementsByClassName(CssClass.MAIN)[0];
    if (!parent) {
        throw new Error("No parent element has been found. Did you add the 'qroll-parent' id, and the 'qroll-main' css class to your parent HTML element ?");
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

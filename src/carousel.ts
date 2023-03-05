import { CssClass } from "./constants";
import { createUid, walkTheDOM, setTabIndex } from "./functions";

export default function createCarousel(state: any, carousel: HTMLElement) {
    if (!carousel) return;
    if (!(Array.from(carousel.classList).includes(CssClass.CAROUSEL))) return;

    // 0. get all included divs and place them in a flex row
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
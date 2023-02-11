import { Options } from "../types";
import { CssClass } from "./constants";
// 
// TODO: add option for looping
// TODO: add option for looping
// TODO: find a way to include css

// 3 slides
// 1
// 2
// 3


// start translate0

// scroll : snaps to the next slide by using translate
// before that you need a copy of the first slide to be appended to the page array
// once it's spapped : remove the first page form the array and set translate to 0


// let childClass = CssClass.CHILD;
// let childPosition = 0;
// let isScrollLocked = false;

const parentClass = CssClass.PARENT;
let isChanging = false;

const getUid = () => {
    let d = new Date().getTime();//Timestamp
    let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

const logError = (err: string) => {
    console.error('Alpra-scroll exception:', { err })
}

const Main = (parentName: string, _options: Options = {}) => {

    const parent = document.getElementById(parentName) as HTMLElement;
    if (!parent) return logError('parent name not found: ' + parentName);

    parent.classList.add(parentClass);

    const children = parent.children as unknown as HTMLElement[];
    for (let i = 0; i < children.length; i += 1) {
        const uid = getUid();
        const element = children[i];
        element.classList.add(CssClass.CHILD);
        element.setAttribute("id", element.id || `child_${uid}`);
        element.dataset.index = `page-${i}`;
    }

    // function deleteOriginalSlide(pageId: string) {
    //     console.log('deleteOriginalSlide',pageId);
    //     // remove the slide that was duplicated
    // }


    function duplicateSlide(pageId: string) {
        console.log('duplicateSlide', pageId);
        const element = document.getElementById(pageId)?.cloneNode() as HTMLElement;
        element.setAttribute("id", getUid());
        element.innerHTML = (document.getElementById(pageId) as HTMLElement).innerHTML;
        parent.appendChild(element as HTMLElement);
        //copy first page and append it
    }


    function removeSlide(slideId: string) {
        setTimeout(() => {
            parent.removeChild(document.getElementById(slideId) as HTMLElement);
            isChanging = false;
        }, 1000);
    }

    function scroll() {
        if (isChanging) return;

        isChanging = true;
        // get the next page ID
        const firstPageId = children[0].id;
        const nextPageId = children[1].id;

        duplicateSlide(firstPageId);
        snapSlide(nextPageId);
        removeSlide(firstPageId);
    }


    function snapSlide(pageId: string) {
        const element = document.getElementById(pageId) as HTMLElement;
        if (element) {
            scrollIntoView(element);
        } else {
            console.error(`Element '${pageId}' not found`)
        }
    }

    function scrollIntoView(element: HTMLElement) {
        element.scrollIntoView({
            behavior: "smooth",
        })
    }

    document.addEventListener("wheel", scroll);
    // function toggleScroll(isLocked: boolean) {
    //     isScrollLocked = isLocked;
    // }

}

export default Main;
export function createUid() {
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

/** This check fixes a bug that snaps previous/next page when the finger quits the trackpad.
* 
* @param e - wheelevent
* @returns true if the trackpad is detected
*/
export function detectTrackPad(event: any) {
    let isTrack = false;
    if (event.wheelDeltaY) {
        if (event.wheelDeltaY === (event.deltaY * -3)) {
            isTrack = true;
        }
    }
    else if (event.deltaMode === 0 /* firefox */) {
        isTrack = true;
    }
    return isTrack;
}

export function grabId(elementId: string) {
    return document.getElementById(elementId) as HTMLElement;
}

export function jumpToSlide(slideId: string) {
    const url = location.href;
    location.href = `#${slideId}`;
    history.replaceState(null, '', url);
}

export function logError(error: string) {
    console.error('Alpra-scroll exception:', { error })
}

/**
 * 
 * @param element - HTML Element
 * @param options - Behavior (auto or smooth); block (start, center or nearest)
 */
export function scrollIntoView(element: HTMLElement, options: { behavior: ScrollBehavior; block: ScrollLogicalPosition; }) {
    element.scrollIntoView({
        behavior: options.behavior,
        block: options.block
    });
}

export function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

export function setTabIndex(element: { scrollHeight: number; clientHeight: number; setAttribute: (arg0: string, arg1: string) => void; }) {
    if (element.scrollHeight > element.clientHeight) {
        element.setAttribute("tabindex", "0");
    }
}

export function updateCssClasses({ element, addedClasses = [], removedClasses = [] }: { element: HTMLElement, addedClasses: string[], removedClasses: string[] }) {
    if (addedClasses.length) {
        addedClasses.forEach(addedClass => {
            element.classList.add(addedClass);
        });
    }
    if (removedClasses.length) {
        removedClasses.forEach(removedClass => {
            element.classList.remove(removedClass);
        });
    }
}

export function walkTheDOM(node: any, func: any) {
    func(node);
    node = node.firstChild;

    while (node) {
        walkTheDOM(node, func);
        node = node.NextSibling;
    }
}


const alpra = {
    createUid,
    detectTrackPad,
    grabId,
    jumpToSlide,
    logError,
    scrollIntoView,
    scrollToTop,
    setTabIndex,
    updateCssClasses,
    walkTheDOM
};

export default alpra;

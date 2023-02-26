/** Apply ellipsis on a string depending on a limit
 * 
 * @param text - string to apply the ellipsis on
 * @param limit - number over which exceeding text will be replaced with '...'
 * @returns the text with allipsis applied on the char limit
 */
export function applyEllipsis(text: string, limit: number) {
    if (text.length < limit) return text;
    return `${text.slice(0, limit)}...`;
}

/** Generates a unique id
 * 
 * @returns a unique string id
 */
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

/** Shorthand for document.getElementById
 * 
 * @param elementId - string
 * @returns an HTMLElement
 */
export function grabId(elementId: string) {
    return document.getElementById(elementId) as HTMLElement;
}

/** Get an HTMLELement by its data-slide attribute id
 * 
 * @param elementId - string
 * @returns an HTMLElement
 */
export function grabByData(elementId: string) {
    return document.querySelector(`[data-slide="${elementId}"]`)
}

export function logError(error: string) {
    console.error('Kodex exception:', { error })
}

/**
 * 
 * @param arr - alpra-parent children array
 * @param index - the target index
 * @returns the reordered children, starting with the target index. If the original array is [0,1,2,3] and the target index is 2, the output will be ordered as [2,3,0,1]
 */
export function reorderArrayByIndex(arr: any, index: number) {
    const thatIndex = arr.findIndex((element: any) => Number(element.dataset.index) === index);

    if (index === -1) {
        return arr;
    }

    const firstHalf = arr.slice(thatIndex);
    const secondHalf = arr.slice(0, thatIndex);

    return [...firstHalf, ...secondHalf];
}

/** Make an element scrollable if its scrollHeight > clientHeight
 * 
 * @param element - HTMLElement
 */
export function setTabIndex(element: { scrollHeight: number; clientHeight: number; setAttribute: (arg0: string, arg1: string) => void; }) {
    if (element.scrollHeight > element.clientHeight) {
        element.setAttribute("tabindex", "0");
    }
}

/** Shorthand for document.createElement
 * 
 * @param element - string
 * @returns a dom element
 */
export function spawn(element: string) {
    return document.createElement(element);
}

/** Mutate an array by swapping 2 elements
 * 
 * @param arr - any array of any datatype
 * @param from - int: the index to move
 * @param to - int: the destination index of the moved element
 * @returns the reordered array
 */
export function swapArrayPositions(arr: any, from: number, to: number) {
    arr.splice(to, 0, arr.splice(from, 1)[0]);
    return arr;
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

/** Traverse the dom an apply a callback as long as there is a node
 * 
 * @param node - HTMLElement
 * @param func - callback applied recursively
 */
export function walkTheDOM(node: any, func: any) {
    func(node);
    node = node.firstChild;

    while (node) {
        walkTheDOM(node, func);
        node = node.NextSibling;
    }
}


const alpra = {
    applyEllipsis,
    createUid,
    detectTrackPad,
    grabId,
    grabByData,
    logError,
    reorderArrayByIndex,
    setTabIndex,
    swapArrayPositions,
    updateCssClasses,
    walkTheDOM
};

export default alpra;

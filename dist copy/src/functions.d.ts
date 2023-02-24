/** Apply ellipsis on a string depending on a limit
 *
 * @param text - string to apply the ellipsis on
 * @param limit - number over which exceeding text will be replaced with '...'
 * @returns the text with allipsis applied on the char limit
 */
export declare function applyEllipsis(text: string, limit: number): string;
/** Generates a unique id
 *
 * @returns a unique string id
 */
export declare function createUid(): string;
/** This check fixes a bug that snaps previous/next page when the finger quits the trackpad.
*
* @param e - wheelevent
* @returns true if the trackpad is detected
*/
export declare function detectTrackPad(event: any): boolean;
/** Shorthand for document.getElementById
 *
 * @param elementId - string
 * @returns an HTMLElement
 */
export declare function grabId(elementId: string): HTMLElement;
/** Get an HTMLELement by its data-slide attribute id
 *
 * @param elementId - string
 * @returns an HTMLElement
 */
export declare function grabByData(elementId: string): Element | null;
export declare function logError(error: string): void;
/**
 *
 * @param arr - alpra-parent children array
 * @param index - the target index
 * @returns the reordered children, starting with the target index. If the original array is [0,1,2,3] and the target index is 2, the output will be ordered as [2,3,0,1]
 */
export declare function reorderArrayByIndex(arr: any, index: number): any;
/** Make an element scrollable if its scrollHeight > clientHeight
 *
 * @param element - HTMLElement
 */
export declare function setTabIndex(element: {
    scrollHeight: number;
    clientHeight: number;
    setAttribute: (arg0: string, arg1: string) => void;
}): void;
/** Shorthand for document.createElement
 *
 * @param element - string
 * @returns a dom element
 */
export declare function spawn(element: string): HTMLElement;
export declare function updateCssClasses({ element, addedClasses, removedClasses }: {
    element: HTMLElement;
    addedClasses: string[];
    removedClasses: string[];
}): void;
/** Traverse the dom an apply a callback as long as there is a node
 *
 * @param node - HTMLElement
 * @param func - callback applied recursively
 */
export declare function walkTheDOM(node: any, func: any): void;
declare const alpra: {
    applyEllipsis: typeof applyEllipsis;
    createUid: typeof createUid;
    detectTrackPad: typeof detectTrackPad;
    grabId: typeof grabId;
    grabByData: typeof grabByData;
    logError: typeof logError;
    reorderArrayByIndex: typeof reorderArrayByIndex;
    setTabIndex: typeof setTabIndex;
    updateCssClasses: typeof updateCssClasses;
    walkTheDOM: typeof walkTheDOM;
};
export default alpra;

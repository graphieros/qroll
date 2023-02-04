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

const functions = {
    updateCssClasses
};

export default functions;

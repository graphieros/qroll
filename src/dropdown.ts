import Main from "./main";
import { CssClass, CssDisplay, DomElement, ElementAttribute, EventTrigger, KeyboardCode, Svg } from "./constants";
import { addTo, spawn } from "./functions";
import { Slide } from "../types/index";

export function createDropdownMenu() {
    const menu = document.getElementsByClassName(CssClass.MENU)[0] as HTMLElement;
    if (!menu) return;

    const isAuto = menu.dataset.auto === "true";
    const hasPosition = !!menu.dataset.position;
    const hasUserCssClasses = !!menu.dataset.cssClasses;
    const position = hasPosition ? menu.dataset.position : "left";
    const hasTitle = !!menu.dataset.title;
    const hasAdditionalLinks = !!menu.dataset.additionalLinks;

    menu.classList.add(`${CssClass.MENU}--${position}`);

    if (hasUserCssClasses) {
        menu.dataset.cssClasses?.split(" ").forEach(cssClass => {
            menu.classList.add(cssClass);
        });
    }

    const backdrop = spawn(DomElement.DIV);
    backdrop.classList.add(CssClass.MENU_BACKDROP);
    backdrop.style.display = CssDisplay.NONE;
    menu.appendChild(backdrop);

    const triggerButton = spawn(DomElement.BUTTON);
    addTo(triggerButton, ElementAttribute.TABINDEX, 0);
    triggerButton.classList.add(CssClass.MENU_TRIGGER_BUTTON);
    triggerButton.innerHTML = Svg.MENU;

    const triggerMenuButtonAborter = new AbortController();

    triggerButton.addEventListener(EventTrigger.CLICK, toggleMenu, { signal: triggerMenuButtonAborter.signal });

    Main.state().events.push({
        element: triggerButton,
        trigger: EventTrigger.CLICK,
        callback: toggleMenu,
        aborter: triggerMenuButtonAborter
    });

    // MENU DROPDOWN BODY
    const menuBody = spawn(DomElement.NAV);
    menuBody.classList.add(CssClass.MENU_BODY);
    addTo(menuBody, ElementAttribute.TABINDEX, "0");
    menuBody.style.display = CssDisplay.NONE;

    if (hasTitle) {
        const menuTitle = spawn(DomElement.DIV);
        menuTitle.classList.add(CssClass.MENU_TITLE);
        menuTitle.innerHTML = menu.dataset.title || "";
        menuBody.appendChild(menuTitle);
    }

    if (isAuto) {
        const links = (Main.getSlides() as Slide[]).map(({ element, index, title, hasCarousel }: { element: HTMLElement, index: number, title: string, hasCarousel: boolean }) => {
            let horizontalSlides = element.getElementsByClassName("qroll-carousel-slide");
            if (horizontalSlides.length) {
                horizontalSlides = Array.from(horizontalSlides).map((slide, i) => {
                    return {
                        index: i,
                        title: (slide as HTMLElement).dataset.title || String(i)
                    }
                }) as any
            }
            return {
                index, title, hasCarousel, horizontalSlides
            }
        });
        // console.log(links)
        if (links.length) {
            links.forEach((link: any, i: any) => {
                const menuItem = spawn(DomElement.DIV);
                menuItem.classList.add(CssClass.MENU_ITEM);
                addTo(menuItem, ElementAttribute.TABINDEX, "0");
                addTo(menuItem, ElementAttribute.ROLE, DomElement.BUTTON);
                menuItem.innerHTML = link.title;
                const linkAborter = new AbortController();
                menuItem.addEventListener(EventTrigger.CLICK, () => linkTo(link.index), { signal: linkAborter.signal });
                menuItem.addEventListener(EventTrigger.KEYUP, (e) => {
                    if ([KeyboardCode.SPACE, KeyboardCode.ENTER].includes(e.key)) {
                        linkTo(link.index)
                    }
                }, { signal: linkAborter.signal });
                Main.state().events.push({
                    element: menuItem,
                    trigger: EventTrigger.CLICK,
                    callback: () => linkTo(link.index),
                    aborter: linkAborter
                });
                Main.state().events.push({
                    element: menuItem,
                    trigger: EventTrigger.KEYUP,
                    callback: () => linkTo(link.index),
                    aborter: linkAborter
                });

                // if (link.horizontalSlides.length) {
                //     menuItem.dataset.sideMenu = "true";
                //     menuItem.classList.add(`qroll-side-menu-trigger-${i}`);
                //     const subMenu = spawn(DomElement.DIV);
                //     subMenu.classList.add("qroll-main-menu-submenu");
                //     addTo(subMenu, ElementAttribute.ID, `qroll-side-menu-trigger-${i}`);
                //     subMenu.style.display = CssDisplay.NONE;

                //     link.horizontalSlides.forEach((slide: any) => {
                //         const subMenuItem = spawn(DomElement.DIV);
                //         addTo(subMenuItem, ElementAttribute.TABINDEX, "0");
                //         addTo(subMenuItem, ElementAttribute.ROLE, DomElement.BUTTON);
                //         subMenuItem.innerHTML = slide.title;
                //         subMenu.appendChild(subMenuItem);
                //     });

                //     menuBody.appendChild(subMenu);

                //     function showSideMenu() {
                //         subMenu.style.display = CssDisplay.FLEX;
                //     }

                //     menuItem.addEventListener("mouseover", showSideMenu)
                // }

                menuBody.appendChild(menuItem);
            });
        }
        updateMenuSelection();
    }

    if (hasAdditionalLinks) {
        const additionalLinks = JSON.parse(menu.dataset.additionalLinks as string);
        additionalLinks.forEach((link: any) => {
            if (!link.href && !link.slideTo) {
                throw new Error("A link needs to have at least an href atttribute or a slideTo attribute");
            }
            if (link.href) {
                const a = spawn(DomElement.A);
                a.classList.add(CssClass.MENU_LINK);
                addTo(a, "href", link.href);
                if (link.target) {
                    addTo(a, "target", link.target);
                }
                if (link.id) {
                    addTo(a, "id", link.id);
                }
                if (link.label) {
                    a.innerHTML = link.label;
                } else {
                    a.innerHTML = link.href;
                }
                menuBody.appendChild(a);
            }
            if (link.slideTo) {
                const slideLink = spawn(DomElement.DIV);
                if (link.id) {
                    addTo(slideLink, "id", link.id);
                }
                if (!link.slideTo) {
                    throw new Error('A slide link must have a slideTo attribute. Example: "slideTo":"3,2"');
                }

                const slideIndex = link.slideTo.split(",");
                const slideLinkAborter = new AbortController();
                if (slideIndex.length === 2) {
                    slideLink.addEventListener(EventTrigger.CLICK, () => Main.slideToIndex(+slideIndex[0], +slideIndex[1]), { signal: slideLinkAborter.signal });
                    Main.state().events.push({
                        element: slideLink,
                        trigger: EventTrigger.CLICK,
                        callback: () => Main.slideToIndex(+slideIndex[0], +slideIndex[1]),
                        aborter: slideLinkAborter
                    });
                } else {
                    slideLink.addEventListener(EventTrigger.CLICK, () => Main.slideToIndex(+slideIndex[0]), { signal: slideLinkAborter.signal });
                    Main.state().events.push({
                        element: slideLink,
                        trigger: EventTrigger.CLICK,
                        callback: () => Main.slideToIndex(+slideIndex[0]),
                        aborter: slideLinkAborter
                    });
                }
                slideLink.innerHTML = link.label;
                slideLink.classList.add(CssClass.MENU_ITEM);
                addTo(slideLink, ElementAttribute.TABINDEX, "0");
                addTo(slideLink, ElementAttribute.ROLE, DomElement.BUTTON);
                menuBody.appendChild(slideLink);
            }
        });
    }

    // add document click event to trigger close on click outside

    let isMenuOpen = false;

    function toggleMenu() {
        menuBody.style.display = isMenuOpen ? CssDisplay.NONE : CssDisplay.FLEX;

        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            openMenu();
        } else {
            closeMenu();
        }
        updateMenuSelection();
    }

    function updateMenuSelection() {
        const links = document.getElementsByClassName(CssClass.MENU_ITEM);
        Array.from(links).forEach((link, i) => {
            link.classList.remove(CssClass.MENU_ITEM_SELECTED);
            if (i === Main.getCurrentSlideIndex()) {
                link.classList.add(CssClass.MENU_ITEM_SELECTED);
            }
        })
    }

    function linkTo(index: number) {
        // TODO: adapt to link to horizontal slide
        Main.slideToIndex(index);
        setTimeout(toggleMenu, Main.state().transitionDuration / 2);
    }

    function openMenu() {
        Main.state().pauseSliding = true;
        (document.getElementsByClassName(CssClass.MENU_BODY)[0] as HTMLElement).focus();
        (document.getElementsByClassName(CssClass.MENU_BACKDROP)[0] as HTMLElement).style.display = CssDisplay.INITIAL;
    }

    function closeMenu() {
        isMenuOpen = false;
        Main.state().pauseSliding = false;
        (document.getElementsByClassName(CssClass.MENU_BODY)[0] as HTMLElement).style.display = CssDisplay.NONE;
        (document.getElementsByClassName(CssClass.MENU_BACKDROP)[0] as HTMLElement).style.display = CssDisplay.NONE;
    }

    const openAborter = new AbortController();
    window.addEventListener(EventTrigger.KEYUP, (e) => {
        if (e.key === KeyboardCode.ESCAPE) {
            closeMenu();
        }
    }, { signal: openAborter.signal });

    Main.state().events.push({
        element: window,
        trigger: EventTrigger.KEYUP,
        callback: closeMenu,
        aborter: openAborter
    });

    const clickBackdropAborter = new AbortController();
    document.addEventListener(EventTrigger.CLICK, (e) => {
        if (Array.from((e.target as HTMLElement).classList).includes(CssClass.MENU_BACKDROP)) {
            closeMenu();
        }
    }, { signal: clickBackdropAborter.signal });

    Main.state().events.push({
        element: document,
        trigger: EventTrigger.CLICK,
        callback: closeMenu,
        aborter: clickBackdropAborter
    });

    [triggerButton, menuBody].forEach(e => menu.appendChild(e));
}

const dropdowns = {
    createDropdownMenu
}

export default dropdowns;
import { ScrollDirection } from "../types";

export namespace CssClass {
    export const CAROUSEL = "qroll-carousel";
    export const CAROUSEL_HORIZONTAL_SLIDE = "qroll-carousel-component-horizontal-slide";
    export const CAROUSEL_SLIDE = "qroll-carousel-slide";
    export const CAROUSEL_VERTICAL = "qroll-carousel-vertical";
    export const CAROUSEL_VERTICAL_SLIDE = "qroll-carousel-component-vertical-slide";
    export const CAROUSEL_WRAPPER = "qroll-slide-carousel-wrapper";
    export const CAROUSEL_HORIZONTAL_COMPONENT = "qroll-carousel-component-horizontal";
    export const CAROUSEL_VERTICAL_COMPONENT = "qroll-carousel-component-vertical";
    export const CAROUSEL_BUTTON_TOP = "qroll-component-button-top";
    export const CAROUSEL_BUTTON_DOWN = "qroll-component-button-down";
    export const CAROUSEL_BUTTON_PLAY = "qroll-component-button-play";
    export const CAROUSEL_BUTTON_RIGHT = "qroll-component-button-right";
    export const CAROUSEL_BUTTON_LEFT = "qroll-component-button-left";

    export const CHILD = "qroll-child";

    export const DIALOG = "qroll-dialog";
    export const DIALOG_BODY = "qroll-dialog-body";
    export const DIALOG_BUTTON_CLOSE = "qroll-dialog-button-close";
    export const DIALOG_CAROUSEL = "qroll-dialog-carousel-horizontal";
    export const DIALOG_CONTENT = "qroll-dialog-content";
    export const DIALOG_TITLE = "qroll-dialog-title";

    export const HAS_HORIZONTAL_NAV = "qroll-has-horizontal-nav";
    export const HAS_NAV = "qroll-nav";
    export const LOOP = "qroll-loop";
    export const MAIN = "qroll-main";

    export const NAV_BUTTON_DOWN = "qroll-carousel-vertical-button-down";
    export const NAV_BUTTON_LEFT = "qroll-carousel-horizontal-button-left";
    export const NAV_BUTTON_RIGHT = "qroll-carousel-horizontal-button-right";
    export const NAV_BUTTON_TOP = "qroll-carousel-vertical-button-top";
    export const NAV_HORIZONTAL = "qroll-horizontal-nav";
    export const NAV_HORIZONTAL_ELEMENT_WRAPPER = "qroll-nav-horizontal-element-wrapper";
    export const NAV_LINK = "qroll-nav-link";
    export const NAV_LINK_SELECTED = "qroll-nav-link-selected";
    export const NAV_VERTICAL = "qroll-nav-vertical";

    export const NO_TRANSITION = "qroll-no-transition";
    export const PARENT = "qroll-parent";
    export const SLIDE = "qroll-slide";

    export const TOOLTIP = "qroll-tooltip";
    export const TOOLTIP_LEFT = "qroll-tooltip-left";
    export const TOOLTIP_TOP = "qroll-tooltip-top";

    export const TRANSITION_1000 = "qroll-transition-1000";
    export const TRANSITION_300 = "qroll-transition-300";
    export const TRANSITION_400 = "qroll-transition-400";
    export const TRANSITION_500 = "qroll-transition-500";
    export const TRANSITION_600 = "qroll-transition-600";
    export const TRANSITION_700 = "qroll-transition-700";
    export const TRANSITION_800 = "qroll-transition-800";
    export const TRANSITION_900 = "qroll-transition-900";

    export const CHART = "qroll-chart";
    export const CHART_DATALABEL_X = "qroll-chart__data-label-x";
    export const CHART_DATAPOINT_CIRCLE = "qroll-chart__datapoint-circle";
    export const CHART_LEGEND = "qroll-chart__legend";
    export const CHART_LEGEND_BLOCK = "qroll-chart__legend__block";
    export const CHART_LEGEND_ITEM = "qroll-chart__legend-item";
    export const CHART_LEGEND_ITEM_LEFT = "qroll-chart__legend-item--left";
    export const CHART_LEGEND_ITEM_RIGHT = "qroll-chart__legend-item--right";
    export const CHART_LEGEND_MARKER_RIGHT = "qroll-chart__legend-marker--right";
    export const CHART_LEGEND_NAME_LEFT = "qroll-chart__legend-name--left";
    export const CHART_LINE = "qroll-chart__line";
    export const CHART_TOOLTIP = "qroll-chart__tooltip";
    export const CHART_TOOLTIP_DATE = "qroll-chart__tooltip-date";
    export const CHART_TOOLTIP_ITEM = "qroll-chart__tooltip-item";
    export const CHART_TOOLTIP_TRAP = "qroll-chart__tooltip-trap";
    export const CHART_BAR = "qroll-chart__bar";
    export const CHART_DONUT = "qroll-chart__donut";
    export const CHART_DONUT_LABEL = "qroll-chart__donut__label";
    export const CHART_DONUT_MARKER = "qroll-chart__donut__marker";
    export const CHART_DONUT_CENTER_LABEL = "qroll-chart__donut__center-label";
}

export namespace CssDisplay {
    export const NONE = "none";
    export const FLEX = "flex";
}
export namespace CssPointer {
    export const DEFAULT = "default";
    export const POINTER = "pointer";
}
export namespace CssUnit {
    export const PX = "px";
}
export namespace CssVisibility {
    export const INITIAL = "initial";
    export const HIDDEN = "hidden";
}

export namespace DataAttribute {
    export const CAROUSEL = "[data-carousel]";
    export const FALSE = "false";
    export const PAUSE = "pause";
    export const TRUE = "true";
}

export namespace Direction {
    export const DOWN = "down" as ScrollDirection;
    export const LEFT = "left" as ScrollDirection;
    export const RIGHT = "right" as ScrollDirection;
    export const UP = "up" as ScrollDirection;
}

export namespace DomElement {
    export const A = "a";
    export const BUTTON = "button";
    export const DIV = "DIV";
    export const NAV = "nav";
    export const SPAN = "span";
    export const DIALOG = "dialog";
    export const META = "meta";
    export const TITLE = "title";
}

export namespace ElementAttribute {
    export const STYLE = "style";
    export const ID = "id";
    export const TYPE = "type";
    export const TABINDEX = "tabindex";
    export const CONTENT = "content";
    export const NAME = "name";
    export const HEIGHT = "height";
    export const WIDTH = "width";
}

export namespace ElementId {
    export const PARENT = "qroll-parent";
}

export namespace EventTrigger {
    export const HASHCHANGE = "hashchange";
    export const KEYUP = "keyup";
    export const RESIZE = "resize";
    export const TOUCHEND = "touchend";
    export const TOUCHMOVE = "touchmove";
    export const TOUCHSTART = "touchstart";
    export const WHEEL = "wheel";
    export const CLICK = "click";
    export const MOUSEMOVE = "mousemove";
}

export namespace KeyboardCode {
    export const ARROW_DOWN = "ArrowDown";
    export const ARROW_LEFT = "ArrowLeft";
    export const ARROW_RIGHT = "ArrowRight";
    export const ARROW_UP = "ArrowUp";
    export const ENTER = "Enter";
    export const SPACE = "Space";
}

export namespace NodeName {
    export const BODY = "BODY";
    export const INPUT = "INPUT";
    export const TEXTAREA = "TEXTAREA";
}

export namespace Svg {
    export const CHEVRON_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>`;
    export const CHEVRON_LEFT = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>`;
    export const CHEVRON_TOP = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" height="30px" width="30px"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>`;
    export const CHEVRON_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" height="30px" width="30px"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>`;
    export const CLOSE = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`;
    export const PAUSE = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>`;
    export const PLAY = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>`;
}

export namespace SvgAttribute {
    export const X1 = "x1";
    export const Y1 = "y1";
    export const X2 = "x2";
    export const Y2 = "y2";
    export const X = "x";
    export const Y = "y";
    export const CX = "cx";
    export const CY = "cy";
    export const R = "r";
    export const TEXT_ANCHOR = "text-anchor";
    export const STROKE = "stroke";
    export const STROKE_WIDTH = "stroke-width";
    export const STROKE_LINECAP = "stroke-linecap";
    export const STROKE_LINEJOIN = "stroke-linejoin";
    export const FILL = "fill";
    export const FONT_SIZE = "font-size";
    export const VIEWBOX = "viewBox";
}

export namespace SvgElement {
    export const CIRCLE = "circle";
    export const LINE = "line";
    export const FOREIGNOBJECT = "foreignObject";
    export const RECT = "rect";
    export const SVG = "svg";
    export const G = "g";
    export const TEXT = "text";
    export const PATH = "path";
}

export namespace SvgTextPosition {
    export const LEFT = "left";
    export const MIDDLE = "middle";
    export const RIGHT = "right";
}

export namespace Chart {
    export const LINE = "line";
    export const BAR = "bar";
    export const DONUT = "donut";
}
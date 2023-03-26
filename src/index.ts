import { OurWindow } from "../types";
import Main from "./main";
import { CssClass, ElementId } from "./constants";
import "@/css/index.css";

if (typeof window !== 'undefined') {
    (window as unknown as OurWindow).qroll = Main;
}

Main(ElementId.PARENT, {
    sectionClass: CssClass.CHILD
});
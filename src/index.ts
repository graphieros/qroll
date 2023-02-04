import { OurWindow } from "../types";
import Main from "./main";
// import "./css";

if (typeof window !== 'undefined') {
    (window as unknown as OurWindow).mainFunc = Main;
}

Main("alpra-parent", {
    sectionClass: "alpra-child"
});
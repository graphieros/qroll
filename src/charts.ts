import { Chart, CssClass, DomElement, ElementAttribute, EventTrigger, SvgAttribute, SvgElement, SvgTextPosition } from "./constants";
import { addTo, createUid, findClosestNumberInArray, spawn, spawnNS } from "./functions";

// TODO: dark mode

export function checkDirtyInputs(input: string | undefined) {
    if (!input) return;
    if (input.includes("<script>")) {
        throw new Error(`Script tags cannot be included in a data-attribute.`)
    }
}

export function createCharts() {
    const children = document.getElementsByClassName(CssClass.CHART);
    if (!children.length) return;

    Array.from(children).forEach(child => {

        /////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////
        ///////////                   LINE CHART                      ///////////
        /////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////


        if ((child as HTMLElement).dataset.type === Chart.LINE) {

            const userInputs = [
                (child as HTMLElement).dataset.colors,
                (child as HTMLElement).dataset.legend,
                (child as HTMLElement).dataset.lineSize,
                (child as HTMLElement).dataset.plotValue,
                (child as HTMLElement).dataset.plot,
                (child as HTMLElement).dataset.subtitle,
                (child as HTMLElement).dataset.symbol,
                (child as HTMLElement).dataset.ticks,
                (child as HTMLElement).dataset.title,
                (child as HTMLElement).dataset.tooltip,
                (child as HTMLElement).dataset.type,
                (child as HTMLElement).dataset.valueBox,
                (child as HTMLElement).dataset.xAxis,
                (child as HTMLElement).dataset.yAxis,
                (child as HTMLElement).dataset.yGrid,
                (child as HTMLElement).dataset.xGrid,
                (child as HTMLElement).dataset.xValues,
                (child as HTMLElement).dataset.yValues,
            ];

            userInputs.forEach((input: string | undefined) => checkDirtyInputs(input));

            const uid = createUid();

            const xValues = JSON.parse((child as HTMLElement).dataset.xValues as any);
            const yValues = JSON.parse((child as HTMLElement).dataset.yValues as any);
            let maxValue = Math.max(...Object.values(xValues).flatMap(serie => Math.max(...serie as any)));
            let minValue = Math.min(...Object.values(xValues).flatMap(serie => Math.min(...serie as any)));
            const maxDatapoints = Math.max(...Object.values(xValues).flatMap(serie => (serie as any).length));
            const isBasedZero = minValue >= 0;

            if (minValue > 0) {
                minValue = 0;
            }

            const svgHeight = 512;
            const svgWidth = 828;
            const plotSize = Number((child as HTMLElement).dataset.plotSize) || 6;
            const lineSize = Number((child as HTMLElement).dataset.lineSize) || 2;
            const hasTitle = !!(child as HTMLElement).dataset.title;
            const hasSubtitle = !!(child as HTMLElement).dataset.subtitle;
            // TODO: set some of these as true by default so the user doesn't have to true them
            const showPlots = (child as HTMLElement).dataset.plot === "true";
            const showYAxis = (child as HTMLElement).dataset.yAxis === "true";
            const showXAxis = (child as HTMLElement).dataset.xAxis === "true";
            const showTicks = (child as HTMLElement).dataset.ticks === "true";
            const showXGrid = (child as HTMLElement).dataset.xGrid === "true";
            const showYGrid = (child as HTMLElement).dataset.yGrid === "true";
            const showPlotValue = (child as HTMLElement).dataset.plotValue === "true";
            const showTooltip = (child as HTMLElement).dataset.tooltip === "true";
            const hideLegend = (child as HTMLElement).dataset.legend === "false";
            const dataSymbol = (child as HTMLElement).dataset.symbol;

            let colors: any;

            const defaultColors = [
                "#3366CC",
                "#DC3912",
                "#FF9900",
                "#109618",
                "#990099",
                "#3B3EAC",
                "#0099C6",
                "#DD4477",
                "#66AA00",
                "#B82E2E",
                "#316395",
                "#994499",
                "#22AA99",
                "#AAAA11",
                "#6633CC",
                "#E67300",
                "#8B0707",
                "#329262",
                "#5574A6",
                "#651067"
            ];

            if ((child as HTMLElement).dataset.colors) {
                colors = JSON.parse((child as HTMLElement).dataset.colors as any);
            } else {
                colors = defaultColors;
            }

            const chartSvg = spawnNS(SvgElement.SVG);
            addTo(chartSvg, "xmlns", "http://www.w3.org/2000/svg");
            addTo(chartSvg, "preserveAspectRatio", "xMinYMid meet");

            chartSvg.classList.add(CssClass.CHART_LINE);

            const interval = ((svgWidth - 180) / (maxDatapoints - 1));
            const padding = {
                x: 90,
                y: 75
            }

            addTo(chartSvg, SvgAttribute.VIEWBOX, `0 0 ${svgWidth} ${svgHeight}`);

            function calcY(value: number) {
                return (svgHeight - (padding.y * 2)) * (1 - (value / (maxValue + Math.abs(minValue)))) + (padding.y);
            }

            const plots = Object.keys(xValues).map((serie, index) => {
                return {
                    name: serie,
                    color: colors[index],
                    serie: xValues[serie].map((s: any, i: any) => {
                        let val = s;
                        if (isBasedZero) {
                            val = s;
                        } else {
                            if (s === minValue) {
                                val = 0;
                            } else {
                                val = s += Math.abs(minValue);
                            }
                        }
                        return {
                            absoluteValue: xValues[serie][i],
                            value: `${s}${dataSymbol ?? ''}`,
                            x: (i * interval) + padding.x,
                            y: calcY(val),
                            color: colors[index] || defaultColors[index]
                        }
                    }),
                }
            });

            const axisLines = spawnNS(SvgElement.G);
            if (showYAxis) {
                const yAxis = spawnNS(SvgElement.LINE);
                addTo(yAxis, SvgAttribute.X1, padding.x);
                addTo(yAxis, SvgAttribute.Y1, padding.y);
                addTo(yAxis, SvgAttribute.X2, padding.x);
                addTo(yAxis, SvgAttribute.Y2, svgHeight - padding.y);
                yAxis.style.stroke = "grey";
                axisLines.appendChild(yAxis);
            }

            if (showXAxis) {
                const xAxis = spawnNS(SvgElement.LINE);
                addTo(xAxis, SvgAttribute.X1, padding.x);
                addTo(xAxis, SvgAttribute.Y1, calcY(Math.abs(minValue)));
                addTo(xAxis, SvgAttribute.X2, svgWidth - padding.x);
                addTo(xAxis, SvgAttribute.Y2, calcY(Math.abs(minValue)));
                xAxis.style.stroke = "grey";
                axisLines.appendChild(xAxis);
            }

            if (showYAxis || showXAxis) {
                chartSvg.appendChild(axisLines);
            }

            if (showXGrid) {
                const gXGrid = spawnNS(SvgElement.G);
                for (let i = 0; i < maxDatapoints; i += 1) {
                    const xLine = spawnNS(SvgElement.LINE);
                    addTo(xLine, SvgAttribute.X1, (i * interval) + padding.x);
                    addTo(xLine, SvgAttribute.X2, (i * interval) + padding.x);
                    addTo(xLine, SvgAttribute.Y1, padding.y);
                    addTo(xLine, SvgAttribute.Y2, svgHeight - padding.y);
                    xLine.style.stroke = "rgba(0,0,0,0.2)";
                    gXGrid.appendChild(xLine);
                }
                chartSvg.appendChild(gXGrid);
            }

            if (showTicks) {
                const gTicks = spawnNS(SvgElement.G);
                for (let i = 0; i < maxDatapoints; i += 1) {
                    const tickX = spawnNS(SvgElement.CIRCLE);
                    addTo(tickX, SvgAttribute.R, 2);
                    addTo(tickX, SvgAttribute.CX, (i * interval) + padding.x);
                    addTo(tickX, SvgAttribute.CY, calcY(Math.abs(minValue)));
                    tickX.style.fill = "grey";
                    gTicks.appendChild(tickX);

                    gTicks.appendChild(createText({
                        content: yValues[i] ?? "",
                        x: (i * interval) + padding.x + interval / 2,
                        y: calcY(0) + 40,
                        fontSize: 20
                    }));
                }
                for (let i = 0; i <= (maxValue + Math.abs(minValue)); i += ((maxValue + Math.abs(minValue)) / 10)) {
                    const tickY = spawnNS(SvgElement.CIRCLE);
                    addTo(tickY, SvgAttribute.R, 2);
                    addTo(tickY, SvgAttribute.CX, padding.x);
                    addTo(tickY, SvgAttribute.CY, calcY(i));
                    tickY.style.fill = "grey";
                    gTicks.appendChild(tickY);

                    if (showYGrid) {
                        const yLine = spawnNS("line");
                        addTo(yLine, SvgAttribute.X1, padding.x);
                        addTo(yLine, SvgAttribute.X2, svgWidth - padding.x);
                        addTo(yLine, SvgAttribute.Y1, calcY(i));
                        addTo(yLine, SvgAttribute.Y2, calcY(i));
                        yLine.style.stroke = "rgba(0,0,0,0.2)";
                        gTicks.appendChild(yLine);
                    }

                    gTicks.appendChild(createText({
                        content: `${Math.round(minValue + i)}${dataSymbol ?? ''}`,
                        x: padding.x - 25,
                        y: calcY(i) + 5,
                        fontSize: 20,
                        position: "end",
                    }));
                }
                chartSvg.appendChild(gTicks);
            }

            // PLOTTING & PLOT DATA LABELS
            plots.forEach((dataset, index) => {
                const g = spawnNS(SvgElement.G);
                dataset.serie.forEach((plot: any, i: any) => {
                    if (i < dataset.serie.length - 1) {
                        const line = spawnNS(SvgElement.LINE);
                        line.dataset.plotIndex = String(index);
                        line.classList.add(String(uid));
                        line.style.stroke = plot.color;
                        addTo(line, SvgAttribute.X1, plot.x);
                        addTo(line, SvgAttribute.Y1, plot.y);
                        addTo(line, SvgAttribute.X2, dataset.serie[i + 1].x);
                        addTo(line, SvgAttribute.Y2, dataset.serie[i + 1].y);
                        addTo(line, SvgAttribute.STROKE_WIDTH, lineSize);
                        addTo(line, SvgAttribute.STROKE_LINECAP, "round");
                        addTo(line, SvgAttribute.STROKE_LINEJOIN, "round");
                        g.appendChild(line);
                    }
                });
                dataset.serie.forEach((plot: any, i: any) => {
                    if (showPlots) {
                        const circle = spawnNS(SvgElement.CIRCLE);
                        circle.classList.add(CssClass.CHART_DATAPOINT_CIRCLE);
                        circle.classList.add(String(uid));
                        circle.dataset.plotIndex = String(index);
                        addTo(circle, SvgAttribute.R, plotSize);
                        addTo(circle, SvgAttribute.CX, plot.x);
                        addTo(circle, SvgAttribute.CY, plot.y);
                        circle.style.fill = plot.color;
                        chartSvg.appendChild(circle);
                    }
                });
                if (showTooltip) {
                    dataset.serie.forEach((plot: any, i: any) => {
                        const circle = spawnNS(SvgElement.CIRCLE);
                        circle.dataset.index = `${i}`;
                        circle.classList.add(CssClass.CHART_TOOLTIP_TRAP);
                        addTo(circle, SvgAttribute.R, 32);
                        addTo(circle, SvgAttribute.CX, plot.x);
                        addTo(circle, SvgAttribute.CY, plot.y);
                        circle.style.fill = "transparent";
                        chartSvg.appendChild(circle);
                    });
                }
                chartSvg.appendChild(g);
            });

            plots.forEach((dataset, index) => {
                const g = spawnNS(SvgElement.G);
                dataset.serie.forEach((plot: any, i: any) => {
                    if (showPlotValue) {
                        const foreignObject = spawnNS(SvgElement.FOREIGNOBJECT);
                        foreignObject.classList.add(String(uid));
                        foreignObject.style.overflow = "visible";
                        foreignObject.dataset.plotIndex = String(index);
                        addTo(foreignObject, SvgAttribute.X, plot.x - (String(plot.value).length * 14) / 2);
                        addTo(foreignObject, SvgAttribute.Y, plot.y - 12);
                        addTo(foreignObject, ElementAttribute.HEIGHT, 24);
                        addTo(foreignObject, ElementAttribute.WIDTH, String(plot.value).length * 14);

                        const dataLabel = spawn(DomElement.DIV);
                        dataLabel.classList.add(CssClass.CHART_DATALABEL_X);
                        dataLabel.classList.add(String(uid));
                        dataLabel.dataset.plotIndex = String(index);
                        dataLabel.dataset.index = `${i}`;
                        dataLabel.style.border = `1px solid ${plot.color}`;
                        dataLabel.innerHTML = plot.absoluteValue;
                        foreignObject.appendChild(dataLabel);
                        g.appendChild(foreignObject);
                    }
                    chartSvg.appendChild(g);
                })
            });

            // TOOLTIP
            if (showTooltip) {
                const tooltip = spawn(DomElement.DIV) as HTMLElement;
                tooltip.classList.add(CssClass.CHART_TOOLTIP);
                tooltip.style.opacity = "0";
                tooltip.style.zIndex = "-1";

                chartSvg.addEventListener(EventTrigger.MOUSEMOVE, (e) => {
                    tooltip.style.top = `${e.clientY + 20}px`;
                    tooltip.style.left = `${e.clientX}px`;
                    tooltip.innerHTML = "";
                    tooltip.style.fontFamily = getComputedStyle(child).fontFamily;
                    if (Array.from((e.target as HTMLElement).classList).includes(CssClass.CHART_TOOLTIP_TRAP) || Array.from((e.target as HTMLElement).classList).includes(CssClass.CHART_DATALABEL_X)) {
                        const tooltipSet = plots.map((plot, i) => {
                            if (!plot.name) return;
                            return {
                                color: plot.color || defaultColors[i],
                                name: plot.name,
                                value: plot.serie[Number((e.target as HTMLElement).dataset.index)]?.absoluteValue || null,
                                yValue: yValues[Number((e.target as HTMLElement).dataset.index)]
                            }
                        });

                        tooltipSet.forEach((datapoint, i) => {
                            const tooltipItem = spawn(DomElement.DIV);
                            tooltipItem.classList.add(CssClass.CHART_TOOLTIP_ITEM);
                            const yLabel = spawn(DomElement.DIV);
                            yLabel.classList.add(CssClass.CHART_TOOLTIP_DATE);
                            yLabel.innerHTML = datapoint?.yValue;
                            const marker = spawn(DomElement.SPAN);
                            marker.innerHTML = "●";
                            marker.style.color = datapoint?.color;
                            const label = spawn(DomElement.SPAN);
                            label.innerHTML = `${datapoint?.name}: ` || "";
                            const value = spawn(DomElement.SPAN);
                            value.innerHTML = `${datapoint?.value || '-'}`;
                            value.style.fontWeight = "bold";
                            [marker, label, value].forEach(el => tooltipItem.appendChild(el));
                            if (i === 0) {
                                tooltip.appendChild(yLabel);
                            }
                            tooltip.appendChild(tooltipItem);
                        })

                        tooltip.style.opacity = "1";
                        tooltip.style.zIndex = "1000";
                    } else {
                        tooltip.style.opacity = "0";
                        tooltip.style.zIndex = "-1";
                    }
                });

                chartSvg.addEventListener(EventTrigger.MOUSELEAVE, () => {
                    tooltip.style.opacity = "0";
                    tooltip.style.zIndex = "-1";
                });
                document.body.appendChild(tooltip);
            }

            child.appendChild(chartSvg);

            if (hasTitle) {
                chartSvg.appendChild(createText({
                    cssClasses: [CssClass.CHART_TITLE],
                    content: (child as HTMLElement).dataset.title as string,
                    x: svgWidth / 2,
                    y: 30,
                    fontSize: 32
                }));
            }

            if (hasSubtitle) {
                chartSvg.appendChild(createText({
                    cssClasses: [CssClass.CHART_SUBTITLE],
                    content: (child as HTMLElement).dataset.subtitle as string,
                    color: "grey",
                    fontSize: 20,
                    x: svgWidth / 2,
                    y: 55
                }));
            }

            // LEGEND

            if (!hideLegend) {
                const legendSvg = spawnNS(SvgElement.SVG);
                addTo(legendSvg, "xmlns", "http://www.w3.org/2000/svg");
                addTo(legendSvg, "preserveAspectRatio", "xMinYMid meet");
                const rows = Math.round(plots.length / 2);
                addTo(legendSvg, SvgAttribute.VIEWBOX, `0 0 ${svgWidth} ${40 * rows}`);
                legendSvg.classList.add(CssClass.CHART_LEGEND);

                const legendItems = [...plots].map((plot, i) => {
                    return {
                        ...plot,
                        y: Math.floor(i / 2),
                        x: i % 2
                    }
                });

                let segregated = [] as any;

                legendItems.forEach((plot, i) => {
                    // TODO: center legend item if legendItems.length == 1
                    const foreignObject = spawnNS(SvgElement.FOREIGNOBJECT);
                    addTo(foreignObject, ElementAttribute.HEIGHT, 30);
                    addTo(foreignObject, ElementAttribute.WIDTH, svgWidth / 2);
                    addTo(foreignObject, SvgAttribute.Y, plot.y * 30);
                    foreignObject.dataset.plotIndex = String(i);
                    foreignObject.classList.add(String(uid));
                    foreignObject.classList.add(CssClass.CHART_LEGEND_BLOCK);
                    if (i % 2 === 1) {
                        addTo(foreignObject, SvgAttribute.X, svgWidth / 2);
                    } else {
                        addTo(foreignObject, SvgAttribute.X, 0);
                    }
                    const legendItem = spawn(DomElement.DIV);
                    const marker = spawn(DomElement.SPAN);
                    marker.style.color = plot.color || defaultColors[i];
                    marker.innerHTML = "●";

                    const serieName = spawn(DomElement.SPAN);
                    serieName.innerHTML = plot.name;
                    legendItem.classList.add(CssClass.CHART_LEGEND_ITEM);

                    if (i % 2 === 1) {
                        legendItem.classList.add(CssClass.CHART_LEGEND_ITEM_RIGHT);
                        marker.classList.add(CssClass.CHART_LEGEND_MARKER_RIGHT);
                    } else {
                        legendItem.classList.add(CssClass.CHART_LEGEND_ITEM_LEFT);
                        serieName.classList.add(CssClass.CHART_LEGEND_NAME_LEFT);
                    }

                    [marker, serieName].forEach(el => {
                        legendItem.appendChild(el)
                    }
                    );
                    foreignObject.appendChild(legendItem);

                    foreignObject.addEventListener(EventTrigger.CLICK, () => {
                        if (segregated.includes(i)) {
                            segregated = segregated.filter((el: number) => el !== i);
                        } else {
                            segregated.push(i)
                        }
                        const allElements = document.getElementsByClassName(String(uid));
                        Array.from(allElements).forEach(element => {
                            if (segregated.includes(Number((element as HTMLElement).dataset.plotIndex))) {
                                (element as HTMLElement).style.opacity = "0.1";
                                if (element.nodeName === SvgElement.FOREIGNOBJECT) {
                                    (element as HTMLElement).style.opacity = "0.3";
                                }

                            } else {
                                (element as HTMLElement).style.opacity = "1";
                            }
                        });
                    });
                    legendSvg.appendChild(foreignObject);
                });
                child.appendChild(legendSvg);
            }
        }

        /////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////
        ///////////                    BAR CHART                      ///////////
        /////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////


        if ((child as HTMLElement).dataset.type === Chart.BAR) {
            const userInputs = [
                (child as HTMLElement).dataset.colors,
                (child as HTMLElement).dataset.legend,
                (child as HTMLElement).dataset.lineSize,
                (child as HTMLElement).dataset.plotValue,
                (child as HTMLElement).dataset.plot,
                (child as HTMLElement).dataset.subtitle,
                (child as HTMLElement).dataset.symbol,
                (child as HTMLElement).dataset.ticks,
                (child as HTMLElement).dataset.title,
                (child as HTMLElement).dataset.tooltip,
                (child as HTMLElement).dataset.type,
                (child as HTMLElement).dataset.valueBox,
                (child as HTMLElement).dataset.xAxis,
                (child as HTMLElement).dataset.yAxis,
                (child as HTMLElement).dataset.yGrid,
                (child as HTMLElement).dataset.xGrid,
                (child as HTMLElement).dataset.xValues,
                (child as HTMLElement).dataset.yValues,
            ];

            userInputs.forEach((input: string | undefined) => checkDirtyInputs(input));
            const uid = createUid();

            const xValues = JSON.parse((child as HTMLElement).dataset.xValues as any);
            const yValues = JSON.parse((child as HTMLElement).dataset.yValues as any);
            let maxValue = Math.max(...Object.values(xValues).flatMap(serie => Math.max(...serie as any)));
            let minValue = Math.min(...Object.values(xValues).flatMap(serie => Math.min(...serie as any)));
            const maxDatapoints = Math.max(...Object.values(xValues).flatMap(serie => (serie as any).length));
            const isBasedZero = minValue >= 0;
            const svgHeight = 512;
            const svgWidth = 828;
            const hasTitle = !!(child as HTMLElement).dataset.title;
            const hasSubtitle = !!(child as HTMLElement).dataset.subtitle;
            const showYAxis = (child as HTMLElement).dataset.yAxis === "true";
            const showXAxis = (child as HTMLElement).dataset.xAxis === "true";
            const showTicks = (child as HTMLElement).dataset.ticks === "true";
            const showXGrid = (child as HTMLElement).dataset.xGrid === "true";
            const showYGrid = (child as HTMLElement).dataset.yGrid === "true";
            const showPlotValue = (child as HTMLElement).dataset.plotValue === "true";
            const showTooltip = (child as HTMLElement).dataset.tooltip === "true";
            const hideLegend = (child as HTMLElement).dataset.legend === "false";
            const dataSymbol = (child as HTMLElement).dataset.symbol;

            const gap = 7;

            let colors: any;

            if (minValue > 0) {
                minValue = 0;
            }

            const defaultColors = [
                "#3366CC",
                "#DC3912",
                "#FF9900",
                "#109618",
                "#990099",
                "#3B3EAC",
                "#0099C6",
                "#DD4477",
                "#66AA00",
                "#B82E2E",
                "#316395",
                "#994499",
                "#22AA99",
                "#AAAA11",
                "#6633CC",
                "#E67300",
                "#8B0707",
                "#329262",
                "#5574A6",
                "#651067"
            ];

            if ((child as HTMLElement).dataset.colors) {
                colors = JSON.parse((child as HTMLElement).dataset.colors as any);
            } else {
                colors = defaultColors;
            }

            const chartSvg = spawnNS(SvgElement.SVG);
            addTo(chartSvg, "xmlns", "http://www.w3.org/2000/svg");
            addTo(chartSvg, "preserveAspectRatio", "xMinYMid meet");

            chartSvg.classList.add(CssClass.CHART_BAR);

            const interval = ((svgWidth - 180) / (maxDatapoints - 1));
            const padding = {
                x: 90,
                y: 75
            }

            addTo(chartSvg, SvgAttribute.VIEWBOX, `0 0 ${svgWidth} ${svgHeight}`);

            function calcY(value: number) {
                return (svgHeight - (padding.y * 2)) * (1 - (value / (maxValue + Math.abs(minValue)))) + (padding.y);
            }

            const plots = Object.keys(xValues).map((serie, index) => {
                return {
                    name: serie,
                    color: colors[index],
                    serie: xValues[serie].map((s: any, i: any) => {
                        let val = s;
                        if (isBasedZero) {
                            val = s;
                        } else {
                            if (s === minValue) {
                                val = 0;
                            } else {
                                val = s += Math.abs(minValue);
                            }
                        }
                        return {
                            absoluteValue: xValues[serie][i],
                            value: `${s}${dataSymbol ?? ''}`,
                            x: (i * interval) + padding.x,
                            y: calcY(val),
                            color: colors[index] || defaultColors[index]
                        }
                    }),
                }
            });

            const axisLines = spawnNS(SvgElement.G);
            if (showYAxis) {
                const yAxis = spawnNS(SvgElement.LINE);
                addTo(yAxis, SvgAttribute.X1, padding.x);
                addTo(yAxis, SvgAttribute.Y1, padding.y);
                addTo(yAxis, SvgAttribute.X2, padding.x);
                addTo(yAxis, SvgAttribute.Y2, svgHeight - padding.y);
                yAxis.style.stroke = "grey";
                axisLines.appendChild(yAxis);
            }

            if (showXAxis) {
                const xAxis = spawnNS(SvgElement.LINE);
                addTo(xAxis, SvgAttribute.X1, padding.x);
                addTo(xAxis, SvgAttribute.X2, svgWidth - padding.x + interval);
                addTo(xAxis, SvgAttribute.Y1, calcY(Math.abs(minValue)));
                addTo(xAxis, SvgAttribute.Y2, calcY(Math.abs(minValue)));
                xAxis.style.stroke = "grey";
                axisLines.appendChild(xAxis);
            }

            if (showYAxis || showXAxis) {
                chartSvg.appendChild(axisLines);
            }

            if (showXGrid) {
                const gXGrid = spawnNS(SvgElement.G);
                for (let i = 0; i < maxDatapoints + 1; i += 1) {
                    const xLine = spawnNS(SvgElement.LINE);
                    addTo(xLine, SvgAttribute.X1, (i * interval) + padding.x);
                    addTo(xLine, SvgAttribute.X2, (i * interval) + padding.x);
                    addTo(xLine, SvgAttribute.Y1, padding.y);
                    addTo(xLine, SvgAttribute.Y2, svgHeight - padding.y);
                    xLine.style.stroke = "rgba(0,0,0,0.2)";
                    gXGrid.appendChild(xLine);
                }
                chartSvg.appendChild(gXGrid);
            }

            if (showTicks) {
                const gTicks = spawnNS(SvgElement.G);
                for (let i = 0; i < maxDatapoints; i += 1) {
                    gTicks.appendChild(createText({
                        content: yValues[i] ?? "",
                        x: (i * interval) + padding.x + interval / 2,
                        y: calcY(0) + 40,
                        fontSize: 20
                    }));
                }
                for (let i = 0; i <= (maxValue + Math.abs(minValue)); i += ((maxValue + Math.abs(minValue)) / 10)) {
                    const tickY = spawnNS(SvgElement.CIRCLE);
                    addTo(tickY, SvgAttribute.R, 2);
                    addTo(tickY, SvgAttribute.CX, padding.x);
                    addTo(tickY, SvgAttribute.CY, calcY(i));
                    tickY.style.fill = "grey";
                    gTicks.appendChild(tickY);

                    if (showYGrid) {
                        const yLine = spawnNS("line");
                        addTo(yLine, SvgAttribute.X1, padding.x);
                        addTo(yLine, SvgAttribute.X2, svgWidth - padding.x + interval);
                        addTo(yLine, SvgAttribute.Y1, calcY(i));
                        addTo(yLine, SvgAttribute.Y2, calcY(i));
                        yLine.style.stroke = "rgba(0,0,0,0.2)";
                        gTicks.appendChild(yLine);
                    }

                    gTicks.appendChild(createText({
                        content: `${Math.round(minValue + i)}${dataSymbol ?? ''}`,
                        x: padding.x - 25,
                        y: calcY(i) + 5,
                        fontSize: 20,
                        position: "end",
                    }));
                }
                chartSvg.appendChild(gTicks);
            }

            // PLOTTING & PLOT DATA LABELS
            plots.forEach((dataset, index) => {
                const g = spawnNS(SvgElement.G);
                dataset.serie.forEach((plot: any, i: number) => {
                    const rect = spawnNS(SvgElement.RECT);
                    rect.dataset.index = String(i);
                    rect.dataset.plotIndex = String(index);
                    rect.classList.add(CssClass.CHART_TOOLTIP_TRAP);
                    rect.classList.add(String(uid));
                    addTo(rect, SvgAttribute.FILL, plot.color);
                    addTo(rect, SvgAttribute.X, plot.x + ((interval / plots.length) * index) + (gap / plots.length));

                    if (plot.y > calcY(Math.abs(minValue))) {
                        addTo(rect, SvgAttribute.Y, calcY(Math.abs(minValue)));
                        const minCeiling = svgHeight - padding.y - calcY(Math.abs(minValue));
                        addTo(rect, ElementAttribute.HEIGHT, (minCeiling * (Math.abs(plot.absoluteValue) / Math.abs(minValue))));
                    } else {
                        addTo(rect, SvgAttribute.Y, plot.y);
                        addTo(rect, ElementAttribute.HEIGHT, calcY(Math.abs(minValue)) - plot.y);
                    }
                    addTo(rect, ElementAttribute.WIDTH, (interval - (gap * 2)) / plots.length);
                    g.appendChild(rect);
                });
                chartSvg.appendChild(g);
            });

            plots.forEach((dataset, index) => {
                const g = spawnNS(SvgElement.G);
                dataset.serie.forEach((plot: any, i: any) => {
                    if (showPlotValue) {
                        const plotInterval = (interval / plots.length);
                        const text = spawnNS(SvgElement.TEXT);
                        text.dataset.plotIndex = String(index);
                        text.classList.add(uid);
                        addTo(text, SvgAttribute.X, plot.x + (plotInterval / 2) + (plotInterval * index));
                        if (plot.absoluteValue < 0) {
                            addTo(text, SvgAttribute.Y, plot.y + 14);
                        } else {
                            addTo(text, SvgAttribute.Y, plot.y - 4);
                        }
                        addTo(text, SvgAttribute.FONT_SIZE, 12);
                        addTo(text, SvgAttribute.TEXT_ANCHOR, SvgTextPosition.MIDDLE);
                        text.innerHTML = plot.absoluteValue;
                        g.appendChild(text);
                    }
                    chartSvg.appendChild(g);
                })
            });

            // TOOLTIP
            if (showTooltip) {
                const tooltip = spawn(DomElement.DIV) as HTMLElement;
                tooltip.classList.add(CssClass.CHART_TOOLTIP);
                tooltip.style.opacity = "0";
                tooltip.style.zIndex = "-1";

                chartSvg.addEventListener(EventTrigger.MOUSEMOVE, (e) => {
                    tooltip.style.top = `${e.clientY + 20}px`;
                    tooltip.style.left = `${e.clientX}px`;
                    tooltip.innerHTML = "";
                    tooltip.style.fontFamily = getComputedStyle(child).fontFamily;
                    if (Array.from((e.target as HTMLElement).classList).includes(CssClass.CHART_TOOLTIP_TRAP) || Array.from((e.target as HTMLElement).classList).includes(CssClass.CHART_DATALABEL_X)) {
                        const tooltipSet = plots.map((plot, i) => {
                            if (!plot.name) return;
                            return {
                                color: plot.color || defaultColors[i],
                                name: plot.name,
                                value: plot.serie[Number((e.target as HTMLElement).dataset.index)]?.absoluteValue || null,
                                yValue: yValues[Number((e.target as HTMLElement).dataset.index)]
                            }
                        });

                        tooltipSet.forEach((datapoint, i) => {
                            const tooltipItem = spawn(DomElement.DIV);
                            tooltipItem.classList.add(CssClass.CHART_TOOLTIP_ITEM);
                            const yLabel = spawn(DomElement.DIV);
                            yLabel.classList.add(CssClass.CHART_TOOLTIP_DATE);
                            yLabel.innerHTML = datapoint?.yValue;
                            const marker = spawn(DomElement.SPAN);
                            marker.innerHTML = "●";
                            marker.style.color = datapoint?.color;
                            const label = spawn(DomElement.SPAN);
                            label.innerHTML = `${datapoint?.name}: ` || "";
                            const value = spawn(DomElement.SPAN);
                            value.innerHTML = `${datapoint?.value || '-'}`;
                            value.style.fontWeight = "bold";
                            [marker, label, value].forEach(el => tooltipItem.appendChild(el));
                            if (i === 0) {
                                tooltip.appendChild(yLabel);
                            }
                            tooltip.appendChild(tooltipItem);
                        })

                        tooltip.style.opacity = "1";
                        tooltip.style.zIndex = "1000";
                    } else {
                        tooltip.style.opacity = "0";
                        tooltip.style.zIndex = "-1";
                    }
                });
                chartSvg.addEventListener(EventTrigger.MOUSELEAVE, () => {
                    tooltip.style.opacity = "0";
                    tooltip.style.zIndex = "-1";
                });
                document.body.appendChild(tooltip);
            }

            child.appendChild(chartSvg);

            if (hasTitle) {
                chartSvg.appendChild(createText({
                    cssClasses: [CssClass.CHART_TITLE],
                    content: (child as HTMLElement).dataset.title as string,
                    x: svgWidth / 2,
                    y: 30,
                    fontSize: 32
                }))
            }

            if (hasSubtitle) {
                chartSvg.appendChild(createText({
                    cssClasses: [CssClass.CHART_SUBTITLE],
                    content: (child as HTMLElement).dataset.subtitle as string,
                    color: "grey",
                    fontSize: 20,
                    x: svgWidth / 2,
                    y: 55
                }));
            }

            // LEGEND
            if (!hideLegend) {
                const legendSvg = spawnNS(SvgElement.SVG);
                addTo(legendSvg, "xmlns", "http://www.w3.org/2000/svg");
                addTo(legendSvg, "preserveAspectRatio", "xMinYMid meet");
                const rows = Math.round(plots.length / 2);
                addTo(legendSvg, SvgAttribute.VIEWBOX, `0 0 ${svgWidth} ${40 * rows}`);
                legendSvg.classList.add(CssClass.CHART_LEGEND);

                const legendItems = [...plots].map((plot, i) => {
                    return {
                        ...plot,
                        y: Math.floor(i / 2),
                        x: i % 2
                    }
                });

                let segregated = [] as any;

                legendItems.forEach((plot, i) => {
                    // TODO: center legend item if legendItems.length == 1
                    const foreignObject = spawnNS(SvgElement.FOREIGNOBJECT);
                    addTo(foreignObject, ElementAttribute.HEIGHT, 30);
                    addTo(foreignObject, ElementAttribute.WIDTH, svgWidth / 2);
                    addTo(foreignObject, SvgAttribute.Y, plot.y * 30);
                    foreignObject.dataset.plotIndex = String(i);
                    foreignObject.classList.add(String(uid));
                    foreignObject.classList.add(CssClass.CHART_LEGEND_BLOCK);
                    if (i % 2 === 1) {
                        addTo(foreignObject, SvgAttribute.X, svgWidth / 2);
                    } else {
                        addTo(foreignObject, SvgAttribute.X, 0);
                    }
                    const legendItem = spawn(DomElement.DIV);
                    const marker = spawn(DomElement.SPAN);
                    marker.style.color = plot.color || defaultColors[i];
                    marker.innerHTML = "●";

                    const serieName = spawn(DomElement.SPAN);
                    serieName.innerHTML = plot.name;
                    legendItem.classList.add(CssClass.CHART_LEGEND_ITEM);

                    if (i % 2 === 1) {
                        legendItem.classList.add(CssClass.CHART_LEGEND_ITEM_RIGHT);
                        marker.classList.add(CssClass.CHART_LEGEND_MARKER_RIGHT);
                    } else {
                        legendItem.classList.add(CssClass.CHART_LEGEND_ITEM_LEFT);
                        serieName.classList.add(CssClass.CHART_LEGEND_NAME_LEFT);
                    }

                    [marker, serieName].forEach(el => {
                        legendItem.appendChild(el)
                    }
                    );
                    foreignObject.appendChild(legendItem);

                    foreignObject.addEventListener(EventTrigger.CLICK, () => {
                        if (segregated.includes(i)) {
                            segregated = segregated.filter((el: number) => el !== i);
                        } else {
                            segregated.push(i)
                        }
                        const allElements = document.getElementsByClassName(String(uid));
                        Array.from(allElements).forEach(element => {
                            if (segregated.includes(Number((element as HTMLElement).dataset.plotIndex))) {
                                (element as HTMLElement).style.opacity = "0.1";
                                if (element.nodeName === SvgElement.FOREIGNOBJECT) {
                                    (element as HTMLElement).style.opacity = "0.3";
                                }

                            } else {
                                (element as HTMLElement).style.opacity = "1";
                            }
                        });
                    });
                    legendSvg.appendChild(foreignObject);
                });
                child.appendChild(legendSvg);
            }

        }

        /////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////
        ///////////                    DONUT CHART                    ///////////
        /////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////

        if ((child as HTMLElement).dataset.type === Chart.DONUT) {
            const userInputs = [
                (child as HTMLElement).dataset.colors,
                (child as HTMLElement).dataset.legend,
                (child as HTMLElement).dataset.symbol,
                (child as HTMLElement).dataset.tooltip,
                (child as HTMLElement).dataset.xValues,
                (child as HTMLElement).dataset.title,
                (child as HTMLElement).dataset.subtitle,
                (child as HTMLElement).dataset.total,
                (child as HTMLElement).dataset.totalLabel,
            ];

            userInputs.forEach((input: string | undefined) => checkDirtyInputs(input));
            const uid = createUid();

            const hasTitle = !!(child as HTMLElement).dataset.title;
            const hasSubtitle = !!(child as HTMLElement).dataset.subtitle;
            const hasTotal = (child as HTMLElement).dataset.total === "true";
            const hideLegend = (child as HTMLElement).dataset.legend === "false";
            const showTooltip = (child as HTMLElement).dataset.tooltip === "true";
            const hasTotalLabel = !!(child as HTMLElement).dataset.totalLabel;

            let colors: any;

            const defaultColors = [
                "#3366CC",
                "#DC3912",
                "#FF9900",
                "#109618",
                "#990099",
                "#3B3EAC",
                "#0099C6",
                "#DD4477",
                "#66AA00",
                "#B82E2E",
                "#316395",
                "#994499",
                "#22AA99",
                "#AAAA11",
                "#6633CC",
                "#E67300",
                "#8B0707",
                "#329262",
                "#5574A6",
                "#651067"
            ];

            if ((child as HTMLElement).dataset.colors) {
                colors = JSON.parse((child as HTMLElement).dataset.colors as any);
            } else {
                colors = defaultColors;
            }

            const xValues = JSON.parse((child as HTMLElement).dataset.xValues as string);
            const xTotal = Object.values(xValues).reduce((a, b) => Number(a) + Number(b), 0) as number;

            const dataset = Object.keys(xValues).map((key, i) => {
                return {
                    name: key,
                    value: Number(xValues[key]),
                    color: colors[i],
                    proportion: Number(xValues[key]) / xTotal
                }
            });

            const size = 512;
            const chartSvg = spawnNS(SvgElement.SVG);
            chartSvg.classList.add(CssClass.CHART_DONUT);
            addTo(chartSvg, "xmlns", "http://www.w3.org/2000/svg");
            addTo(chartSvg, "preserveAspectRatio", "xMinYMid meet");
            addTo(chartSvg, SvgAttribute.VIEWBOX, `0 0 ${size} ${size}`);
            addTo(chartSvg, SvgAttribute.STROKE_WIDTH, size / 6.1803398875);

            const donut = makeDonut(
                { series: dataset },
                size / 2,
                size / 1.8,
                size / 3.8,
                size / 3.8
            );

            const labels = makeDonut(
                { series: dataset },
                size / 2.25,
                size / 2.1,
                size / 3.8,
                size / 3.8
            );

            const gBites = spawnNS(SvgElement.G);
            const gMarkers = spawnNS(SvgElement.G);

            donut.forEach((bite: any, i: number) => {
                // ARC
                const path = spawnNS(SvgElement.PATH);
                path.dataset.plotIndex = String(i);
                path.classList.add(String(uid));
                path.classList.add(CssClass.CHART_TOOLTIP_TRAP);
                addTo(path, "d", bite.path);
                addTo(path, SvgAttribute.STROKE, bite.color);
                path.style.fill = "none";
                gBites.appendChild(path);

                // MARKER
                const label = spawnNS(SvgElement.FOREIGNOBJECT);
                label.classList.add(String(uid));
                label.classList.add(CssClass.CHART_DONUT_LABEL);
                label.classList.add(CssClass.CHART_TOOLTIP_TRAP);
                label.dataset.plotIndex = String(i);
                label.style.overflow = "visible";
                addTo(label, SvgAttribute.X, labels[i].center.endX);
                addTo(label, SvgAttribute.Y, labels[i].center.endY);
                addTo(label, ElementAttribute.HEIGHT, 20);
                addTo(label, ElementAttribute.WIDTH, (`${(bite.proportion * 100).toFixed(0)}%`).length * 10);

                const marker = spawn(DomElement.DIV);
                marker.classList.add(CssClass.CHART_DONUT_MARKER);
                marker.classList.add(CssClass.CHART_TOOLTIP_TRAP);
                marker.dataset.plotIndex = String(i);
                marker.style.border = `2px solid ${bite.color}`;
                marker.style.background = `white`;
                marker.innerHTML = `${(bite.proportion * 100).toFixed(0)}%`;
                if (bite.proportion > 0.07) {
                    label.appendChild(marker);
                    gMarkers.appendChild(label);
                }

            });

            chartSvg.appendChild(gBites);
            chartSvg.appendChild(gMarkers);

            // TOOLTIP
            if (showTooltip) {
                const tooltip = spawn(DomElement.DIV) as HTMLElement;
                tooltip.classList.add(CssClass.CHART_TOOLTIP);
                tooltip.style.opacity = "0";
                tooltip.style.zIndex = "-1";

                chartSvg.addEventListener(EventTrigger.MOUSEMOVE, (e) => {
                    tooltip.style.top = `${e.clientY + 20}px`;
                    tooltip.style.left = `${e.clientX}px`;
                    tooltip.innerHTML = "";
                    tooltip.style.fontFamily = getComputedStyle(child).fontFamily;
                    if (Array.from((e.target as HTMLElement).classList).includes(CssClass.CHART_TOOLTIP_TRAP) || Array.from((e.target as HTMLElement).classList).includes(CssClass.CHART_DATALABEL_X)) {
                        const tooltipSet = dataset.map((plot, i) => {
                            if (!plot.name) return;
                            return {
                                color: plot.color || defaultColors[i],
                                name: plot.name,
                                value: String(plot.value).toLocaleString() as any,
                                proportion: plot.proportion
                            }
                        });

                        tooltipSet.forEach((datapoint: any, i) => {
                            const tooltipItem = spawn(DomElement.DIV);
                            tooltipItem.classList.add(CssClass.CHART_TOOLTIP_ITEM);
                            const title = spawn(DomElement.DIV);
                            title.classList.add(CssClass.CHART_TOOLTIP_DATE);
                            title.innerHTML = (child as HTMLElement).dataset.title as string ?? "";
                            const marker = spawn(DomElement.SPAN);
                            marker.innerHTML = "●";
                            marker.style.color = datapoint?.color;
                            const label = spawn(DomElement.SPAN);
                            label.innerHTML = `${datapoint?.name}: ` || "";
                            const value = spawn(DomElement.SPAN);
                            value.innerHTML = `${datapoint?.value ?? ''} <span style="color:grey">(${(datapoint.proportion * 100).toFixed(0)}%)</span>`;
                            value.style.fontWeight = "bold";
                            [marker, label, value].forEach(el => tooltipItem.appendChild(el));
                            if (i === 0) {
                                tooltip.appendChild(title);
                            }
                            tooltip.appendChild(tooltipItem);
                        })

                        tooltip.style.opacity = "1";
                        tooltip.style.zIndex = "1000";
                    } else {
                        tooltip.style.opacity = "0";
                        tooltip.style.zIndex = "-1";
                    }
                });
                chartSvg.addEventListener(EventTrigger.MOUSELEAVE, () => {
                    tooltip.style.opacity = "0";
                    tooltip.style.zIndex = "-1";
                });
                document.body.appendChild(tooltip);
            }

            child.appendChild(chartSvg);

            // TITLE

            if (hasTitle) {
                chartSvg.appendChild(createText({
                    cssClasses: [CssClass.CHART_TITLE],
                    content: (child as HTMLElement).dataset.title as string,
                    fontSize: 32,
                    x: size / 2,
                    y: 30,
                }));
            }

            // SUBTITLE

            if (hasSubtitle) {
                chartSvg.appendChild(createText({
                    cssClasses: [CssClass.CHART_SUBTITLE],
                    content: (child as HTMLElement).dataset.subtitle as string,
                    color: "grey",
                    fontSize: 20,
                    x: size / 2,
                    y: 55
                }));
            }

            // TOTAL
            if (hasTotal) {
                const gCenterLabel = spawnNS(SvgElement.G);
                const total = Object.values(xValues).reduce((a: any, b: any) => a + b, 0);
                gCenterLabel.appendChild(createText({
                    cssClasses: [CssClass.CHART_DONUT_CENTER_LABEL],
                    content: String(total).toLocaleString(),
                    x: size / 2,
                    y: size / 2 + 40,
                    fontSize: 28
                }));
                if (hasTotalLabel) {
                    gCenterLabel.appendChild(createText({
                        content: (child as HTMLElement).dataset.totalLabel as string,
                        x: size / 2,
                        y: size / 2,
                        fontSize: 28
                    }));
                }
                chartSvg.appendChild(gCenterLabel);
            }

            // LEGEND

            if (!hideLegend) {
                const legendSvg = spawnNS(SvgElement.SVG);
                addTo(legendSvg, "xmlns", "http://www.w3.org/2000/svg");
                addTo(legendSvg, "preserveAspectRatio", "xMinYMid meet");
                const rows = Math.round(dataset.length / 2);
                addTo(legendSvg, SvgAttribute.VIEWBOX, `0 0 ${size} ${40 * rows}`);
                legendSvg.classList.add(CssClass.CHART_LEGEND);

                const legendItems = [...dataset].map((plot, i) => {
                    return {
                        ...plot,
                        y: Math.floor(i / 2),
                        x: i % 2
                    }
                });

                let segregated = [] as any;

                legendItems.forEach((plot, i) => {
                    // TODO: center legend item if legendItems.length == 1
                    const foreignObject = spawnNS(SvgElement.FOREIGNOBJECT);
                    addTo(foreignObject, ElementAttribute.HEIGHT, 30);
                    addTo(foreignObject, ElementAttribute.WIDTH, size / 2);
                    addTo(foreignObject, SvgAttribute.Y, plot.y * 30);
                    foreignObject.dataset.plotIndex = String(i);
                    foreignObject.classList.add(String(uid));
                    foreignObject.classList.add(CssClass.CHART_LEGEND_BLOCK);
                    if (i % 2 === 1) {
                        addTo(foreignObject, SvgAttribute.X, size / 2);
                    } else {
                        addTo(foreignObject, SvgAttribute.X, 0);
                    }
                    const legendItem = spawn(DomElement.DIV);
                    const marker = spawn(DomElement.SPAN);
                    marker.style.color = plot.color || defaultColors[i];
                    marker.innerHTML = "●";

                    const serieName = spawn(DomElement.SPAN);
                    serieName.innerHTML = `${plot.name} <span style="color:grey">(${plot.value})</span>`;
                    legendItem.classList.add(CssClass.CHART_LEGEND_ITEM);

                    if (i % 2 === 1) {
                        legendItem.classList.add(CssClass.CHART_LEGEND_ITEM_RIGHT);
                        marker.classList.add(CssClass.CHART_LEGEND_MARKER_RIGHT);
                    } else {
                        legendItem.classList.add(CssClass.CHART_LEGEND_ITEM_LEFT);
                        serieName.classList.add(CssClass.CHART_LEGEND_NAME_LEFT);
                    }

                    [marker, serieName].forEach(el => {
                        legendItem.appendChild(el)
                    }
                    );
                    foreignObject.appendChild(legendItem);

                    foreignObject.addEventListener(EventTrigger.CLICK, () => {
                        if (segregated.includes(i)) {
                            segregated = segregated.filter((el: number) => el !== i);
                        } else {
                            segregated.push(i)
                        }
                        const allElements = document.getElementsByClassName(String(uid));
                        Array.from(allElements).forEach(element => {
                            if (segregated.includes(Number((element as HTMLElement).dataset.plotIndex))) {
                                (element as HTMLElement).style.opacity = "0.1";
                                if (element.nodeName === SvgElement.FOREIGNOBJECT) {
                                    (element as HTMLElement).style.opacity = "0.3";
                                }
                                if (Array.from(element.classList).includes(CssClass.CHART_DONUT_LABEL)) {
                                    (element as HTMLElement).style.opacity = "0";
                                }

                            } else {
                                (element as HTMLElement).style.opacity = "1";
                            }
                        });
                    });
                    legendSvg.appendChild(foreignObject);
                });
                child.appendChild(legendSvg);
            }
        }

        /////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////
        ///////////                   GAUGE CHART                     ///////////
        /////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////

        if ((child as HTMLElement).dataset.type === Chart.GAUGE) {
            const userInputs = [
                (child as HTMLElement).dataset.colors,
                (child as HTMLElement).dataset.type,
                (child as HTMLElement).dataset.min,
                (child as HTMLElement).dataset.max,
                (child as HTMLElement).dataset.symbol,
                (child as HTMLElement).dataset.title,
                (child as HTMLElement).dataset.subtitle,
                (child as HTMLElement).dataset.value
            ];
            userInputs.forEach((input: string | undefined) => checkDirtyInputs(input));
            const max = Number((child as HTMLElement).dataset.max) ? Number((child as HTMLElement).dataset.max) : 100;
            const min = Number((child as HTMLElement).dataset.min) ? Number((child as HTMLElement).dataset.min) : 0;
            const hasTitle = !!(child as HTMLElement).dataset.title;
            const hasSubtitle = !!(child as HTMLElement).dataset.subtitle;
            const hasSymbol = !!(child as HTMLElement).dataset.symbol;
            const hasGradient = (child as HTMLElement).dataset.gradient === "true";

            const absoluteValue = Number((child as HTMLElement).dataset.value) - min;

            const svgHeight = 512;
            const svgWidth = 316;
            const barWidth = Number((child as HTMLElement).dataset.barWidth) ? Number((child as HTMLElement).dataset.barWidth) : 70;

            let colors;
            if (!!(child as HTMLElement).dataset.colors) {
                colors = JSON.parse((child as HTMLElement).dataset.colors as string);
            } else {
                colors = [
                    "#c43310",
                    "#dc3912",
                    "#f04800",
                    "#ff6d00",
                    "#ff9900",
                    "#ffc600",
                    "#e3e200",
                    "#b4d900",
                    "#5ba800",
                    "#109618"
                ];
            }

            const colorsMap = colors.map((color: string, i: number) => {
                return {
                    proportion: i / colors.length,
                    color
                }
            });

            const valueToMax = Number((child as HTMLElement).dataset.value) / max;
            const currentColor = colorsMap.find((cm: any) => cm.proportion === findClosestNumberInArray(colorsMap.map((c: any) => c.proportion), valueToMax)).color;

            const chartSvg = spawnNS(SvgElement.SVG);
            addTo(chartSvg, "xmlns", "http://www.w3.org/2000/svg");
            addTo(chartSvg, "preserveAspectRatio", "xMinYMid meet");
            addTo(chartSvg, SvgAttribute.VIEWBOX, `0 0 ${svgWidth} ${svgHeight}`);
            chartSvg.classList.add(CssClass.CHART_GAUGE);

            const padding = {
                top: 80,
                bottom: 30
            };

            const gTitle = spawnNS(SvgElement.G);
            if (hasTitle) {
                gTitle.appendChild(createText({
                    cssClasses: [CssClass.CHART_TITLE],
                    content: (child as HTMLElement).dataset.title as string,
                    x: svgWidth / 2,
                    y: 30,
                    fontSize: 32
                }));
            }

            if (hasSubtitle) {
                gTitle.appendChild(createText({
                    cssClasses: [CssClass.CHART_SUBTITLE],
                    content: (child as HTMLElement).dataset.subtitle as string,
                    x: svgWidth / 2,
                    y: 55,
                    color: "grey",
                    fontSize: 20
                }));
            }

            chartSvg.appendChild(gTitle);



            const trackHeight = padding.top + svgHeight - (padding.top + padding.bottom);
            const proportion = absoluteValue / (max - min);
            const barHeight = (trackHeight - padding.top) * proportion;

            // GRADIENT
            const lid = createUid();
            if (hasGradient) {
                const defs = spawnNS("defs");
                const radialGradient = spawnNS("radialGradient");
                radialGradient.id = lid;
                const stop0 = spawnNS("stop");
                const stop1 = spawnNS("stop");
                addTo(stop0, "offset", '10%');
                addTo(stop0, "stop-color", "white");
                addTo(stop1, "offset", '95%');
                addTo(stop1, "stop-color", currentColor);
                [stop0, stop1].forEach(e => radialGradient.appendChild(e));
                defs.appendChild(radialGradient);
                chartSvg.appendChild(defs);
            }

            // TRACK
            const gChart = spawnNS(SvgElement.G);
            const track = spawnNS(SvgElement.RECT);
            addTo(track, SvgAttribute.X, svgWidth / 2 - barWidth / 2);
            addTo(track, SvgAttribute.Y, padding.top);
            addTo(track, ElementAttribute.WIDTH, barWidth);
            addTo(track, ElementAttribute.HEIGHT, svgHeight - (padding.top + padding.bottom));
            addTo(track, SvgAttribute.FILL, "#f0f3f5");

            // ARROW
            const arrow = spawnNS(SvgElement.PATH);
            addTo(arrow, SvgAttribute.D, `M${svgWidth / 2 - (barWidth / 2 + 10)} ${svgHeight - padding.bottom - barHeight}, ${svgWidth / 2 - (barWidth / 2 + 23)} ${svgHeight - padding.bottom - barHeight - 7.5}, ${svgWidth / 2 - (barWidth / 2 + 23)} ${svgHeight - padding.bottom - barHeight + 7.5}Z`);
            addTo(arrow, SvgAttribute.FILL, "#c9ced1");
            addTo(arrow, SvgAttribute.STROKE, currentColor);
            addTo(arrow, SvgAttribute.STROKE_WIDTH, 2);
            addTo(arrow, SvgAttribute.STROKE_LINECAP, "round");
            addTo(arrow, SvgAttribute.STROKE_LINEJOIN, "round");

            // TICKS
            const gTicks = spawnNS(SvgElement.G);
            for (let i = 0; i < max - min; i += 2) {
                const tickLeft = spawnNS(SvgElement.LINE);
                const ratio = i / (max - min);
                addTo(tickLeft, SvgAttribute.X1, svgWidth / 2 - barWidth / 2);
                addTo(tickLeft, SvgAttribute.X2, svgWidth / 2 - (barWidth / 2 + 5));
                addTo(tickLeft, SvgAttribute.Y1, padding.top + (svgHeight - padding.top - padding.bottom) * ratio);
                addTo(tickLeft, SvgAttribute.Y2, padding.top + (svgHeight - padding.top - padding.bottom) * ratio);
                addTo(tickLeft, SvgAttribute.STROKE, "black");
                addTo(tickLeft, SvgAttribute.STROKE_WIDTH, 1);
                addTo(tickLeft, SvgAttribute.STROKE_LINECAP, "round");
                addTo(tickLeft, SvgAttribute.STROKE_LINEJOIN, "round");

                const tickRight = spawnNS(SvgElement.LINE);
                addTo(tickRight, SvgAttribute.X1, svgWidth / 2 + barWidth / 2);
                addTo(tickRight, SvgAttribute.X2, svgWidth / 2 + (barWidth / 2 + 5));
                addTo(tickRight, SvgAttribute.Y1, padding.top + (svgHeight - padding.top - padding.bottom) * ratio);
                addTo(tickRight, SvgAttribute.Y2, padding.top + (svgHeight - padding.top - padding.bottom) * ratio);
                addTo(tickRight, SvgAttribute.STROKE, "black");
                addTo(tickRight, SvgAttribute.STROKE_WIDTH, 1);
                addTo(tickRight, SvgAttribute.STROKE_LINECAP, "round");
                addTo(tickRight, SvgAttribute.STROKE_LINEJOIN, "round");

                if (i % 10 === 0) {
                    const tick5Left = spawnNS(SvgElement.LINE);
                    addTo(tick5Left, SvgAttribute.X1, svgWidth / 2 - barWidth / 2);
                    addTo(tick5Left, SvgAttribute.X2, svgWidth / 2 - (barWidth / 2 + 10));
                    addTo(tick5Left, SvgAttribute.Y1, padding.top + (svgHeight - padding.top - padding.bottom) * ratio);
                    addTo(tick5Left, SvgAttribute.Y2, padding.top + (svgHeight - padding.top - padding.bottom) * ratio);
                    addTo(tick5Left, SvgAttribute.STROKE, "black");
                    addTo(tick5Left, SvgAttribute.STROKE_WIDTH, 1);
                    addTo(tick5Left, SvgAttribute.STROKE_LINECAP, "round");
                    addTo(tick5Left, SvgAttribute.STROKE_LINEJOIN, "round");

                    const tick5Right = spawnNS(SvgElement.LINE);
                    addTo(tick5Right, SvgAttribute.X1, svgWidth / 2 + barWidth / 2);
                    addTo(tick5Right, SvgAttribute.X2, svgWidth / 2 + (barWidth / 2 + 10));
                    addTo(tick5Right, SvgAttribute.Y1, padding.top + (svgHeight - padding.top - padding.bottom) * ratio);
                    addTo(tick5Right, SvgAttribute.Y2, padding.top + (svgHeight - padding.top - padding.bottom) * ratio);
                    addTo(tick5Right, SvgAttribute.STROKE, "black");
                    addTo(tick5Right, SvgAttribute.STROKE_WIDTH, 1);
                    addTo(tick5Right, SvgAttribute.STROKE_LINECAP, "round");
                    addTo(tick5Right, SvgAttribute.STROKE_LINEJOIN, "round");
                    [tick5Left, tick5Right].forEach(e => gTicks.appendChild(e));
                }
                [tickLeft, tickRight].forEach(e => gTicks.appendChild(e));
            }

            // BAR
            const bar = spawnNS(SvgElement.RECT);
            addTo(bar, SvgAttribute.X, svgWidth / 2 - barWidth / 2);
            addTo(bar, SvgAttribute.Y, svgHeight - padding.bottom - barHeight);
            addTo(bar, SvgAttribute.FILL, hasGradient ? `url('#${lid}')` : currentColor);
            addTo(bar, ElementAttribute.WIDTH, barWidth);
            addTo(bar, ElementAttribute.HEIGHT, barHeight);

            // BORDERS
            const borderLeft = spawnNS(SvgElement.LINE);
            addTo(borderLeft, SvgAttribute.X1, svgWidth / 2 - barWidth / 2);
            addTo(borderLeft, SvgAttribute.X2, svgWidth / 2 - barWidth / 2);
            addTo(borderLeft, SvgAttribute.Y1, padding.top);
            addTo(borderLeft, SvgAttribute.Y2, trackHeight);
            addTo(borderLeft, SvgAttribute.STROKE, "#c9ced1");
            addTo(borderLeft, SvgAttribute.STROKE_WIDTH, 2);
            addTo(borderLeft, SvgAttribute.STROKE_LINECAP, "round");
            addTo(borderLeft, SvgAttribute.STROKE_LINEJOIN, "round");

            const borderRight = spawnNS(SvgElement.LINE);
            addTo(borderRight, SvgAttribute.X1, svgWidth / 2 + barWidth / 2);
            addTo(borderRight, SvgAttribute.X2, svgWidth / 2 + barWidth / 2);
            addTo(borderRight, SvgAttribute.Y1, padding.top);
            addTo(borderRight, SvgAttribute.Y2, trackHeight);
            addTo(borderRight, SvgAttribute.STROKE, "#c9ced1");
            addTo(borderRight, SvgAttribute.STROKE_WIDTH, 2);
            addTo(borderRight, SvgAttribute.STROKE_LINECAP, "round");
            addTo(borderRight, SvgAttribute.STROKE_LINEJOIN, "round");

            // VALUE LABEL
            gChart.appendChild(createText({
                content: `${(child as HTMLElement).dataset.value}${hasSymbol ? (child as HTMLElement).dataset.symbol : ''}`,
                y: svgHeight - padding.bottom - barHeight + 8.5,
                x: svgWidth / 2 - (barWidth / 2 + 30),
                fontSize: 24,
                position: "end"
            }));

            // TICK LABELS
            gChart.appendChild(createText({
                content: `${String(max)}${hasSymbol ? (child as HTMLElement).dataset.symbol : ''}`,
                x: svgWidth / 2 + barWidth / 2 + 20,
                y: padding.top + 6,
                fontSize: 18,
                color: "grey",
                position: "left"
            }));

            gChart.appendChild(createText({
                content: `${String(min)}${hasSymbol ? (child as HTMLElement).dataset.symbol : ''}`,
                x: svgWidth / 2 + barWidth / 2 + 20,
                y: svgHeight - padding.bottom,
                fontSize: 18,
                color: "grey",
                position: "left"
            }));

            [
                track,
                bar,
                gTicks,
                arrow,
                borderLeft,
                borderRight
            ].forEach(e => gChart.appendChild(e));

            chartSvg.appendChild(gChart);
            child.appendChild(chartSvg);
        }

    });
}

////////////////////////////////////////////////////////////////////////////////
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\//
//------------------------------      UTILS      -------------------------------
////////////////////////////////////////////////////////////////////////////////
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\//

export function createText(
    {
        cssClasses,
        color = "black",
        content,
        fontSize = 20,
        position = SvgTextPosition.MIDDLE,
        x,
        y
    }:
        {
            cssClasses?: string[],
            color?: string,
            content: string,
            fontSize?: number,
            position?: string,
            x: number,
            y: number
        }): SVGTextContentElement {
    const text = spawnNS(SvgElement.TEXT);
    if (cssClasses) {
        cssClasses.forEach(c => {
            text.classList.add(c);
        });
    }
    addTo(text, SvgAttribute.X, x);
    addTo(text, SvgAttribute.Y, y);
    addTo(text, SvgAttribute.TEXT_ANCHOR, position);
    addTo(text, SvgAttribute.FONT_SIZE, fontSize);
    addTo(text, SvgAttribute.FILL, color);
    text.innerHTML = content;
    return text as SVGTextContentElement;
}

export function rotateMatrix(x: number): [number[], number[]] {
    return [
        [Math.cos(x), -Math.sin(x)],
        [Math.sin(x), Math.cos(x)],
    ];
}

export function addVector([a1, a2]: number[], [b1, b2]: number[]): number[] {
    return [a1 + b1, a2 + b2];
}

export function matrixTimes([[a, b], [c, d]]: number[][], [x, y]: number[]) {
    return [a * x + b * y, c * x + d * y];
}

export function createArc([cx, cy]: number[], [rx, ry]: number[], [position, ratio]: number[], phi: number) {
    ratio = ratio % (2 * Math.PI);
    const rotMatrix = rotateMatrix(phi);
    const [sX, sY] = addVector(
        matrixTimes(rotMatrix, [
            rx * Math.cos(position),
            ry * Math.sin(position),
        ]),
        [cx, cy]
    );
    const [eX, eY] = addVector(
        matrixTimes(rotMatrix, [
            rx * Math.cos(position + ratio),
            ry * Math.sin(position + ratio),
        ]),
        [cx, cy]
    );
    const fA = ratio > Math.PI ? 1 : 0;
    const fS = ratio > 0 ? 1 : 0;
    return {
        startX: sX,
        startY: sY,
        endX: eX,
        endY: eY,
        path: `M${sX} ${sY} A ${[
            rx,
            ry,
            (phi / (2 * Math.PI)) * 360,
            fA,
            fS,
            eX,
            eY,
        ].join(" ")}`,
    };
}

export function makeDonut(item: any, cx: number, cy: number, rx: number, ry: number) {
    let { series } = item;
    if (!series)
        return {
            ...series,
            proportion: 0,
            ratio: 0,
            path: "",
            startX: 0,
            startY: 0,
            endX: 0,
            center: {},
        };
    const sum = [...series]
        .map((serie) => serie.value)
        .reduce((a, b) => a + b, 0);
    const ratios = [];
    let acc = 0;
    for (let i = 0; i < series.length; i += 1) {
        let proportion = series[i].value / sum;
        const ratio = proportion * (Math.PI * 1.9999); // (Math.PI * 2) fails to display a donut with only one value > 0 as it goes full circle again
        // midProportion & midRatio are used to find the midpoint of the arc to display markers
        const midProportion = series[i].value / 2 / sum;
        const midRatio = midProportion * (Math.PI * 2);
        const { startX, startY, endX, endY, path } = createArc(
            [cx, cy],
            [rx, ry],
            [acc, ratio],
            110
        );
        ratios.push({
            ...series[i],
            proportion,
            ratio: ratio,
            path,
            startX,
            startY,
            endX,
            endY,
            center: createArc(
                [cx, cy],
                [rx * 1.35, ry * 1.35],
                [acc, midRatio],
                110
            ), // center of the arc, to display the marker. rx & ry are larger to be displayed with a slight offset
        });
        acc += ratio;
    }
    return ratios;
}

export function updateCharts() {
    const charts = document.getElementsByClassName(CssClass.CHART);
    Array.from(charts).forEach(c => {
        c.innerHTML = "";
    })
    createCharts();
}

const charts = {
    createCharts,
    updateCharts
}

export default charts;

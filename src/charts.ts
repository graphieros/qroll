import { Chart, CssClass, DomElement, ElementAttribute, EventTrigger, SvgAttribute, SvgElement } from "./constants";
import { addTo, createUid, spawn, spawnNS } from "./functions";

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

        // LINE CHARTS

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
            const userColors = JSON.parse((child as HTMLElement).dataset.colors as any);

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
                colors = userColors;
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

                    const labelX = spawnNS(SvgElement.TEXT);
                    addTo(labelX, SvgAttribute.X, (i * interval) + padding.x);
                    addTo(labelX, SvgAttribute.Y, calcY(0) + 40);
                    addTo(labelX, SvgAttribute.TEXT_ANCHOR, "middle");
                    addTo(labelX, SvgAttribute.FONT_SIZE, 20);
                    labelX.innerHTML = yValues[i] || "";
                    gTicks.appendChild(labelX);
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

                    const labelY = spawnNS(SvgElement.TEXT);
                    addTo(labelY, SvgAttribute.X, padding.x - 25);
                    addTo(labelY, SvgAttribute.Y, calcY(i) + 5);
                    addTo(labelY, SvgAttribute.TEXT_ANCHOR, "end");
                    addTo(labelY, SvgAttribute.FONT_SIZE, 20);
                    labelY.innerHTML = `${Math.round(minValue + i)}${dataSymbol ?? ''}`;
                    gTicks.appendChild(labelY);
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
                document.body.appendChild(tooltip);
            }

            child.appendChild(chartSvg);

            // TITLE

            if (hasTitle) {
                const titleContent = (child as HTMLElement).dataset.title as string;
                const title = spawnNS(SvgElement.TEXT);
                addTo(title, SvgAttribute.X, svgWidth / 2);
                addTo(title, SvgAttribute.Y, 30);
                addTo(title, SvgAttribute.TEXT_ANCHOR, "middle");
                addTo(title, SvgAttribute.FONT_SIZE, 32);
                title.innerHTML = titleContent;
                chartSvg.appendChild(title);
            }

            // SUBTITLE

            if (hasSubtitle) {
                const subtitleContent = (child as HTMLElement).dataset.subtitle as string;
                const subtitle = spawnNS(SvgElement.TEXT);
                addTo(subtitle, SvgAttribute.X, svgWidth / 2);
                addTo(subtitle, SvgAttribute.Y, 55);
                addTo(subtitle, SvgAttribute.TEXT_ANCHOR, "middle");
                addTo(subtitle, SvgAttribute.FONT_SIZE, 20);
                addTo(subtitle, SvgAttribute.FILL, "grey");
                subtitle.innerHTML = subtitleContent;
                chartSvg.appendChild(subtitle);
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

        // BAR CHART
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
            const userColors = JSON.parse((child as HTMLElement).dataset.colors as any);

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
                colors = userColors;
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
                    const labelX = spawnNS(SvgElement.TEXT);
                    addTo(labelX, SvgAttribute.X, (i * interval) + padding.x + interval / 2);
                    addTo(labelX, SvgAttribute.Y, calcY(0) + 40);
                    addTo(labelX, SvgAttribute.TEXT_ANCHOR, "middle");
                    addTo(labelX, SvgAttribute.FONT_SIZE, 20);
                    labelX.innerHTML = yValues[i] || "";
                    gTicks.appendChild(labelX);
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

                    const labelY = spawnNS(SvgElement.TEXT);
                    addTo(labelY, SvgAttribute.X, padding.x - 25);
                    addTo(labelY, SvgAttribute.Y, calcY(i) + 5);
                    addTo(labelY, SvgAttribute.TEXT_ANCHOR, "end");
                    addTo(labelY, SvgAttribute.FONT_SIZE, 20);
                    labelY.innerHTML = `${Math.round(minValue + i)}${dataSymbol ?? ''}`;
                    gTicks.appendChild(labelY);
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
                        addTo(rect, "height", (minCeiling * (Math.abs(plot.absoluteValue) / Math.abs(minValue))));
                    } else {
                        addTo(rect, SvgAttribute.Y, plot.y);
                        addTo(rect, "height", calcY(Math.abs(minValue)) - plot.y);
                    }
                    addTo(rect, "width", (interval - (gap * 2)) / plots.length);
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
                        addTo(text, SvgAttribute.TEXT_ANCHOR, "middle");
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
                document.body.appendChild(tooltip);
            }

            child.appendChild(chartSvg);

            if (hasTitle) {
                const titleContent = (child as HTMLElement).dataset.title as string;
                const title = spawnNS(SvgElement.TEXT);
                addTo(title, SvgAttribute.X, svgWidth / 2);
                addTo(title, SvgAttribute.Y, 30);
                addTo(title, SvgAttribute.TEXT_ANCHOR, "middle");
                addTo(title, SvgAttribute.FONT_SIZE, 32);
                title.innerHTML = titleContent;
                chartSvg.appendChild(title);
            }

            // SUBTITLE

            if (hasSubtitle) {
                const subtitleContent = (child as HTMLElement).dataset.subtitle as string;
                const subtitle = spawnNS(SvgElement.TEXT);
                addTo(subtitle, SvgAttribute.X, svgWidth / 2);
                addTo(subtitle, SvgAttribute.Y, 55);
                addTo(subtitle, SvgAttribute.TEXT_ANCHOR, "middle");
                addTo(subtitle, SvgAttribute.FONT_SIZE, 20);
                addTo(subtitle, SvgAttribute.FILL, "grey");
                subtitle.innerHTML = subtitleContent;
                chartSvg.appendChild(subtitle);
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
    });
}

const charts = {
    createCharts
}

export default charts;

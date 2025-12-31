import state from "./state.js";
import { getWidgetsInContainer, getWidgetsInTab } from "./hierarchyManager.js";

export async function generateC() {
    let cCode = "";

    if (state.projectSettings.platform == "embedded") {
        cCode = `#include <gooey.h>\n`;
        cCode += `#include <Arduino.h>\n\n`;
    } else {
        cCode = `#include <Gooey/gooey.h>\n\n`;
    }

    const usedWidgetTypes = new Set();
    state.previewContent.querySelectorAll(".widget").forEach((widget) => {
        usedWidgetTypes.add(widget.dataset.type);
    });

    cCode += `\n`;

    Object.entries(state.widgetCallbacks).forEach(([widgetId, callbacks]) => {
        const widget = document.querySelector(`.widget[data-id="${widgetId}"]`);
        if (!widget) return;

        const widgetType = widget.dataset.type;

        Object.entries(callbacks).forEach(([callbackType, callbackData]) => {
            if (callbackType.endsWith("_code") && callbackData) {
                cCode += `${callbackData}\n\n`;
            }
        });
    });

    switch (state.projectSettings.platform) {
        case "embedded":
            cCode += `void setup()\n{\n`;
            break;
        case "desktop":
            cCode += `int main()\n{\n`;
            break;
        case "web":
            break;
        default:
            break;
    }

    cCode += `    Gooey_Init();\n`;
    cCode += `    GooeyWindow *win = GooeyWindow_Create("${document.getElementById("win-title").value}", 0, 0, ${document.getElementById("win-width").value}, ${document.getElementById("win-height").value}, true);\n\n`;

    if (state.previewWindow.dataset.debug_overlay === "true")
        cCode += `    GooeyWindow_EnableDebugOverlay(win, true);\n`;

    if (state.previewWindow.dataset.cont_redraw === "true")
        cCode += `    GooeyWindow_SetContinuousRedraw(win);\n`;

    if (state.previewWindow.dataset.is_visible === "true")
        cCode += `    GooeyWindow_MakeVisible(win, true);\n`;
    else cCode += `    GooeyWindow_MakeVisible(win, false);\n`;

    if (state.previewWindow.dataset.is_resizable === "true")
        cCode += `    GooeyWindow_MakeResizable(win, true);\n`;
    else cCode += `    GooeyWindow_MakeResizable(win, false);\n\n`;

    state.widgetCounter = 0;
    let widgetVars = new Set();
    let widgetRegistrations = [];
    let processedWidgetIds = new Set();

    function generateUniqueVarName(baseName) {
        let counter = 1;
        let varName = baseName;

        while (widgetVars.has(varName)) {
            varName = `${baseName}_${counter++}`;
        }

        widgetVars.add(varName);
        return varName;
    }

    function processWidgetC(
        widget,
        indent,
        parentVar = null,
        containerId = null,
        tabId = null,
    ) {
        const widgetId = widget.dataset.id;

        if (processedWidgetIds.has(widgetId)) {
            return "";
        }

        processedWidgetIds.add(widgetId);

        let type = widget.dataset.type;
        let x = parseInt(widget.style.left) || 0;
        let y = parseInt(widget.style.top) || 0;
        let width = parseInt(widget.style.width) || 100;
        let height = parseInt(widget.style.height) || 30;

        let text = widget.textContent || "";
        text = text.replace(/"/g, '\\"');

        let callbackData = state.widgetCallbacks[widgetId];
        let callbackName = callbackData?.callbackName || "";

        let callbackWithData = callbackName
            ? `${callbackName}, NULL`
            : "NULL, NULL";

        let widgetVar = widget.dataset.widgetVar;
        if (!widgetVar || widgetVars.has(widgetVar)) {
            widgetVar = generateUniqueVarName(
                `${type.toLowerCase()}_${state.widgetCounter++}`,
            );
            widget.dataset.widgetVar = widgetVar;
        } else {
            widgetVars.add(widgetVar);
        }

        let widgetCode = "";

        switch (type) {
            case "Button":
                widgetCode = `${indent}GooeyButton *${widgetVar} = GooeyButton_Create("${text}", ${x}, ${y}, ${width}, ${height}, ${callbackWithData});\n`;
                break;

            case "Input":
                widgetCode = `${indent}GooeyTextbox *${widgetVar} = GooeyTextBox_Create(${x}, ${y}, ${width}, ${height}, "${text}", false, ${callbackWithData});\n`;
                break;

            case "Slider":
                let minValue = widget.dataset.minValue || 0;
                let maxValue = widget.dataset.maxValue || 100;
                let showHints = widget.dataset.showHints || "false";
                widgetCode = `${indent}GooeySlider *${widgetVar} = GooeySlider_Create(${x}, ${y}, ${width}, ${minValue}, ${maxValue}, ${showHints}, ${callbackWithData});\n`;
                break;

            case "Checkbox":
                widgetCode = `${indent}GooeyCheckbox *${widgetVar} = GooeyCheckbox_Create(${x}, ${y}, "${text}", ${callbackWithData});\n`;
                break;

            case "Label":
                widgetCode = `${indent}GooeyLabel *${widgetVar} = GooeyLabel_Create("${text}", 18.0f, ${x}, ${y});\n`;
                break;

            case "Canvas":
                widgetCode = `${indent}GooeyCanvas *${widgetVar} = GooeyCanvas_Create(${x}, ${y}, ${width}, ${height}, NULL, NULL);\n`;
                break;

            case "Image":
                let imagePath =
                    widget.dataset.relativePath || "./assets/example.png";
                widgetCode = `${indent}GooeyImage *${widgetVar} = GooeyImage_Create("${imagePath}", ${x}, ${y}, ${width}, ${height}, ${callbackWithData});\n`;
                break;

            case "DropSurface":
                let message =
                    widget.dataset.dropsurfaceMessage || "Drop files here..";
                widgetCode = `${indent}GooeyDropSurface *${widgetVar} = GooeyDropSurface_Create(${x}, ${y}, ${width}, ${height}, "${message}", ${callbackWithData});\n`;
                break;

            case "Dropdown":
                let dropdownOptionsList = widget.dataset.dropdownOptions
                    ? widget.dataset.dropdownOptions.split(",")
                    : [];
                let dropdownOptionsListLength = dropdownOptionsList.length;
                dropdownOptionsList = dropdownOptionsList.map(
                    (option) => `"${option.trim()}"`,
                );

                if (dropdownOptionsListLength > 0) {
                    widgetCode = `${indent}const char* options_${widgetVar}[${dropdownOptionsListLength}] = {${dropdownOptionsList.join(", ")}};\n`;
                    widgetCode += `${indent}GooeyDropdown *${widgetVar} = GooeyDropdown_Create(${x}, ${y}, ${width}, ${height}, options_${widgetVar}, ${dropdownOptionsListLength}, ${callbackWithData});\n`;
                } else {
                    widgetCode = `${indent}GooeyDropdown *${widgetVar} = GooeyDropdown_Create(${x}, ${y}, ${width}, ${height}, NULL, 0, ${callbackWithData});\n`;
                }
                break;

            case "List":
                let listOptionsList = widget.dataset.listOptions
                    ? JSON.parse(widget.dataset.listOptions)
                    : [];
                widgetCode = `${indent}GooeyList *${widgetVar} = GooeyList_Create(${x}, ${y}, ${width}, ${height}, ${callbackWithData});\n`;

                listOptionsList.forEach((item) => {
                    widgetCode += `${indent}GooeyList_AddItem(${widgetVar}, "${item.name || ""}", "${item.description || ""}");\n`;
                });
                break;

            case "Menu":
                widgetCode = `${indent}GooeyMenu *${widgetVar} = GooeyMenu_Set(win);\n`;
                break;

            case "RadioButtonGroup":
                widgetCode = `${indent}GooeyRadioButtonGroup *${widgetVar} = GooeyRadioButtonGroup_Create();\n`;
                break;

            case "Progressbar":
                let progressValue = widget.dataset.value || 50;
                widgetCode = `${indent}GooeyProgressBar *${widgetVar} = GooeyProgressBar_Create(${x}, ${y}, ${width}, ${height}, ${progressValue});\n`;
                break;

            case "Meter":
                let meterValue = widget.dataset.value || 50;
                let meterLabel = widget.dataset.label || "Meter";
                widgetCode = `${indent}GooeyMeter *${widgetVar} = GooeyMeter_Create(${x}, ${y}, ${width}, ${height}, ${meterValue}, "${meterLabel}", NULL);\n`;
                break;

            case "GSwitch":
                let isToggled = widget.classList.contains("checked")
                    ? "true"
                    : "false";
                let showSwitchHints = widget.dataset.showHints || "false";
                widgetCode = `${indent}GooeySwitch *${widgetVar} = GooeySwitch_Create(${x}, ${y}, ${isToggled}, ${showSwitchHints}, ${callbackWithData});\n`;
                break;

            case "Container":
                widgetCode = `${indent}GooeyContainer *${widgetVar} = GooeyContainer_Create(${x}, ${y}, ${width}, ${height});\n`;

                const containerNames = JSON.parse(
                    widget.dataset.containerNames || '["Container 0"]',
                );

                containerNames.forEach((name, index) => {
                    widgetCode += `${indent}GooeyContainer_InsertContainer(${widgetVar}); // ${name}\n`;
                });

                const activeContainer = parseInt(
                    widget.dataset.activeContainer || "0",
                );
                widgetCode += `${indent}GooeyContainer_SetActiveContainer(${widgetVar}, ${activeContainer});\n`;

                containerNames.forEach((name, index) => {
                    const containerWidgets = getWidgetsInContainer(
                        widget,
                        index,
                    );
                    containerWidgets.forEach((childData) => {
                        const childCode = processWidgetC(
                            childData.widget,
                            indent + "    ",
                            widgetVar,
                            index,
                            null,
                        );
                        widgetCode += childCode;
                        widgetCode += `${indent}GooeyContainer_AddWidget(win, ${widgetVar}, ${index}, ${childData.widget.dataset.widgetVar});\n`;
                    });
                });
                break;

            case "Tabs":
                const isSidebar = widget.dataset.isSidebar || "false";
                widgetCode = `${indent}GooeyTabs *${widgetVar} = GooeyTabs_Create(${x}, ${y}, ${width}, ${height}, ${isSidebar});\n`;

                const tabNames = JSON.parse(
                    widget.dataset.tabNames || '["Tab 1", "Tab 2"]',
                );

                tabNames.forEach((name, index) => {
                    widgetCode += `${indent}GooeyTabs_InsertTab(${widgetVar}, "${name}");\n`;
                });

                const activeTab = parseInt(widget.dataset.activeTab || "0");
                widgetCode += `${indent}GooeyTabs_SetActiveTab(${widgetVar}, ${activeTab});\n`;

                tabNames.forEach((name, index) => {
                    const tabWidgets = getWidgetsInTab(widget, index);
                    tabWidgets.forEach((childData) => {
                        const childCode = processWidgetC(
                            childData.widget,
                            indent + "    ",
                            widgetVar,
                            null,
                            index,
                        );
                        widgetCode += childCode;
                        widgetCode += `${indent}GooeyTabs_AddWidget(win, ${widgetVar}, ${index}, ${childData.widget.dataset.widgetVar});\n`;
                    });
                });
                break;

            case "Plot":
                widgetCode = `${indent}float x_data_${widgetVar}[]  = {${widget.dataset.xAxisDataList}};\n`;
                widgetCode += `${indent}float y_data_${widgetVar}[]  = {${widget.dataset.yAxisDataList}};\n`;
                widgetCode += `${indent}float x_step_${widgetVar} = 1.0f;\n`;
                widgetCode += `${indent}float y_step_${widgetVar} = 1.0f;\n`;

                let selectedType;
                switch (widget.dataset.plotType) {
                    case "line":
                        selectedType = "GOOEY_PLOT_LINE";
                        break;
                    case "scatter":
                        selectedType = "GOOEY_PLOT_SCATTER";
                        break;
                    case "bar":
                        selectedType = "GOOEY_PLOT_BAR";
                        break;
                    case "pie":
                        selectedType = "GOOEY_PLOT_PIE";
                        break;
                    default:
                        selectedType = "GOOEY_PLOT_LINE";
                        break;
                }

                widgetCode += `${indent}GooeyPlotData* plotData_${widgetVar} = malloc(sizeof(GooeyPlotData));\n`;
                widgetCode += `${indent}*plotData_${widgetVar} = (GooeyPlotData) {x_data_${widgetVar}, y_data_${widgetVar}, ${widget.dataset.xAxisDataList.split(",").length}, "${widget.dataset.xAxisLabel}", x_step_${widgetVar}, "${widget.dataset.yAxisLabel}", y_step_${widgetVar}, "${widget.dataset.plotTitle}", -1, -1, -1, -1, NULL, ${selectedType}};\n`;
                widgetCode += `${indent}GooeyPlot *${widgetVar} = GooeyPlot_Create(${selectedType}, plotData_${widgetVar}, ${x}, ${y}, ${width}, ${height});\n`;
                break;

            case "VerticalLayout":
            case "HorizontalLayout":
                let layoutType =
                    type === "VerticalLayout"
                        ? "LAYOUT_VERTICAL"
                        : "LAYOUT_HORIZONTAL";
                widgetCode = `${indent}GooeyLayout *${widgetVar} = GooeyLayout_Create(${layoutType}, ${x}, ${y}, ${width}, ${height});\n`;

                Array.from(widget.children).forEach((child) => {
                    if (
                        child.classList.contains("widget") &&
                        !child.classList.contains("resize-handle")
                    ) {
                        const childCode = processWidgetC(
                            child,
                            indent + "    ",
                            widgetVar,
                        );
                        widgetCode += childCode;
                        widgetCode += `${indent}GooeyLayout_AddChild(win, ${widgetVar}, ${child.dataset.widgetVar});\n`;
                    }
                });

                widgetCode += `${indent}GooeyLayout_Build(${widgetVar});\n`;
                break;
        }

        if (type !== "Menu" && type !== "RadioButtonGroup") {
            if (!parentVar) {
                widgetRegistrations.push(
                    `${indent}GooeyWindow_RegisterWidget(win, ${widgetVar});\n`,
                );
            }
        }

        return widgetCode;
    }

    const allWidgetIds = new Set();
    state.previewContent.querySelectorAll(".widget").forEach((widget) => {
        allWidgetIds.add(widget.dataset.id);
    });

    const containerTabWidgets = Array.from(
        state.previewContent.querySelectorAll(".widget"),
    ).filter((widget) => {
        const type = widget.dataset.type;
        return type === "Container" || type === "Tabs";
    });

    containerTabWidgets.forEach((widget) => {
        cCode += processWidgetC(widget, "    ");
    });

    state.previewContent.querySelectorAll(".widget").forEach((widget) => {
        if (!widget.parentElement.classList.contains("layout")) {
            const widgetId = widget.dataset.id;

            if (processedWidgetIds.has(widgetId)) {
                return;
            }

            const type = widget.dataset.type;
            if (type === "Container" || type === "Tabs") {
                return;
            }

            const hierarchy = state.widgetHierarchy.get(widgetId);
            if (!hierarchy || (!hierarchy.containerId && !hierarchy.tabId)) {
                cCode += processWidgetC(widget, "    ");
            }
        }
    });

    cCode += `\n`;

    widgetRegistrations.forEach((reg) => {
        cCode += reg;
    });

    cCode += `\n    GooeyWindow_Run(1, win);\n`;

    if (state.projectSettings.platform == "embedded") {
        cCode += `}\n\nvoid loop() {\n}\n`;
    } else {
        cCode += `    GooeyWindow_Cleanup(1, win);\n\n`;
        cCode += `    return 0;\n}\n`;
    }

    state.editor.setValue(cCode);

    document.getElementById("status-text").textContent = "App Executed";
    setTimeout(() => {
        document.getElementById("status-text").textContent = "Ready";
    }, 2000);

    return cCode;
}

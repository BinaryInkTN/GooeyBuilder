import state from "./state.js";
import { updateWidgetList } from "./propertiesPanel.js";
import { showEditor } from "./uiHelpers.js";
import {
    createWidget,
    setupContainerTabsListeners,
} from "./widgetManagement.js";
import {
    updateWidgetHierarchy,
    removeWidgetFromHierarchy,
} from "./hierarchyManager.js";
export function generateProjectXML() {
    const xmlDoc = document.implementation.createDocument(null, "project");
    const root = xmlDoc.documentElement;
    root.setAttribute("version", "1.0");
    root.setAttribute("platform", state.projectSettings.platform || "desktop");
    root.setAttribute("language", state.projectSettings.language || "c");
    const windowElement = xmlDoc.createElement("window");
    windowElement.setAttribute(
        "title",
        state.previewTitleBar.querySelector(".preview-title-text").textContent,
    );
    windowElement.setAttribute("width", state.previewWindow.style.width);
    windowElement.setAttribute("height", state.previewWindow.style.height);
    windowElement.setAttribute("x", state.previewWindow.style.left || "0");
    windowElement.setAttribute("y", state.previewWindow.style.top || "0");
    windowElement.setAttribute(
        "debug_overlay",
        state.previewWindow.dataset.debug_overlay || "false",
    );
    windowElement.setAttribute(
        "cont_redraw",
        state.previewWindow.dataset.cont_redraw || "false",
    );
    windowElement.setAttribute(
        "is_visible",
        state.previewWindow.dataset.is_visible || "true",
    );
    windowElement.setAttribute(
        "is_resizable",
        state.previewWindow.dataset.is_resizable || "true",
    );
    root.appendChild(windowElement);
    const widgetsElement = xmlDoc.createElement("widgets");
    root.appendChild(widgetsElement);
    const processedWidgets = new Set();
    function saveWidget(
        widget,
        parentElement,
        parentId = null,
        containerId = null,
        tabId = null,
    ) {
        const widgetId = widget.dataset.id;
        if (processedWidgets.has(widgetId)) {
            return;
        }
        processedWidgets.add(widgetId);
        const widgetElement = xmlDoc.createElement("widget");
        widgetElement.setAttribute("type", widget.dataset.type);
        widgetElement.setAttribute("id", widgetId);
        if (widget.dataset.widgetVar) {
            widgetElement.setAttribute("widgetVar", widget.dataset.widgetVar);
        }
        const macroName = state.widgetMacroNames.get(widgetId);
        if (macroName) {
            widgetElement.setAttribute("macro", macroName);
        }
        if (parentId) {
            widgetElement.setAttribute("parentId", parentId);
        }
        if (containerId !== null) {
            widgetElement.setAttribute("containerId", containerId.toString());
        }
        if (tabId !== null) {
            widgetElement.setAttribute("tabId", tabId.toString());
        }
        widgetElement.setAttribute("x", widget.style.left || "0");
        widgetElement.setAttribute("y", widget.style.top || "0");
        widgetElement.setAttribute("width", widget.style.width || "100px");
        widgetElement.setAttribute("height", widget.style.height || "30px");
        switch (widget.dataset.type) {
            case "Button":
                widgetElement.setAttribute(
                    "text",
                    widget.textContent || "Button",
                );
                break;
            case "Label":
                widgetElement.setAttribute(
                    "text",
                    widget.textContent || "Label",
                );
                break;
            case "Input":
                widgetElement.setAttribute("text", widget.textContent || "");
                break;
            case "Checkbox":
                widgetElement.setAttribute(
                    "text",
                    widget.textContent || "Checkbox",
                );
                widgetElement.setAttribute(
                    "checked",
                    widget.classList.contains("checked") ? "true" : "false",
                );
                break;
            case "RadioButtonGroup":
                widgetElement.setAttribute(
                    "radioOptions",
                    widget.dataset.radioOptions || "[]",
                );
                break;
            case "Slider":
                widgetElement.setAttribute(
                    "minValue",
                    widget.dataset.minValue || "0",
                );
                widgetElement.setAttribute(
                    "maxValue",
                    widget.dataset.maxValue || "100",
                );
                widgetElement.setAttribute(
                    "showHints",
                    widget.dataset.showHints || "false",
                );
                widgetElement.setAttribute(
                    "value",
                    widget.dataset.value || "50",
                );
                break;
            case "Image":
                widgetElement.setAttribute(
                    "relativePath",
                    widget.dataset.relativePath || "./assets/example.png",
                );
                break;
            case "DropSurface":
                widgetElement.setAttribute(
                    "dropsurfaceMessage",
                    widget.dataset.dropsurfaceMessage || "Drop files here..",
                );
                break;
            case "Dropdown":
                widgetElement.setAttribute(
                    "dropdownOptions",
                    widget.dataset.dropdownOptions || "",
                );
                break;
            case "List":
                widgetElement.setAttribute(
                    "listOptions",
                    widget.dataset.listOptions || "[]",
                );
                break;
            case "Progressbar":
                widgetElement.setAttribute(
                    "value",
                    widget.dataset.value || "50",
                );
                break;
            case "Meter":
                widgetElement.setAttribute(
                    "value",
                    widget.dataset.value || "50",
                );
                widgetElement.setAttribute(
                    "label",
                    widget.dataset.label || "Meter",
                );
                break;
            case "GSwitch":
                widgetElement.setAttribute(
                    "showHints",
                    widget.dataset.showHints || "false",
                );
                widgetElement.setAttribute(
                    "state",
                    widget.classList.contains("checked") ? "true" : "false",
                );
                break;
            case "Tabs":
                widgetElement.setAttribute(
                    "isSidebar",
                    widget.dataset.isSidebar || "false",
                );
                widgetElement.setAttribute(
                    "tabCount",
                    widget.dataset.tabCount || "2",
                );
                widgetElement.setAttribute(
                    "activeTab",
                    widget.dataset.activeTab || "0",
                );
                widgetElement.setAttribute(
                    "tabNames",
                    widget.dataset.tabNames || '["Tab 1", "Tab 2"]',
                );
                break;
            case "Container":
                widgetElement.setAttribute(
                    "borderWidth",
                    widget.dataset.borderWidth || "1",
                );
                widgetElement.setAttribute(
                    "borderRadius",
                    widget.dataset.borderRadius || "4",
                );
                widgetElement.setAttribute(
                    "containerCount",
                    widget.dataset.containerCount || "1",
                );
                widgetElement.setAttribute(
                    "activeContainer",
                    widget.dataset.activeContainer || "0",
                );
                widgetElement.setAttribute(
                    "containerNames",
                    widget.dataset.containerNames || '["Container 0"]',
                );
                break;
            case "Plot":
                widgetElement.setAttribute(
                    "plotType",
                    widget.dataset.plotType || "line",
                );
                widgetElement.setAttribute(
                    "xAxisDataList",
                    widget.dataset.xAxisDataList || "1.0f,2.0f,3.0f",
                );
                widgetElement.setAttribute(
                    "yAxisDataList",
                    widget.dataset.yAxisDataList || "1.0f,2.0f,3.0f",
                );
                widgetElement.setAttribute(
                    "xAxisLabel",
                    widget.dataset.xAxisLabel || "X-Axis Label",
                );
                widgetElement.setAttribute(
                    "yAxisLabel",
                    widget.dataset.yAxisLabel || "Y-Axis Label",
                );
                widgetElement.setAttribute(
                    "plotTitle",
                    widget.dataset.plotTitle || "Plot Title",
                );
                break;
            case "Canvas":
                widgetElement.setAttribute(
                    "bgColor",
                    widget.dataset.bgColor || "#ffffff",
                );
                widgetElement.setAttribute(
                    "showGrid",
                    widget.dataset.showGrid || "false",
                );
                break;
            case "Overlay":
                widgetElement.setAttribute(
                    "opacity",
                    widget.dataset.opacity || "70",
                );
                break;
            case "Menu":
                break;
            default:
                if (widget.textContent) {
                    widgetElement.setAttribute("text", widget.textContent);
                }
                break;
        }
        if (state.widgetCallbacks[widgetId]) {
            const callbackElement = xmlDoc.createElement("callback");
            const callbackData = state.widgetCallbacks[widgetId];
            callbackElement.setAttribute(
                "callbackName",
                callbackData.callbackName || "",
            );
            Object.keys(callbackData).forEach((key) => {
                if (key.endsWith("_code") && callbackData[key]) {
                    const codeElement = xmlDoc.createElement(key);
                    codeElement.textContent = callbackData[key];
                    callbackElement.appendChild(codeElement);
                }
            });
            widgetElement.appendChild(callbackElement);
        }
        parentElement.appendChild(widgetElement);
        if (widget.dataset.type === "Tabs") {
            const tabCount = parseInt(widget.dataset.tabCount || "2");
            for (let tabId = 0; tabId < tabCount; tabId++) {
                const tabContent = widget.querySelector(
                    `.tab-content[data-tab-content="${tabId}"]`,
                );
                if (tabContent) {
                    tabContent
                        .querySelectorAll(".widget")
                        .forEach((childWidget) => {
                            saveWidget(
                                childWidget,
                                widgetsElement,
                                widgetId,
                                null,
                                tabId,
                            );
                        });
                }
            }
        } else if (widget.dataset.type === "Container") {
            const containerCount = parseInt(
                widget.dataset.containerCount || "1",
            );
            for (
                let containerId = 0;
                containerId < containerCount;
                containerId++
            ) {
                const containerContent = widget.querySelector(
                    `.container-content[data-container-id="${containerId}"]`,
                );
                if (containerContent) {
                    containerContent
                        .querySelectorAll(".widget")
                        .forEach((childWidget) => {
                            saveWidget(
                                childWidget,
                                widgetsElement,
                                widgetId,
                                containerId,
                                null,
                            );
                        });
                }
            }
        }
        return widgetElement;
    }
    const allWidgets = Array.from(
        state.previewContent.querySelectorAll(".widget"),
    );
    allWidgets.forEach((widget) => {
        const inTab = widget.closest(".tab-content");
        const inContainer = widget.closest(".container-content");
        if (!inTab && !inContainer) {
            saveWidget(widget, widgetsElement);
        }
    });
    allWidgets.forEach((widget) => {
        if (
            widget.dataset.type === "Tabs" ||
            widget.dataset.type === "Container"
        ) {
            saveWidget(widget, widgetsElement);
        }
    });
    const serializer = new XMLSerializer();
    const xmlString =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        serializer.serializeToString(xmlDoc);
    return xmlString;
}
export function saveProjectToXML() {
    try {
        const xmlString = generateProjectXML();
        if (state.uiXmlEditor) {
            state.uiXmlEditor.setValue(xmlString);
        }
        const blob = new Blob([xmlString], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${state.projectSettings.name || "project"}.gpf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        document.getElementById("status-text").textContent =
            "Project saved to GPF";
        setTimeout(() => {
            document.getElementById("status-text").textContent = "Ready";
        }, 2000);
    } catch (error) {
        console.error("Error saving project:", error);
        document.getElementById("status-text").textContent =
            "Error saving project";
    }
}
export function loadProjectFromXML() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".gpf,.xml";
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        window.localStorage.setItem("project", file.name);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(
                    event.target.result,
                    "application/xml",
                );
                const parserError = xmlDoc.querySelector("parsererror");
                if (parserError) {
                    throw new Error(
                        "Invalid XML format: " + parserError.textContent,
                    );
                }
                state.previewContent.innerHTML = "";
                state.widgetCallbacks = {};
                state.widgetHierarchy.clear();
                state.widgetVarNames.clear();
                state.widgetMacroNames.clear();
                state.widgetCounter = 0;
                state.selectedWidget = null;
                const windowEl = xmlDoc.querySelector("window");
                if (windowEl) {
                    const title = windowEl.getAttribute("title") || "My Window";
                    const width = windowEl.getAttribute("width") || "800px";
                    const height = windowEl.getAttribute("height") || "600px";
                    document.getElementById("win-title").value = title;
                    document.getElementById("win-width").value =
                        parseInt(width);
                    document.getElementById("win-height").value =
                        parseInt(height);
                    state.previewTitleBar.querySelector(
                        ".preview-title-text",
                    ).textContent = title;
                    state.previewWindow.style.width = width;
                    state.previewWindow.style.height = height;
                    state.previewWindow.dataset.debug_overlay =
                        windowEl.getAttribute("debug_overlay") || "false";
                    state.previewWindow.dataset.cont_redraw =
                        windowEl.getAttribute("cont_redraw") || "false";
                    state.previewWindow.dataset.is_visible =
                        windowEl.getAttribute("is_visible") || "true";
                    state.previewWindow.dataset.is_resizable =
                        windowEl.getAttribute("is_resizable") || "true";
                    document.getElementById(
                        "window-debug-enable-overlay",
                    ).checked =
                        state.previewWindow.dataset.debug_overlay === "true";
                    document.getElementById(
                        "window-debug-enable-cont-redraw",
                    ).checked =
                        state.previewWindow.dataset.cont_redraw === "true";
                    document.getElementById("window-debug-is-visible").checked =
                        state.previewWindow.dataset.is_visible === "true";
                    document.getElementById(
                        "window-debug-is-resizable",
                    ).checked =
                        state.previewWindow.dataset.is_resizable === "true";
                }
                const projectEl = xmlDoc.querySelector("project");
                if (projectEl) {
                    state.projectSettings.platform =
                        projectEl.getAttribute("platform") || "desktop";
                    state.projectSettings.language =
                        projectEl.getAttribute("language") || "c";
                    state.projectSettings.name =
                        projectEl.getAttribute("name") || "Untitled";
                }
                const widgetsEl = xmlDoc.querySelector("widgets");
                if (!widgetsEl) {
                    throw new Error("No widgets found in project file");
                }
                const widgetEls = [...widgetsEl.querySelectorAll("widget")];
                const widgetMap = new Map();
                const parentChildMap = new Map();
                widgetEls.forEach((el) => {
                    const type = el.getAttribute("type");
                    const id = el.getAttribute("id");
                    const x = parseInt(el.getAttribute("x") || "0");
                    const y = parseInt(el.getAttribute("y") || "0");
                    const widget = createWidget(type, x, y);
                    if (!widget) {
                        console.error(
                            `Failed to create widget of type: ${type}`,
                        );
                        return;
                    }
                    widget.dataset.id = id;
                    const widgetVar = el.getAttribute("widgetVar");
                    if (widgetVar) {
                        widget.dataset.widgetVar = widgetVar;
                        state.widgetVarNames.set(id, widgetVar);
                    }
                    const macroName = el.getAttribute("macro");
                    if (macroName) {
                        state.widgetMacroNames.set(id, macroName);
                    }
                    const width = el.getAttribute("width") || "100px";
                    const height = el.getAttribute("height") || "30px";
                    widget.style.width = width;
                    widget.style.height = height;
                    switch (type) {
                        case "Button":
                        case "Label":
                            widget.textContent =
                                el.getAttribute("text") || type;
                            break;
                        case "Input":
                            widget.textContent = el.getAttribute("text") || "";
                            break;
                        case "Checkbox":
                            widget.textContent =
                                el.getAttribute("text") || "Checkbox";
                            if (el.getAttribute("checked") === "true") {
                                widget.classList.add("checked");
                            }
                            break;
                        case "RadioButtonGroup":
                            widget.dataset.radioOptions =
                                el.getAttribute("radioOptions") || "[]";
                            widget.textContent = "RadioButton Group";
                            break;
                        case "Slider":
                            widget.dataset.minValue =
                                el.getAttribute("minValue") || "0";
                            widget.dataset.maxValue =
                                el.getAttribute("maxValue") || "100";
                            widget.dataset.showHints =
                                el.getAttribute("showHints") || "false";
                            break;
                        case "Image":
                            widget.dataset.relativePath =
                                el.getAttribute("relativePath") ||
                                "./assets/example.png";
                            widget.textContent = widget.dataset.relativePath
                                .split(/[/\\]/)
                                .pop();
                            break;
                        case "DropSurface":
                            widget.dataset.dropsurfaceMessage =
                                el.getAttribute("dropsurfaceMessage") ||
                                "Drop files here..";
                            widget.textContent =
                                widget.dataset.dropsurfaceMessage;
                            break;
                        case "Dropdown":
                            widget.dataset.dropdownOptions =
                                el.getAttribute("dropdownOptions") || "";
                            widget.textContent = "Dropdown";
                            break;
                        case "List":
                            widget.dataset.listOptions =
                                el.getAttribute("listOptions") || "[]";
                            widget.textContent = "List";
                            break;
                        case "Progressbar":
                            widget.dataset.value =
                                el.getAttribute("value") || "50";
                            const progressFill =
                                widget.querySelector(".progress-fill");
                            if (progressFill) {
                                progressFill.style.width = `${widget.dataset.value}%`;
                            }
                            break;
                        case "Meter":
                            widget.dataset.value =
                                el.getAttribute("value") || "50";
                            widget.dataset.label =
                                el.getAttribute("label") || "Meter";
                            widget.textContent = widget.dataset.label;
                            break;
                        case "GSwitch":
                            widget.dataset.showHints =
                                el.getAttribute("showHints") || "false";
                            if (el.getAttribute("state") === "true") {
                                widget.classList.add("checked");
                            }
                            break;
                        case "Tabs":
                            widget.dataset.isSidebar =
                                el.getAttribute("isSidebar") || "false";
                            widget.dataset.tabCount =
                                el.getAttribute("tabCount") || "2";
                            widget.dataset.activeTab =
                                el.getAttribute("activeTab") || "0";
                            widget.dataset.tabNames =
                                el.getAttribute("tabNames") ||
                                '["Tab 1", "Tab 2"]';
                            const tabNames = JSON.parse(
                                widget.dataset.tabNames,
                            );
                            const activeTab = parseInt(
                                widget.dataset.activeTab,
                            );
                            const tabHeader =
                                widget.querySelector(".tab-header");
                            const tabContents =
                                widget.querySelector(".tab-contents");
                            if (tabHeader && tabContents) {
                                const tabControls =
                                    tabHeader.querySelector(".tab-controls");
                                tabHeader.innerHTML = "";
                                if (tabControls)
                                    tabHeader.appendChild(tabControls);
                                tabContents.innerHTML = "";
                                tabNames.forEach((name, index) => {
                                    const tabItem =
                                        document.createElement("div");
                                    tabItem.className = "tab-item";
                                    tabItem.dataset.tabId = index;
                                    tabItem.textContent = name;
                                    if (index === activeTab) {
                                        tabItem.classList.add("active");
                                    }
                                    tabHeader.insertBefore(
                                        tabItem,
                                        tabControls,
                                    );
                                    const tabContent =
                                        document.createElement("div");
                                    tabContent.className = "tab-content";
                                    tabContent.dataset.tabContent = index;
                                    if (index === activeTab) {
                                        tabContent.classList.add("active");
                                    }
                                    const placeholder =
                                        document.createElement("div");
                                    placeholder.className = "tab-placeholder";
                                    placeholder.textContent = `Drop widgets here for ${name}`;
                                    tabContent.appendChild(placeholder);
                                    tabContents.appendChild(tabContent);
                                });
                            }
                            break;
                        case "Container":
                            widget.dataset.borderWidth =
                                el.getAttribute("borderWidth") || "1";
                            widget.dataset.borderRadius =
                                el.getAttribute("borderRadius") || "4";
                            widget.dataset.containerCount =
                                el.getAttribute("containerCount") || "1";
                            widget.dataset.activeContainer =
                                el.getAttribute("activeContainer") || "0";
                            widget.dataset.containerNames =
                                el.getAttribute("containerNames") ||
                                '["Container 0"]';
                            widget.style.borderWidth =
                                widget.dataset.borderWidth + "px";
                            widget.style.borderRadius =
                                widget.dataset.borderRadius + "px";
                            const containerNames = JSON.parse(
                                widget.dataset.containerNames,
                            );
                            const activeContainer = parseInt(
                                widget.dataset.activeContainer,
                            );
                            const containerHeader =
                                widget.querySelector(".container-header");
                            const containerContents = widget.querySelector(
                                ".container-contents",
                            );
                            if (containerHeader && containerContents) {
                                const containerControls =
                                    containerHeader.querySelector(
                                        ".container-controls",
                                    );
                                containerHeader.innerHTML = "";
                                if (containerControls)
                                    containerHeader.appendChild(
                                        containerControls,
                                    );
                                containerContents.innerHTML = "";
                                const containerTabs =
                                    document.createElement("div");
                                containerTabs.className = "container-tabs";
                                containerHeader.insertBefore(
                                    containerTabs,
                                    containerControls,
                                );
                                containerNames.forEach((name, index) => {
                                    const containerTab =
                                        document.createElement("div");
                                    containerTab.className = "container-tab";
                                    containerTab.dataset.containerId = index;
                                    containerTab.textContent = name;
                                    if (index === activeContainer) {
                                        containerTab.classList.add("active");
                                    }
                                    containerTabs.appendChild(containerTab);
                                    const containerContent =
                                        document.createElement("div");
                                    containerContent.className =
                                        "container-content";
                                    containerContent.dataset.containerId =
                                        index;
                                    if (index === activeContainer) {
                                        containerContent.classList.add(
                                            "active",
                                        );
                                    }
                                    const placeholder =
                                        document.createElement("div");
                                    placeholder.className =
                                        "container-placeholder";
                                    placeholder.textContent = `Drop widgets here for ${name}`;
                                    containerContent.appendChild(placeholder);
                                    containerContents.appendChild(
                                        containerContent,
                                    );
                                });
                            }
                            break;
                        case "Plot":
                            widget.dataset.plotType =
                                el.getAttribute("plotType") || "line";
                            widget.dataset.xAxisDataList =
                                el.getAttribute("xAxisDataList") ||
                                "1.0f,2.0f,3.0f";
                            widget.dataset.yAxisDataList =
                                el.getAttribute("yAxisDataList") ||
                                "1.0f,2.0f,3.0f";
                            widget.dataset.xAxisLabel =
                                el.getAttribute("xAxisLabel") || "X-Axis Label";
                            widget.dataset.yAxisLabel =
                                el.getAttribute("yAxisLabel") || "Y-Axis Label";
                            widget.dataset.plotTitle =
                                el.getAttribute("plotTitle") || "Plot Title";
                            widget.textContent = widget.dataset.plotTitle;
                            break;
                        case "Canvas":
                            widget.dataset.bgColor =
                                el.getAttribute("bgColor") || "#ffffff";
                            widget.dataset.showGrid =
                                el.getAttribute("showGrid") || "false";
                            widget.textContent = "Canvas";
                            break;
                        case "Overlay":
                            widget.dataset.opacity =
                                el.getAttribute("opacity") || "70";
                            widget.textContent = "Overlay";
                            break;
                        case "Menu":
                            widget.textContent = "Menu";
                            break;
                    }
                    const cb = el.querySelector("callback");
                    if (cb) {
                        const callbackName =
                            cb.getAttribute("callbackName") || "";
                        state.widgetCallbacks[id] = {
                            callbackName: callbackName,
                        };
                        [...cb.children].forEach((codeEl) => {
                            state.widgetCallbacks[id][codeEl.tagName] =
                                codeEl.textContent;
                        });
                    }
                    widgetMap.set(id, {
                        element: widget,
                        parentId: el.getAttribute("parentId"),
                        containerId: el.getAttribute("containerId"),
                        tabId: el.getAttribute("tabId"),
                    });
                    const parentId = el.getAttribute("parentId");
                    if (parentId) {
                        if (!parentChildMap.has(parentId)) {
                            parentChildMap.set(parentId, []);
                        }
                        parentChildMap.get(parentId).push(id);
                    }
                });
                widgetMap.forEach((widgetData, widgetId) => {
                    const widget = widgetData.element;
                    const parentId = widgetData.parentId;
                    const containerId = widgetData.containerId;
                    const tabId = widgetData.tabId;
                    if (parentId) {
                        const parentData = widgetMap.get(parentId);
                        if (!parentData) {
                            console.warn(
                                `Parent ${parentId} not found for widget ${widgetId}`,
                            );
                            state.previewContent.appendChild(widget);
                            return;
                        }
                        const parentWidget = parentData.element;
                        if (containerId !== null) {
                            const containerContent = parentWidget.querySelector(
                                `.container-content[data-container-id="${containerId}"]`,
                            );
                            if (containerContent) {
                                const placeholder =
                                    containerContent.querySelector(
                                        ".container-placeholder",
                                    );
                                if (placeholder) {
                                    placeholder.remove();
                                }
                                containerContent.appendChild(widget);
                                updateWidgetHierarchy(
                                    widget,
                                    parentWidget,
                                    parseInt(containerId),
                                    null,
                                );
                            } else {
                                console.warn(
                                    `Container ${containerId} not found in parent ${parentId}`,
                                );
                                state.previewContent.appendChild(widget);
                            }
                        } else if (tabId !== null) {
                            const tabContent = parentWidget.querySelector(
                                `.tab-content[data-tab-content="${tabId}"]`,
                            );
                            if (tabContent) {
                                const placeholder =
                                    tabContent.querySelector(
                                        ".tab-placeholder",
                                    );
                                if (placeholder) {
                                    placeholder.remove();
                                }
                                tabContent.appendChild(widget);
                                updateWidgetHierarchy(
                                    widget,
                                    parentWidget,
                                    null,
                                    parseInt(tabId),
                                );
                            } else {
                                console.warn(
                                    `Tab ${tabId} not found in parent ${parentId}`,
                                );
                                state.previewContent.appendChild(widget);
                            }
                        } else {
                            parentWidget.appendChild(widget);
                            updateWidgetHierarchy(
                                widget,
                                parentWidget,
                                null,
                                null,
                            );
                        }
                    } else {
                        state.previewContent.appendChild(widget);
                        updateWidgetHierarchy(widget, null, null, null);
                    }
                });
                widgetMap.forEach((widgetData) => {
                    const widget = widgetData.element;
                    if (
                        widget.dataset.type === "Tabs" ||
                        widget.dataset.type === "Container"
                    ) {
                        setupContainerTabsListeners(widget);
                    }
                });
                updateWidgetList();
                if (window.updateProjectXML) {
                    window.updateProjectXML();
                }
                document.getElementById("status-text").textContent =
                    "Project loaded successfully";
                setTimeout(() => {
                    document.getElementById("status-text").textContent =
                        "Ready";
                }, 2000);
            } catch (err) {
                console.error("Error loading project:", err);
                document.getElementById("status-text").textContent =
                    `Error loading project: ${err.message}`;
            }
        };
        reader.onerror = () => {
            document.getElementById("status-text").textContent =
                "Error reading file";
        };
        reader.readAsText(file);
    };
    input.click();
}
export function importProjectFromXML(xmlString) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");
        const parserError = xmlDoc.querySelector("parsererror");
        if (parserError) {
            throw new Error("Invalid XML format: " + parserError.textContent);
        }
        state.previewContent.innerHTML = "";
        state.widgetCallbacks = {};
        state.widgetHierarchy.clear();
        state.widgetVarNames.clear();
        state.widgetMacroNames.clear();
        state.widgetCounter = 0;
        state.selectedWidget = null;
        const windowEl = xmlDoc.querySelector("window");
        if (windowEl) {
            const title = windowEl.getAttribute("title") || "My Window";
            const width = windowEl.getAttribute("width") || "800px";
            const height = windowEl.getAttribute("height") || "600px";
            document.getElementById("win-title").value = title;
            document.getElementById("win-width").value = parseInt(width);
            document.getElementById("win-height").value = parseInt(height);
            state.previewTitleBar.querySelector(
                ".preview-title-text",
            ).textContent = title;
            state.previewWindow.style.width = width;
            state.previewWindow.style.height = height;
            state.previewWindow.dataset.debug_overlay =
                windowEl.getAttribute("debug_overlay") || "false";
            state.previewWindow.dataset.cont_redraw =
                windowEl.getAttribute("cont_redraw") || "false";
            state.previewWindow.dataset.is_visible =
                windowEl.getAttribute("is_visible") || "true";
            state.previewWindow.dataset.is_resizable =
                windowEl.getAttribute("is_resizable") || "true";
            document.getElementById("window-debug-enable-overlay").checked =
                state.previewWindow.dataset.debug_overlay === "true";
            document.getElementById("window-debug-enable-cont-redraw").checked =
                state.previewWindow.dataset.cont_redraw === "true";
            document.getElementById("window-debug-is-visible").checked =
                state.previewWindow.dataset.is_visible === "true";
            document.getElementById("window-debug-is-resizable").checked =
                state.previewWindow.dataset.is_resizable === "true";
        }
        const projectEl = xmlDoc.querySelector("project");
        if (projectEl) {
            state.projectSettings.platform =
                projectEl.getAttribute("platform") || "desktop";
            state.projectSettings.language =
                projectEl.getAttribute("language") || "c";
            state.projectSettings.name =
                projectEl.getAttribute("name") || "Untitled";
        }
        const widgetsEl = xmlDoc.querySelector("widgets");
        if (!widgetsEl) {
            throw new Error("No widgets found in project file");
        }
        const widgetEls = [...widgetsEl.querySelectorAll("widget")];
        const widgetMap = new Map();
        widgetEls.forEach((el) => {
            const type = el.getAttribute("type");
            const id = el.getAttribute("id");
            const x = parseInt(el.getAttribute("x") || "0");
            const y = parseInt(el.getAttribute("y") || "0");
            const widget = createWidget(type, x, y);
            if (!widget) {
                console.error(`Failed to create widget of type: ${type}`);
                return;
            }
            widget.dataset.id = id;
            const widgetVar = el.getAttribute("widgetVar");
            if (widgetVar) {
                widget.dataset.widgetVar = widgetVar;
                state.widgetVarNames.set(id, widgetVar);
            }
            const macroName = el.getAttribute("macro");
            if (macroName) {
                state.widgetMacroNames.set(id, macroName);
            }
            const width = el.getAttribute("width") || "100px";
            const height = el.getAttribute("height") || "30px";
            widget.style.width = width;
            widget.style.height = height;
            switch (type) {
                case "Button":
                case "Label":
                    widget.textContent = el.getAttribute("text") || type;
                    break;
                case "Input":
                    widget.textContent = el.getAttribute("text") || "";
                    break;
                case "Checkbox":
                    widget.textContent = el.getAttribute("text") || "Checkbox";
                    if (el.getAttribute("checked") === "true") {
                        widget.classList.add("checked");
                    }
                    break;
                case "RadioButtonGroup":
                    widget.dataset.radioOptions =
                        el.getAttribute("radioOptions") || "[]";
                    widget.textContent = "RadioButton Group";
                    break;
                case "Slider":
                    widget.dataset.minValue =
                        el.getAttribute("minValue") || "0";
                    widget.dataset.maxValue =
                        el.getAttribute("maxValue") || "100";
                    widget.dataset.showHints =
                        el.getAttribute("showHints") || "false";
                    break;
                case "Image":
                    widget.dataset.relativePath =
                        el.getAttribute("relativePath") ||
                        "./assets/example.png";
                    widget.textContent = widget.dataset.relativePath
                        .split(/[/\\]/)
                        .pop();
                    break;
                case "DropSurface":
                    widget.dataset.dropsurfaceMessage =
                        el.getAttribute("dropsurfaceMessage") ||
                        "Drop files here..";
                    widget.textContent = widget.dataset.dropsurfaceMessage;
                    break;
                case "Dropdown":
                    widget.dataset.dropdownOptions =
                        el.getAttribute("dropdownOptions") || "";
                    widget.textContent = "Dropdown";
                    break;
                case "List":
                    widget.dataset.listOptions =
                        el.getAttribute("listOptions") || "[]";
                    widget.textContent = "List";
                    break;
                case "Progressbar":
                    widget.dataset.value = el.getAttribute("value") || "50";
                    const progressFill = widget.querySelector(".progress-fill");
                    if (progressFill) {
                        progressFill.style.width = `${widget.dataset.value}%`;
                    }
                    break;
                case "Meter":
                    widget.dataset.value = el.getAttribute("value") || "50";
                    widget.dataset.label = el.getAttribute("label") || "Meter";
                    widget.textContent = widget.dataset.label;
                    break;
                case "GSwitch":
                    widget.dataset.showHints =
                        el.getAttribute("showHints") || "false";
                    if (el.getAttribute("state") === "true") {
                        widget.classList.add("checked");
                    }
                    break;
                case "Tabs":
                    widget.dataset.isSidebar =
                        el.getAttribute("isSidebar") || "false";
                    widget.dataset.tabCount =
                        el.getAttribute("tabCount") || "2";
                    widget.dataset.activeTab =
                        el.getAttribute("activeTab") || "0";
                    widget.dataset.tabNames =
                        el.getAttribute("tabNames") || '["Tab 1", "Tab 2"]';
                    const tabNames = JSON.parse(widget.dataset.tabNames);
                    const activeTab = parseInt(widget.dataset.activeTab);
                    const tabHeader = widget.querySelector(".tab-header");
                    const tabContents = widget.querySelector(".tab-contents");
                    if (tabHeader && tabContents) {
                        const tabControls =
                            tabHeader.querySelector(".tab-controls");
                        tabHeader.innerHTML = "";
                        if (tabControls) tabHeader.appendChild(tabControls);
                        tabContents.innerHTML = "";
                        tabNames.forEach((name, index) => {
                            const tabItem = document.createElement("div");
                            tabItem.className = "tab-item";
                            tabItem.dataset.tabId = index;
                            tabItem.textContent = name;
                            if (index === activeTab) {
                                tabItem.classList.add("active");
                            }
                            tabHeader.insertBefore(tabItem, tabControls);
                            const tabContent = document.createElement("div");
                            tabContent.className = "tab-content";
                            tabContent.dataset.tabContent = index;
                            if (index === activeTab) {
                                tabContent.classList.add("active");
                            }
                            const placeholder = document.createElement("div");
                            placeholder.className = "tab-placeholder";
                            placeholder.textContent = `Drop widgets here for ${name}`;
                            tabContent.appendChild(placeholder);
                            tabContents.appendChild(tabContent);
                        });
                    }
                    break;
                case "Container":
                    widget.dataset.borderWidth =
                        el.getAttribute("borderWidth") || "1";
                    widget.dataset.borderRadius =
                        el.getAttribute("borderRadius") || "4";
                    widget.dataset.containerCount =
                        el.getAttribute("containerCount") || "1";
                    widget.dataset.activeContainer =
                        el.getAttribute("activeContainer") || "0";
                    widget.dataset.containerNames =
                        el.getAttribute("containerNames") || '["Container 0"]';
                    widget.style.borderWidth =
                        widget.dataset.borderWidth + "px";
                    widget.style.borderRadius =
                        widget.dataset.borderRadius + "px";
                    const containerNames = JSON.parse(
                        widget.dataset.containerNames,
                    );
                    const activeContainer = parseInt(
                        widget.dataset.activeContainer,
                    );
                    const containerHeader =
                        widget.querySelector(".container-header");
                    const containerContents = widget.querySelector(
                        ".container-contents",
                    );
                    if (containerHeader && containerContents) {
                        const containerControls = containerHeader.querySelector(
                            ".container-controls",
                        );
                        containerHeader.innerHTML = "";
                        if (containerControls)
                            containerHeader.appendChild(containerControls);
                        containerContents.innerHTML = "";
                        const containerTabs = document.createElement("div");
                        containerTabs.className = "container-tabs";
                        containerHeader.insertBefore(
                            containerTabs,
                            containerControls,
                        );
                        containerNames.forEach((name, index) => {
                            const containerTab = document.createElement("div");
                            containerTab.className = "container-tab";
                            containerTab.dataset.containerId = index;
                            containerTab.textContent = name;
                            if (index === activeContainer) {
                                containerTab.classList.add("active");
                            }
                            containerTabs.appendChild(containerTab);
                            const containerContent =
                                document.createElement("div");
                            containerContent.className = "container-content";
                            containerContent.dataset.containerId = index;
                            if (index === activeContainer) {
                                containerContent.classList.add("active");
                            }
                            const placeholder = document.createElement("div");
                            placeholder.className = "container-placeholder";
                            placeholder.textContent = `Drop widgets here for ${name}`;
                            containerContent.appendChild(placeholder);
                            containerContents.appendChild(containerContent);
                        });
                    }
                    break;
                case "Plot":
                    widget.dataset.plotType =
                        el.getAttribute("plotType") || "line";
                    widget.dataset.xAxisDataList =
                        el.getAttribute("xAxisDataList") || "1.0f,2.0f,3.0f";
                    widget.dataset.yAxisDataList =
                        el.getAttribute("yAxisDataList") || "1.0f,2.0f,3.0f";
                    widget.dataset.xAxisLabel =
                        el.getAttribute("xAxisLabel") || "X-Axis Label";
                    widget.dataset.yAxisLabel =
                        el.getAttribute("yAxisLabel") || "Y-Axis Label";
                    widget.dataset.plotTitle =
                        el.getAttribute("plotTitle") || "Plot Title";
                    widget.textContent = widget.dataset.plotTitle;
                    break;
                case "Canvas":
                    widget.dataset.bgColor =
                        el.getAttribute("bgColor") || "#ffffff";
                    widget.dataset.showGrid =
                        el.getAttribute("showGrid") || "false";
                    widget.textContent = "Canvas";
                    break;
                case "Overlay":
                    widget.dataset.opacity = el.getAttribute("opacity") || "70";
                    widget.textContent = "Overlay";
                    break;
                case "Menu":
                    widget.textContent = "Menu";
                    break;
            }
            const cb = el.querySelector("callback");
            if (cb) {
                const callbackName = cb.getAttribute("callbackName") || "";
                state.widgetCallbacks[id] = {
                    callbackName: callbackName,
                };
                [...cb.children].forEach((codeEl) => {
                    state.widgetCallbacks[id][codeEl.tagName] =
                        codeEl.textContent;
                });
            }
            widgetMap.set(id, {
                element: widget,
                parentId: el.getAttribute("parentId"),
                containerId: el.getAttribute("containerId"),
                tabId: el.getAttribute("tabId"),
            });
        });
        widgetMap.forEach((widgetData, widgetId) => {
            const widget = widgetData.element;
            const parentId = widgetData.parentId;
            const containerId = widgetData.containerId;
            const tabId = widgetData.tabId;
            if (parentId) {
                const parentData = widgetMap.get(parentId);
                if (!parentData) {
                    console.warn(
                        `Parent ${parentId} not found for widget ${widgetId}`,
                    );
                    state.previewContent.appendChild(widget);
                    return;
                }
                const parentWidget = parentData.element;
                if (containerId !== null) {
                    const containerContent = parentWidget.querySelector(
                        `.container-content[data-container-id="${containerId}"]`,
                    );
                    if (containerContent) {
                        const placeholder = containerContent.querySelector(
                            ".container-placeholder",
                        );
                        if (placeholder) {
                            placeholder.remove();
                        }
                        containerContent.appendChild(widget);
                        updateWidgetHierarchy(
                            widget,
                            parentWidget,
                            parseInt(containerId),
                            null,
                        );
                    } else {
                        console.warn(
                            `Container ${containerId} not found in parent ${parentId}`,
                        );
                        state.previewContent.appendChild(widget);
                    }
                } else if (tabId !== null) {
                    const tabContent = parentWidget.querySelector(
                        `.tab-content[data-tab-content="${tabId}"]`,
                    );
                    if (tabContent) {
                        const placeholder =
                            tabContent.querySelector(".tab-placeholder");
                        if (placeholder) {
                            placeholder.remove();
                        }
                        tabContent.appendChild(widget);
                        updateWidgetHierarchy(
                            widget,
                            parentWidget,
                            null,
                            parseInt(tabId),
                        );
                    } else {
                        console.warn(
                            `Tab ${tabId} not found in parent ${parentId}`,
                        );
                        state.previewContent.appendChild(widget);
                    }
                } else {
                    parentWidget.appendChild(widget);
                    updateWidgetHierarchy(widget, parentWidget, null, null);
                }
            } else {
                state.previewContent.appendChild(widget);
                updateWidgetHierarchy(widget, null, null, null);
            }
        });
        widgetMap.forEach((widgetData) => {
            const widget = widgetData.element;
            if (
                widget.dataset.type === "Tabs" ||
                widget.dataset.type === "Container"
            ) {
                setupContainerTabsListeners(widget);
            }
        });
        updateWidgetList();
        if (window.updateProjectXML) {
            window.updateProjectXML();
        }
        return true;
    } catch (err) {
        console.error("Error importing project:", err);
        document.getElementById("status-text").textContent =
            `Error importing project: ${err.message}`;
        return false;
    }
}

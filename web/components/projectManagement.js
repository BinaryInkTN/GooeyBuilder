import state from "./state.js";
import { updateWidgetList } from "./propertiesPanel.js";
import { showEditor } from "./uiHelpers.js";
import { createWidget } from "./widgetManagement.js";
import { updateWidgetHierarchy } from "./hierarchyManager.js";

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

    function saveWidget(
        widget,
        parentElement,
        parentId = null,
        containerId = null,
        tabId = null,
    ) {
        const widgetElement = xmlDoc.createElement("widget");
        widgetElement.setAttribute("type", widget.dataset.type);
        widgetElement.setAttribute("id", widget.dataset.id);

        // Save widget variable name
        if (widget.dataset.widgetVar) {
            widgetElement.setAttribute("widgetVar", widget.dataset.widgetVar);
        }

        // Save hierarchy information
        if (parentId) {
            widgetElement.setAttribute("parentId", parentId);
        }

        if (containerId) {
            widgetElement.setAttribute("containerId", containerId);
        }

        if (tabId) {
            widgetElement.setAttribute("tabId", tabId);
        }

        widgetElement.setAttribute("x", widget.style.left || "0");
        widgetElement.setAttribute("y", widget.style.top || "0");
        widgetElement.setAttribute("width", widget.style.width);
        widgetElement.setAttribute("height", widget.style.height);

        // Save widget-specific attributes
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
            case "Textbox":
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
            case "Radio":
                widgetElement.setAttribute(
                    "text",
                    widget.textContent || "Radio",
                );
                widgetElement.setAttribute(
                    "checked",
                    widget.classList.contains("checked") ? "true" : "false",
                );
                widgetElement.setAttribute(
                    "group",
                    widget.dataset.group || "default",
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
                widgetElement.setAttribute(
                    "selectedIndex",
                    widget.dataset.selectedIndex || "0",
                );
                break;
            case "List":
                widgetElement.setAttribute(
                    "listOptions",
                    widget.dataset.listOptions || "[]",
                );
                widgetElement.setAttribute(
                    "selectedIndex",
                    widget.dataset.selectedIndex || "-1",
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

                // Save tab structure
                const tabs = [];
                const tabContents = [];

                widget.querySelectorAll(".tab").forEach((tab, index) => {
                    tabs.push({
                        id: tab.dataset.tab,
                        title: tab.textContent,
                        active: tab.classList.contains("active"),
                    });
                });

                widget
                    .querySelectorAll(".tab-content")
                    .forEach((content, index) => {
                        const tabId = content.dataset.tabContent;
                        const tabWidgets = [];

                        content
                            .querySelectorAll(".widget")
                            .forEach((childWidget) => {
                                const childWidgetElement =
                                    xmlDoc.createElement("widget");
                                childWidgetElement.setAttribute(
                                    "type",
                                    childWidget.dataset.type,
                                );
                                childWidgetElement.setAttribute(
                                    "id",
                                    childWidget.dataset.id,
                                );
                                childWidgetElement.setAttribute("tabId", tabId);
                                childWidgetElement.setAttribute(
                                    "parentId",
                                    widget.dataset.id,
                                );

                                if (childWidget.dataset.widgetVar) {
                                    childWidgetElement.setAttribute(
                                        "widgetVar",
                                        childWidget.dataset.widgetVar,
                                    );
                                }

                                childWidgetElement.setAttribute(
                                    "x",
                                    childWidget.style.left || "0",
                                );
                                childWidgetElement.setAttribute(
                                    "y",
                                    childWidget.style.top || "0",
                                );
                                childWidgetElement.setAttribute(
                                    "width",
                                    childWidget.style.width,
                                );
                                childWidgetElement.setAttribute(
                                    "height",
                                    childWidget.style.height,
                                );

                                // Save widget-specific attributes for tab children
                                switch (childWidget.dataset.type) {
                                    case "Button":
                                    case "Label":
                                    case "Textbox":
                                    case "Checkbox":
                                    case "Radio":
                                        childWidgetElement.setAttribute(
                                            "text",
                                            childWidget.textContent || "",
                                        );
                                        break;
                                }

                                tabWidgets.push(childWidgetElement);
                            });

                        tabContents.push({
                            id: tabId,
                            widgets: tabWidgets,
                        });
                    });

                widgetElement.setAttribute("tabs", JSON.stringify(tabs));
                widgetElement.setAttribute("tabContents", "[]"); // Placeholder, widgets are saved separately

                // Save tab widget children to main widgets list
                tabContents.forEach((tabContent) => {
                    tabContent.widgets.forEach((childWidgetElement) => {
                        widgetsElement.appendChild(childWidgetElement);
                    });
                });
                break;
            case "Container":
                widgetElement.setAttribute(
                    "containerType",
                    widget.dataset.containerType || "default",
                );

                // Save container structure
                const containers = [];

                widget
                    .querySelectorAll(".container-content")
                    .forEach((content, index) => {
                        const containerId = content.dataset.containerId;
                        const containerWidgets = [];

                        content
                            .querySelectorAll(".widget")
                            .forEach((childWidget) => {
                                const childWidgetElement =
                                    xmlDoc.createElement("widget");
                                childWidgetElement.setAttribute(
                                    "type",
                                    childWidget.dataset.type,
                                );
                                childWidgetElement.setAttribute(
                                    "id",
                                    childWidget.dataset.id,
                                );
                                childWidgetElement.setAttribute(
                                    "containerId",
                                    containerId,
                                );
                                childWidgetElement.setAttribute(
                                    "parentId",
                                    widget.dataset.id,
                                );

                                if (childWidget.dataset.widgetVar) {
                                    childWidgetElement.setAttribute(
                                        "widgetVar",
                                        childWidget.dataset.widgetVar,
                                    );
                                }

                                childWidgetElement.setAttribute(
                                    "x",
                                    childWidget.style.left || "0",
                                );
                                childWidgetElement.setAttribute(
                                    "y",
                                    childWidget.style.top || "0",
                                );
                                childWidgetElement.setAttribute(
                                    "width",
                                    childWidget.style.width,
                                );
                                childWidgetElement.setAttribute(
                                    "height",
                                    childWidget.style.height,
                                );

                                // Save widget-specific attributes for container children
                                switch (childWidget.dataset.type) {
                                    case "Button":
                                    case "Label":
                                    case "Textbox":
                                    case "Checkbox":
                                    case "Radio":
                                        childWidgetElement.setAttribute(
                                            "text",
                                            childWidget.textContent || "",
                                        );
                                        break;
                                }

                                containerWidgets.push(childWidgetElement);
                            });

                        containers.push({
                            id: containerId,
                            widgets: containerWidgets,
                        });
                    });

                // Save container widget children to main widgets list
                containers.forEach((container) => {
                    container.widgets.forEach((childWidgetElement) => {
                        widgetsElement.appendChild(childWidgetElement);
                    });
                });
                break;
            case "VerticalLayout":
            case "HorizontalLayout":
                // Layout widgets save their children through parentId
                break;
            case "Canvas":
                widgetElement.setAttribute("width", widget.style.width);
                widgetElement.setAttribute("height", widget.style.height);
                break;
            case "Plot":
                widgetElement.setAttribute(
                    "plotType",
                    widget.dataset.plotType || "line",
                );
                break;
            default:
                // For other widget types, save text if exists
                if (widget.textContent) {
                    widgetElement.setAttribute("text", widget.textContent);
                }
                break;
        }

        if (state.widgetCallbacks[widget.dataset.id]) {
            const callbackElement = xmlDoc.createElement("callback");
            callbackElement.setAttribute(
                "name",
                state.widgetCallbacks[widget.dataset.id].callbackName || "",
            );
            for (const type in state.widgetCallbacks[widget.dataset.id]) {
                if (type.endsWith("_code")) {
                    const codeElement = xmlDoc.createElement(type);
                    codeElement.textContent =
                        state.widgetCallbacks[widget.dataset.id][type];
                    callbackElement.appendChild(codeElement);
                }
            }
            widgetElement.appendChild(callbackElement);
        }

        parentElement.appendChild(widgetElement);

        // For layouts, save direct children
        if (
            widget.dataset.type === "VerticalLayout" ||
            widget.dataset.type === "HorizontalLayout"
        ) {
            Array.from(widget.children).forEach((child) => {
                if (
                    child.classList.contains("widget") &&
                    !child.classList.contains("resize-handle")
                ) {
                    saveWidget(child, widgetsElement, widget.dataset.id);
                }
            });
        }

        return widgetElement;
    }

    // Save all widgets in the preview
    const allWidgets = state.previewContent.querySelectorAll(".widget");
    const rootWidgets = [];

    // Find root widgets (not inside other widgets)
    allWidgets.forEach((widget) => {
        const parentWidget = widget.parentElement.closest(".widget");
        if (!parentWidget) {
            rootWidgets.push(widget);
        }
    });

    // Save root widgets
    rootWidgets.forEach((widget) => {
        saveWidget(widget, widgetsElement);
    });

    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
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
        a.download = "project.xml";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        document.getElementById("status-text").textContent =
            "Project saved to XML";
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
    input.accept = ".xml";
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(
                    event.target.result,
                    "application/xml",
                );

                // Clear existing state
                state.previewContent.innerHTML = "";
                state.widgetCallbacks = {};
                state.widgetHierarchy.clear();
                state.widgetVarNames.clear();
                state.widgetCounter = 0;

                const windowElement = xmlDoc.querySelector("window");
                if (windowElement) {
                    state.previewTitleBar.querySelector(
                        ".preview-title-text",
                    ).textContent =
                        windowElement.getAttribute("title") || "My Window";
                    state.previewWindow.style.width =
                        windowElement.getAttribute("width") || "800px";
                    state.previewWindow.style.height =
                        windowElement.getAttribute("height") || "600px";
                    state.previewWindow.style.left =
                        windowElement.getAttribute("x") || "0px";
                    state.previewWindow.style.top =
                        windowElement.getAttribute("y") || "0px";

                    document.getElementById("win-title").value =
                        windowElement.getAttribute("title") || "My Window";
                    document.getElementById("win-width").value = parseInt(
                        windowElement.getAttribute("width") || "800",
                    );
                    document.getElementById("win-height").value = parseInt(
                        windowElement.getAttribute("height") || "600",
                    );

                    state.previewWindow.dataset.debug_overlay =
                        windowElement.getAttribute("debug_overlay") || "false";
                    state.previewWindow.dataset.cont_redraw =
                        windowElement.getAttribute("cont_redraw") || "false";
                    state.previewWindow.dataset.is_visible =
                        windowElement.getAttribute("is_visible") || "true";
                    state.previewWindow.dataset.is_resizable =
                        windowElement.getAttribute("is_resizable") || "true";
                }

                const widgetsElement = xmlDoc.querySelector("widgets");
                if (!widgetsElement) return;

                const widgetElements = Array.from(
                    widgetsElement.querySelectorAll("widget"),
                );
                const widgetMap = new Map();

                // Helper function to create widget with all attributes
                function createWidgetFromElement(
                    widgetElement,
                    parentWidget = null,
                ) {
                    const type = widgetElement.getAttribute("type");
                    const id = widgetElement.getAttribute("id");
                    const parentId = widgetElement.getAttribute("parentId");
                    const containerId =
                        widgetElement.getAttribute("containerId");
                    const tabId = widgetElement.getAttribute("tabId");
                    const widgetVar = widgetElement.getAttribute("widgetVar");

                    const x = parseInt(widgetElement.getAttribute("x") || "0");
                    const y = parseInt(widgetElement.getAttribute("y") || "0");
                    const width =
                        widgetElement.getAttribute("width") || "100px";
                    const height =
                        widgetElement.getAttribute("height") || "30px";

                    // Create widget
                    let widget;

                    if (parentWidget) {
                        widget = createWidget(type, x, y, parentWidget);
                    } else {
                        widget = createWidget(type, x, y);
                    }

                    widget.dataset.id = id;

                    if (widgetVar) {
                        widget.dataset.widgetVar = widgetVar;
                        state.widgetVarNames.set(id, widgetVar);
                    }

                    if (containerId) {
                        widget.dataset.containerId = containerId;
                    }

                    if (tabId) {
                        widget.dataset.tabId = tabId;
                    }

                    widget.style.width = width;
                    widget.style.height = height;
                    widget.style.left = x + "px";
                    widget.style.top = y + "px";

                    // Set widget-specific attributes
                    switch (type) {
                        case "Button":
                        case "Label":
                        case "Textbox":
                            const text = widgetElement.getAttribute("text");
                            if (text !== null) {
                                widget.textContent = text;
                            }
                            break;
                        case "Checkbox":
                            const checkboxText =
                                widgetElement.getAttribute("text");
                            if (checkboxText !== null) {
                                widget.textContent = checkboxText;
                            }
                            if (
                                widgetElement.getAttribute("checked") === "true"
                            ) {
                                widget.classList.add("checked");
                            }
                            break;
                        case "Radio":
                            const radioText =
                                widgetElement.getAttribute("text");
                            if (radioText !== null) {
                                widget.textContent = radioText;
                            }
                            if (
                                widgetElement.getAttribute("checked") === "true"
                            ) {
                                widget.classList.add("checked");
                            }
                            widget.dataset.group =
                                widgetElement.getAttribute("group") ||
                                "default";
                            break;
                        case "Slider":
                            widget.dataset.minValue =
                                widgetElement.getAttribute("minValue") || "0";
                            widget.dataset.maxValue =
                                widgetElement.getAttribute("maxValue") || "100";
                            widget.dataset.showHints =
                                widgetElement.getAttribute("showHints") ||
                                "false";
                            widget.dataset.value =
                                widgetElement.getAttribute("value") || "50";
                            break;
                        case "Image":
                            widget.dataset.relativePath =
                                widgetElement.getAttribute("relativePath") ||
                                "./assets/example.png";
                            break;
                        case "DropSurface":
                            widget.dataset.dropsurfaceMessage =
                                widgetElement.getAttribute(
                                    "dropsurfaceMessage",
                                ) || "Drop files here..";
                            break;
                        case "Dropdown":
                            widget.dataset.dropdownOptions =
                                widgetElement.getAttribute("dropdownOptions") ||
                                "";
                            widget.dataset.selectedIndex =
                                widgetElement.getAttribute("selectedIndex") ||
                                "0";
                            break;
                        case "List":
                            widget.dataset.listOptions =
                                widgetElement.getAttribute("listOptions") ||
                                "[]";
                            widget.dataset.selectedIndex =
                                widgetElement.getAttribute("selectedIndex") ||
                                "-1";
                            break;
                        case "Progressbar":
                            widget.dataset.value =
                                widgetElement.getAttribute("value") || "50";
                            break;
                        case "Meter":
                            widget.dataset.value =
                                widgetElement.getAttribute("value") || "50";
                            widget.dataset.label =
                                widgetElement.getAttribute("label") || "Meter";
                            break;
                        case "GSwitch":
                            widget.dataset.showHints =
                                widgetElement.getAttribute("showHints") ||
                                "false";
                            if (
                                widgetElement.getAttribute("state") === "true"
                            ) {
                                widget.classList.add("checked");
                            }
                            break;
                        case "Tabs":
                            widget.dataset.isSidebar =
                                widgetElement.getAttribute("isSidebar") ||
                                "false";

                            // Restore tab structure
                            const tabsJSON = widgetElement.getAttribute("tabs");

                            if (tabsJSON) {
                                try {
                                    const tabs = JSON.parse(tabsJSON);

                                    // Clear existing tabs
                                    const tabsContainer =
                                        widget.querySelector(".tabs-container");
                                    const tabContentsContainer = widget;

                                    if (tabsContainer) {
                                        tabsContainer.innerHTML = "";

                                        tabs.forEach((tabInfo, index) => {
                                            const tab =
                                                document.createElement("div");
                                            tab.className = "tab";
                                            tab.textContent =
                                                tabInfo.title ||
                                                `Tab ${index + 1}`;
                                            tab.dataset.tab =
                                                tabInfo.id || `tab${index + 1}`;

                                            // Set active state
                                            if (tabInfo.active) {
                                                tab.classList.add("active");
                                            } else if (
                                                index === 0 &&
                                                !tabs.find((t) => t.active)
                                            ) {
                                                tab.classList.add("active");
                                            }

                                            tabsContainer.appendChild(tab);
                                        });

                                        // Force CSS recalculation
                                        void tabsContainer.offsetHeight;
                                    }

                                    // Clear existing tab contents
                                    const existingContents =
                                        widget.querySelectorAll(".tab-content");
                                    existingContents.forEach((tc) =>
                                        tc.remove(),
                                    );

                                    // Create new tab content containers
                                    tabs.forEach((tabInfo, index) => {
                                        const tabContent =
                                            document.createElement("div");
                                        tabContent.className = "tab-content";
                                        tabContent.dataset.tabContent =
                                            tabInfo.id || `tab${index + 1}`;

                                        // Set active state
                                        if (
                                            tabInfo.active ||
                                            (index === 0 &&
                                                !tabs.find((t) => t.active))
                                        ) {
                                            tabContent.classList.add("active");
                                        }

                                        widget.appendChild(tabContent);
                                    });

                                    // Reattach click handlers
                                    widget
                                        .querySelector(".tabs-container")
                                        .addEventListener("click", (e) => {
                                            if (
                                                e.target.classList.contains(
                                                    "tab",
                                                )
                                            ) {
                                                const tabId =
                                                    e.target.dataset.tab;

                                                // Deactivate all tabs and contents
                                                widget
                                                    .querySelectorAll(".tab")
                                                    .forEach((t) => {
                                                        t.classList.remove(
                                                            "active",
                                                        );
                                                        t.style.fontWeight =
                                                            "normal";
                                                    });
                                                widget
                                                    .querySelectorAll(
                                                        ".tab-content",
                                                    )
                                                    .forEach((tc) => {
                                                        tc.classList.remove(
                                                            "active",
                                                        );
                                                        tc.style.display =
                                                            "none";
                                                    });

                                                // Activate clicked tab
                                                e.target.classList.add(
                                                    "active",
                                                );
                                                e.target.style.fontWeight =
                                                    "bold";
                                                const targetContent =
                                                    widget.querySelector(
                                                        `.tab-content[data-tab-content="${tabId}"]`,
                                                    );
                                                if (targetContent) {
                                                    targetContent.classList.add(
                                                        "active",
                                                    );
                                                    targetContent.style.display =
                                                        "block";
                                                }
                                            }
                                        });

                                    // Trigger initial tab activation
                                    const firstTab =
                                        widget.querySelector(".tab.active");
                                    if (firstTab) {
                                        firstTab.click();
                                    }
                                } catch (e) {
                                    console.error(
                                        "Error parsing tabs JSON:",
                                        e,
                                    );
                                }
                            }
                            break;
                        case "Container":
                            widget.dataset.containerType =
                                widgetElement.getAttribute("containerType") ||
                                "default";
                            break;
                        case "Plot":
                            widget.dataset.plotType =
                                widgetElement.getAttribute("plotType") ||
                                "line";
                            break;
                    }

                    // Store callback if exists
                    const callbackElement =
                        widgetElement.querySelector("callback");
                    if (callbackElement) {
                        const callbackName =
                            callbackElement.getAttribute("name") || "";
                        if (!state.widgetCallbacks[id]) {
                            state.widgetCallbacks[id] = {};
                        }
                        state.widgetCallbacks[id].callbackName = callbackName;
                        for (const codeElement of callbackElement.children) {
                            const type = codeElement.tagName;
                            state.widgetCallbacks[id][type] =
                                codeElement.textContent;
                        }
                    }

                    // Update hierarchy
                    if (parentWidget) {
                        updateWidgetHierarchy(
                            widget,
                            parentWidget,
                            containerId,
                            tabId,
                        );
                    }

                    return { widget, type, id, parentId, containerId, tabId };
                }

                // First pass: create all widgets except tab/container children
                const rootWidgets = [];
                const childWidgets = [];

                widgetElements.forEach((widgetElement) => {
                    const parentId = widgetElement.getAttribute("parentId");
                    const containerId =
                        widgetElement.getAttribute("containerId");
                    const tabId = widgetElement.getAttribute("tabId");
                    const type = widgetElement.getAttribute("type");

                    if (parentId && (containerId || tabId)) {
                        // This is a child inside container or tab - save for second pass
                        childWidgets.push(widgetElement);
                    } else {
                        // This is a root widget or direct child of layout
                        const widgetInfo =
                            createWidgetFromElement(widgetElement);
                        const widget = widgetInfo.widget;

                        widgetMap.set(widgetInfo.id, {
                            widget: widget,
                            type: widgetInfo.type,
                            parentId: widgetInfo.parentId,
                            containerId: widgetInfo.containerId,
                            tabId: widgetInfo.tabId,
                        });

                        if (!parentId) {
                            rootWidgets.push(widget);
                        }
                    }
                });

                // Second pass: handle container and tab children
                childWidgets.forEach((widgetElement) => {
                    const parentId = widgetElement.getAttribute("parentId");
                    const containerId =
                        widgetElement.getAttribute("containerId");
                    const tabId = widgetElement.getAttribute("tabId");

                    const parentInfo = widgetMap.get(parentId);
                    if (!parentInfo) return;

                    const parentWidget = parentInfo.widget;
                    const parentType = parentInfo.type;

                    let targetContainer = null;

                    if (parentType === "Tabs" && tabId) {
                        // Find the tab content container
                        targetContainer = parentWidget.querySelector(
                            `.tab-content[data-tab-content="${tabId}"]`,
                        );
                    } else if (parentType === "Container" && containerId) {
                        // Find the container content
                        targetContainer = parentWidget.querySelector(
                            `.container-content[data-container-id="${containerId}"]`,
                        );
                    } else {
                        // Direct child of layout
                        targetContainer = parentWidget;
                    }

                    if (!targetContainer) return;

                    const widgetInfo = createWidgetFromElement(
                        widgetElement,
                        targetContainer,
                    );
                    const widget = widgetInfo.widget;

                    // Move widget to correct container
                    if (targetContainer !== parentWidget) {
                        // Remove from parent if it was added there by createWidget
                        if (widget.parentElement === parentWidget) {
                            parentWidget.removeChild(widget);
                        }
                        targetContainer.appendChild(widget);
                    }

                    widgetMap.set(widgetInfo.id, {
                        widget: widget,
                        type: widgetInfo.type,
                        parentId: widgetInfo.parentId,
                        containerId: widgetInfo.containerId,
                        tabId: widgetInfo.tabId,
                    });
                });

                // Update UI
                updateWidgetList();
                showEditor();

                document.getElementById("status-text").textContent =
                    "Project loaded from XML";
                setTimeout(() => {
                    document.getElementById("status-text").textContent =
                        "Ready";
                }, 2000);
            } catch (error) {
                console.error("Error loading XML:", error);
                document.getElementById("status-text").textContent =
                    "Error loading project";
                setTimeout(() => {
                    document.getElementById("status-text").textContent =
                        "Ready";
                }, 2000);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

export function setupEditors() {
    const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
        mode: "text/x-csrc",
        theme: "default",
        lineNumbers: true,
        lineWrapping: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete",
        },
    });
    const callbackEditor = CodeMirror.fromTextArea(
        document.getElementById("callback-editor"),
        {
            mode: "text/x-csrc",
            theme: "default",
            lineNumbers: true,
            lineWrapping: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete",
            },
        },
    );
    const uiXmlEditor = CodeMirror.fromTextArea(
        document.getElementById("ui-xml-editor"),
        {
            mode: "xml",
            theme: "default",
            lineNumbers: true,
            lineWrapping: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete",
            },
        },
    );
    CodeMirror.registerHelper("hint", "c", (cm) => {
        const cur = cm.getCursor();
        const token = cm.getTokenAt(cur);
        const keywords = [
            "int",
            "float",
            "char",
            "void",
            "bool",
            "if",
            "else",
            "while",
            "for",
            "return",
            "printf",
            "scanf",
            "#include",
            "#define",
            "struct",
            "typedef",
            "const",
            "static",
        ];
        const list = keywords.filter((word) => word.startsWith(token.string));
        return {
            list: list.length ? list : keywords,
            from: CodeMirror.Pos(cur.line, token.start),
            to: CodeMirror.Pos(cur.line, token.end),
        };
    });
    CodeMirror.registerHelper("hint", "xml", (cm) => {
        const cur = cm.getCursor();
        const token = cm.getTokenAt(cur);
        const tags = [
            "project",
            "window",
            "widgets",
            "widget",
            "callback",
            "children",
        ];
        const attributes = [
            "title",
            "width",
            "height",
            "x",
            "y",
            "type",
            "id",
            "minValue",
            "maxValue",
            "showHints",
            "relativePath",
            "dropsurfaceMessage",
            "dropdownOptions",
            "listOptions",
            "text",
            "name",
            "value",
            "label",
            "state",
            "isSidebar",
            "plotType",
            "version",
            "platform",
            "language",
            "debug_overlay",
            "cont_redraw",
            "is_visible",
            "is_resizable",
        ];
        const list = token.type === "tag" ? tags : attributes;
        const filtered = list.filter((item) => item.startsWith(token.string));
        return {
            list: filtered.length ? filtered : list,
            from: CodeMirror.Pos(cur.line, token.start),
            to: CodeMirror.Pos(cur.line, token.end),
        };
    });
    state.editor = editor;
    state.callbackEditor = callbackEditor;
    state.uiXmlEditor = uiXmlEditor;
    return { editor, callbackEditor, uiXmlEditor };
}

document.querySelectorAll(".document-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        document
            .querySelectorAll(".document-tab")
            .forEach((t) => t.classList.remove("active"));
        document
            .querySelectorAll(".tab-content")
            .forEach((c) => c.classList.remove("active"));
        tab.classList.add("active");
        document
            .getElementById(`${tab.dataset.tab}-tab`)
            .classList.add("active");
    });
});

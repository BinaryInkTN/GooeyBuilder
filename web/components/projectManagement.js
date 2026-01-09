import state from "./state.js";
import { updateWidgetList } from "./propertiesPanel.js";
import { showEditor } from "./uiHelpers.js";
import { createWidget } from "./widgetManagement.js";
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
    function saveWidget(widget, parentElement) {
        const widgetElement = xmlDoc.createElement("widget");
        widgetElement.setAttribute("type", widget.dataset.type);
        widgetElement.setAttribute("id", widget.dataset.id);
        widgetElement.setAttribute("x", widget.style.left || "0");
        widgetElement.setAttribute("y", widget.style.top || "0");
        widgetElement.setAttribute("width", widget.style.width);
        widgetElement.setAttribute("height", widget.style.height);
        switch (widget.dataset.type) {
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
                break;
            case "Plot":
                widgetElement.setAttribute(
                    "plotType",
                    widget.dataset.plotType || "line",
                );
                break;
        }
        if (
            widget.dataset.type !== "Slider" &&
            widget.dataset.type !== "Image" &&
            widget.dataset.type !== "DropSurface" &&
            widget.dataset.type !== "Canvas" &&
            widget.dataset.type !== "Plot" &&
            widget.dataset.type !== "Progressbar" &&
            widget.dataset.type !== "Meter"
        ) {
            widgetElement.setAttribute("text", widget.textContent || "");
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
        if (
            widget.dataset.type === "VerticalLayout" ||
            widget.dataset.type === "HorizontalLayout" ||
            widget.dataset.type === "Container"
        ) {
            const childrenElement = xmlDoc.createElement("children");
            widgetElement.appendChild(childrenElement);
            Array.from(widget.children).forEach((child) => {
                if (
                    child.classList.contains("widget") &&
                    !child.classList.contains("resize-handle")
                ) {
                    saveWidget(child, childrenElement);
                }
            });
        }
    }
    state.previewContent.querySelectorAll(".widget").forEach((widget) => {
        if (!widget.parentElement.classList.contains("layout")) {
            saveWidget(widget, widgetsElement);
        }
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
                state.previewContent.innerHTML = "";
                state.widgetCallbacks = {};
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
                if (widgetsElement) {
                    function loadWidget(widgetElement, parent = null) {
                        const type = widgetElement.getAttribute("type");
                        const x = parseInt(
                            widgetElement.getAttribute("x") || "0",
                        );
                        const y = parseInt(
                            widgetElement.getAttribute("y") || "0",
                        );
                        const width =
                            widgetElement.getAttribute("width") || "100px";
                        const height =
                            widgetElement.getAttribute("height") || "30px";
                        const widget = createWidget(type, x, y, parent);
                        widget.style.width = width;
                        widget.style.height = height;
                        switch (type) {
                            case "Slider":
                                widget.dataset.minValue =
                                    widgetElement.getAttribute("minValue") ||
                                    "0";
                                widget.dataset.maxValue =
                                    widgetElement.getAttribute("maxValue") ||
                                    "100";
                                widget.dataset.showHints =
                                    widgetElement.getAttribute("showHints") ||
                                    "false";
                                break;
                            case "Image":
                                widget.dataset.relativePath =
                                    widgetElement.getAttribute(
                                        "relativePath",
                                    ) || "./assets/example.png";
                                break;
                            case "DropSurface":
                                widget.dataset.dropsurfaceMessage =
                                    widgetElement.getAttribute(
                                        "dropsurfaceMessage",
                                    ) || "Drop files here..";
                                break;
                            case "Dropdown":
                                widget.dataset.dropdownOptions =
                                    widgetElement.getAttribute(
                                        "dropdownOptions",
                                    ) || "";
                                break;
                            case "List":
                                widget.dataset.listOptions =
                                    widgetElement.getAttribute("listOptions") ||
                                    "[]";
                                break;
                            case "Progressbar":
                                widget.dataset.value =
                                    widgetElement.getAttribute("value") || "50";
                                break;
                            case "Meter":
                                widget.dataset.value =
                                    widgetElement.getAttribute("value") || "50";
                                widget.dataset.label =
                                    widgetElement.getAttribute("label") ||
                                    "Meter";
                                break;
                            case "GSwitch":
                                widget.dataset.showHints =
                                    widgetElement.getAttribute("showHints") ||
                                    "false";
                                if (
                                    widgetElement.getAttribute("state") ===
                                    "true"
                                ) {
                                    widget.classList.add("checked");
                                }
                                break;
                            case "Tabs":
                                widget.dataset.isSidebar =
                                    widgetElement.getAttribute("isSidebar") ||
                                    "false";
                                break;
                            case "Plot":
                                widget.dataset.plotType =
                                    widgetElement.getAttribute("plotType") ||
                                    "line";
                                break;
                        }
                        if (
                            type !== "Slider" &&
                            type !== "Image" &&
                            type !== "DropSurface"
                        ) {
                            widget.textContent =
                                widgetElement.getAttribute("text") || "";
                        }
                        const callbackElement =
                            widgetElement.querySelector("callback");
                        if (callbackElement) {
                            const callbackName =
                                callbackElement.getAttribute("name") || "";
                            state.widgetCallbacks[
                                widget.dataset.id
                            ].callbackName = callbackName;
                            for (const codeElement of callbackElement.children) {
                                const type = codeElement.tagName;
                                state.widgetCallbacks[widget.dataset.id][type] =
                                    codeElement.textContent;
                            }
                        }
                        if (
                            type === "VerticalLayout" ||
                            type === "HorizontalLayout" ||
                            type === "Container"
                        ) {
                            const childrenElement =
                                widgetElement.querySelector("children");
                            if (childrenElement) {
                                childrenElement
                                    .querySelectorAll("widget")
                                    .forEach((childElement) => {
                                        loadWidget(childElement, widget);
                                    });
                            }
                        }
                        return widget;
                    }
                    widgetsElement
                        .querySelectorAll("widget")
                        .forEach((widgetElement) => {
                            loadWidget(widgetElement);
                        });
                }
                if (state.uiXmlEditor) {
                    state.uiXmlEditor.setValue(event.target.result);
                }
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

import state from "./state.js";
import { handleContainerTabDrop } from "./widgetManagement.js";
export function setupEditorDrag(codeEditor) {
    let isDraggingEditor = false;
    let editorDragOffsetX = 0;
    let editorDragOffsetY = 0;
    const codeEditorHeader = codeEditor.querySelector(".code-editor-header");
    codeEditorHeader.addEventListener("mousedown", (e) => {
        if (e.target.tagName === "BUTTON" || e.target.closest("button")) return;
        isDraggingEditor = true;
        const rect = codeEditor.getBoundingClientRect();
        editorDragOffsetX = e.clientX - rect.left;
        editorDragOffsetY = e.clientY - rect.top;
        document.addEventListener("mousemove", onEditorDragMove);
        document.addEventListener("mouseup", onEditorDragEnd);
    });
    function onEditorDragMove(e) {
        if (!isDraggingEditor) return;
        const container = document.querySelector(".workspace");
        const containerRect = container.getBoundingClientRect();
        const editorRect = codeEditor.getBoundingClientRect();
        let newX = e.clientX - editorDragOffsetX - containerRect.left;
        let newY = e.clientY - editorDragOffsetY - containerRect.top;
        newX = Math.max(
            0,
            Math.min(newX, containerRect.width - editorRect.width),
        );
        newY = Math.max(
            0,
            Math.min(newY, containerRect.height - editorRect.height),
        );
        codeEditor.style.left = newX + "px";
        codeEditor.style.top = newY + "px";
    }
    function onEditorDragEnd() {
        isDraggingEditor = false;
        document.removeEventListener("mousemove", onEditorDragMove);
        document.removeEventListener("mouseup", onEditorDragEnd);
    }
}
export function setupPreviewWindowDrag(previewWindow, previewTitleBar) {
    let isDraggingPreview = false;
    let previewDragOffsetX = 0;
    let previewDragOffsetY = 0;
    previewTitleBar.addEventListener("mousedown", (e) => {
        if (
            e.target.classList.contains("window-control") ||
            e.target.closest(".window-control")
        )
            return;
        isDraggingPreview = true;
        const rect = previewWindow.getBoundingClientRect();
        const workspaceRect = document
            .getElementById("workspace")
            .getBoundingClientRect();
        previewDragOffsetX = e.clientX - rect.left + workspaceRect.left;
        previewDragOffsetY = e.clientY - rect.top + workspaceRect.top;
        document.addEventListener("mousemove", onPreviewDragMove);
        document.addEventListener("mouseup", onPreviewDragEnd);
    });
    function onPreviewDragMove(e) {
        if (!isDraggingPreview) return;
        const workspace = document.getElementById("workspace");
        const workspaceRect = workspace.getBoundingClientRect();
        let newX = e.clientX - previewDragOffsetX;
        let newY = e.clientY - previewDragOffsetY;
        newX = Math.max(
            0,
            Math.min(newX, workspaceRect.width - previewWindow.offsetWidth),
        );
        newY = Math.max(
            0,
            Math.min(newY, workspaceRect.height - previewWindow.offsetHeight),
        );
        previewWindow.style.left = newX + "px";
        previewWindow.style.top = newY + "px";
        previewWindow.style.right = "auto";
        previewWindow.style.bottom = "auto";
    }
    function onPreviewDragEnd() {
        isDraggingPreview = false;
        document.removeEventListener("mousemove", onPreviewDragMove);
        document.removeEventListener("mouseup", onPreviewDragEnd);
    }
}
export function setupWidgetDrag(element) {
    element.addEventListener("mousedown", function (e) {
        if (e.button !== 0) return;
        if (e.target.classList.contains("resize-handle")) return;
        const clickedElement = e.target;
        const isControlButton =
            clickedElement.classList.contains("tab-add-btn") ||
            clickedElement.classList.contains("tab-remove-btn") ||
            clickedElement.classList.contains("container-add-btn") ||
            clickedElement.classList.contains("container-remove-btn") ||
            clickedElement.classList.contains("tab-controls") ||
            clickedElement.classList.contains("container-controls");
        const isTabOrContainerClick =
            clickedElement.classList.contains("tab-item") ||
            clickedElement.classList.contains("container-tab");
        if (isControlButton || isTabOrContainerClick) {
            return;
        }
        e.stopPropagation();
        state.draggedWidget = element;
        const previewContent =
            state.previewContent || document.querySelector(".preview-content");
        if (!previewContent) {
            console.error("Preview content not found");
            return;
        }
        const rect = element.getBoundingClientRect();
        const parentRect = element.parentElement.getBoundingClientRect();
        state.dragOffsetX = e.clientX - rect.left;
        state.dragOffsetY = e.clientY - rect.top;
        state.originalParent = element.parentElement;
        state.originalPosition = {
            left: element.style.left,
            top: element.style.top,
            position: element.style.position,
        };
        if (window.selectWidget) {
            window.selectWidget(element);
        }
        const containerContent = element.closest(".container-content");
        const tabContent = element.closest(".tab-content");
        if (
            element.dataset.type === "Container" ||
            element.dataset.type === "Tabs"
        ) {
        } else if (
            containerContent ||
            tabContent ||
            element.parentElement.classList.contains("layout")
        ) {
            element.style.position = "absolute";
            const previewRect = previewContent.getBoundingClientRect();
            element.style.left = rect.left - previewRect.left + "px";
            element.style.top = rect.top - previewRect.top + "px";
            previewContent.appendChild(element);
        }
        document.addEventListener("mousemove", onWidgetDragMove);
        document.addEventListener("mouseup", onWidgetDragEnd);
    });
}
function onWidgetDragMove(e) {
    e.preventDefault();

    if (
        !state.draggedWidget ||
        state.draggedWidget.classList.contains("widget-menu")
    ) {
        return;
    }

    const previewContent =
        state.previewContent || document.querySelector(".preview-content");
    if (!previewContent) return;
    const previewRect = previewContent.getBoundingClientRect();
    let newX = e.clientX - state.dragOffsetX - previewRect.left;
    let newY = e.clientY - state.dragOffsetY - previewRect.top;
    newX = Math.max(
        0,
        Math.min(newX, previewRect.width - state.draggedWidget.offsetWidth),
    );
    newY = Math.max(
        0,
        Math.min(newY, previewRect.height - state.draggedWidget.offsetHeight),
    );
    state.draggedWidget.style.left = newX + "px";
    state.draggedWidget.style.top = newY + "px";
    const containers = previewContent.querySelectorAll(".widget-container");
    const tabs = previewContent.querySelectorAll(".widget-tabs");
    containers.forEach((container) => {
        const activeContainer = container.querySelector(
            ".container-content.active",
        );
        if (activeContainer) activeContainer.classList.remove("drop-hover");
    });
    tabs.forEach((tab) => {
        const activeTab = tab.querySelector(".tab-content.active");
        if (activeTab) activeTab.classList.remove("drop-hover");
    });
    const draggedType = state.draggedWidget.dataset.type;
    if (draggedType !== "Container" && draggedType !== "Tabs") {
        containers.forEach((container) => {
            const activeContainer = container.querySelector(
                ".container-content.active",
            );
            if (activeContainer && activeContainer !== state.draggedWidget) {
                const rect = activeContainer.getBoundingClientRect();
                if (
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right &&
                    e.clientY >= rect.top &&
                    e.clientY <= rect.bottom
                ) {
                    activeContainer.classList.add("drop-hover");
                }
            }
        });
        tabs.forEach((tab) => {
            const activeTab = tab.querySelector(".tab-content.active");
            if (activeTab && activeTab !== state.draggedWidget) {
                const rect = activeTab.getBoundingClientRect();
                if (
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right &&
                    e.clientY >= rect.top &&
                    e.clientY <= rect.bottom
                ) {
                    activeTab.classList.add("drop-hover");
                }
            }
        });
    }
    if (window.updatePropertiesPanel) {
        window.updatePropertiesPanel();
    }
}
function onWidgetDragEnd(e) {
    if (
        !state.draggedWidget ||
        state.draggedWidget.classList.contains("widget-menu")
    )
        return;
    document.removeEventListener("mousemove", onWidgetDragMove);
    document.removeEventListener("mouseup", onWidgetDragEnd);
    const previewContent =
        state.previewContent || document.querySelector(".preview-content");
    if (!previewContent) return;
    previewContent.querySelectorAll(".drop-hover").forEach((el) => {
        el.classList.remove("drop-hover");
    });
    const draggedType = state.draggedWidget.dataset.type;
    if (draggedType !== "Container" && draggedType !== "Tabs") {
        const containers = previewContent.querySelectorAll(".widget-container");
        const tabs = previewContent.querySelectorAll(".widget-tabs");
        let droppedInZone = null;
        containers.forEach((container) => {
            const activeContainer = container.querySelector(
                ".container-content.active",
            );
            if (activeContainer && activeContainer !== state.draggedWidget) {
                const rect = activeContainer.getBoundingClientRect();
                if (
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right &&
                    e.clientY >= rect.top &&
                    e.clientY <= rect.bottom
                ) {
                    droppedInZone = activeContainer;
                }
            }
        });
        tabs.forEach((tab) => {
            const activeTab = tab.querySelector(".tab-content.active");
            if (activeTab && activeTab !== state.draggedWidget) {
                const rect = activeTab.getBoundingClientRect();
                if (
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right &&
                    e.clientY >= rect.top &&
                    e.clientY <= rect.bottom
                ) {
                    droppedInZone = activeTab;
                }
            }
        });
        if (droppedInZone) {
            const placeholder = droppedInZone.querySelector(
                ".tab-placeholder, .container-placeholder",
            );
            if (placeholder) {
                placeholder.remove();
            }
            const zoneRect = droppedInZone.getBoundingClientRect();
            const widgetRect = state.draggedWidget.getBoundingClientRect();
            const relativeX = widgetRect.left - zoneRect.left;
            const relativeY = widgetRect.top - zoneRect.top;
            state.draggedWidget.style.left = relativeX + "px";
            state.draggedWidget.style.top = relativeY + "px";
            state.draggedWidget.style.position = "absolute";
            droppedInZone.appendChild(state.draggedWidget);
            handleContainerTabDrop(state.draggedWidget, droppedInZone);
            if (window.updatePropertiesPanel) {
                window.updatePropertiesPanel();
            }
            state.draggedWidget = null;
            return;
        }
    }
    const layouts = previewContent.querySelectorAll(".layout");
    let droppedInLayout = null;
    layouts.forEach((layout) => {
        const rect = layout.getBoundingClientRect();
        if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
        ) {
            droppedInLayout = layout;
        }
    });
    if (droppedInLayout) {
        state.draggedWidget.style.position = "";
        state.draggedWidget.style.left = "";
        state.draggedWidget.style.top = "";
        const layoutRect = droppedInLayout.getBoundingClientRect();
        const widgetRect = state.draggedWidget.getBoundingClientRect();
        if (
            droppedInLayout.classList.contains("horizontal") ||
            droppedInLayout.classList.contains("vertical")
        ) {
            droppedInLayout.appendChild(state.draggedWidget);
        } else {
            const relativeX = widgetRect.left - layoutRect.left;
            const relativeY = widgetRect.top - layoutRect.top;
            state.draggedWidget.style.left = relativeX + "px";
            state.draggedWidget.style.top = relativeY + "px";
            state.draggedWidget.style.position = "absolute";
            droppedInLayout.appendChild(state.draggedWidget);
        }
        const placeholder = droppedInLayout.querySelector(
            ".layout-placeholder",
        );
        if (placeholder) {
            droppedInLayout.removeChild(placeholder);
        }
    } else {
        state.draggedWidget.style.position = "absolute";
    }
    if (draggedType !== "Container" && draggedType !== "Tabs") {
        const widgetId = state.draggedWidget.dataset.id;
        const hierarchy = state.widgetHierarchy.get(widgetId);
        if (
            hierarchy &&
            (hierarchy.containerId !== null || hierarchy.tabId !== null)
        ) {
            import("./hierarchyManager.js").then(
                ({ updateWidgetHierarchy }) => {
                    updateWidgetHierarchy(
                        state.draggedWidget,
                        null,
                        null,
                        null,
                    );
                },
            );
        }
    }
    state.draggedWidget = null;
    if (window.updatePropertiesPanel) {
        window.updatePropertiesPanel();
    }
}
export function setupChildWidgetDrag(element) {
    element.addEventListener("mousedown", function (e) {
        if (e.button !== 0) return;
        if (e.target.classList.contains("resize-handle")) return;
        if (
            e.target.classList.contains("tab-add-btn") ||
            e.target.classList.contains("tab-remove-btn") ||
            e.target.classList.contains("container-add-btn") ||
            e.target.classList.contains("container-remove-btn")
        ) {
            return;
        }
        e.stopPropagation();
        state.draggedWidget = element;
        const previewContent =
            state.previewContent || document.querySelector(".preview-content");
        if (!previewContent) {
            console.error("Preview content not found");
            return;
        }
        const rect = element.getBoundingClientRect();
        const parentRect = element.parentElement.getBoundingClientRect();
        state.dragOffsetX = e.clientX - rect.left;
        state.dragOffsetY = e.clientY - rect.top;
        state.originalParent = element.parentElement;
        state.originalPosition = {
            left: element.style.left,
            top: element.style.top,
            position: element.style.position,
        };
        if (window.selectWidget) {
            window.selectWidget(element);
        }
        document.addEventListener("mousemove", onChildWidgetDragMove);
        document.addEventListener("mouseup", onChildWidgetDragEnd);
    });
}
function onChildWidgetDragMove(e) {
    if (!state.draggedWidget) return;
    e.preventDefault();
    const parentContainer = state.draggedWidget.closest(
        ".container-content, .tab-content",
    );
    if (!parentContainer) {
        onWidgetDragMove(e);
        return;
    }
    const containerRect = parentContainer.getBoundingClientRect();
    let newX = e.clientX - state.dragOffsetX - containerRect.left;
    let newY = e.clientY - state.dragOffsetY - containerRect.top;
    newX = Math.max(
        0,
        Math.min(newX, containerRect.width - state.draggedWidget.offsetWidth),
    );
    newY = Math.max(
        0,
        Math.min(newY, containerRect.height - state.draggedWidget.offsetHeight),
    );
    state.draggedWidget.style.left = newX + "px";
    state.draggedWidget.style.top = newY + "px";
    state.draggedWidget.style.position = "absolute";
    if (window.updatePropertiesPanel) {
        window.updatePropertiesPanel();
    }
}
function onChildWidgetDragEnd(e) {
    if (!state.draggedWidget) return;
    document.removeEventListener("mousemove", onChildWidgetDragMove);
    document.removeEventListener("mouseup", onChildWidgetDragEnd);
    const parentContainer = state.draggedWidget.closest(
        ".container-content, .tab-content",
    );
    if (parentContainer) {
        const containerRect = parentContainer.getBoundingClientRect();
        if (
            e.clientX < containerRect.left - 10 ||
            e.clientX > containerRect.right + 10 ||
            e.clientY < containerRect.top - 10 ||
            e.clientY > containerRect.bottom + 10
        ) {
            const previewContent =
                state.previewContent ||
                document.querySelector(".preview-content");
            if (previewContent) {
                const previewRect = previewContent.getBoundingClientRect();
                const widgetRect = state.draggedWidget.getBoundingClientRect();
                state.draggedWidget.style.left =
                    widgetRect.left - previewRect.left + "px";
                state.draggedWidget.style.top =
                    widgetRect.top - previewRect.top + "px";
                previewContent.appendChild(state.draggedWidget);
                import("./hierarchyManager.js").then(
                    ({ updateWidgetHierarchy }) => {
                        updateWidgetHierarchy(
                            state.draggedWidget,
                            null,
                            null,
                            null,
                        );
                    },
                );
            }
        }
    }
    state.draggedWidget = null;
    if (window.updatePropertiesPanel) {
        window.updatePropertiesPanel();
    }
}

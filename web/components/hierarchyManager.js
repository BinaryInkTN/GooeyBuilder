import state from "./state.js";
export function updateWidgetHierarchy(
    widget,
    parentWidget = null,
    containerId = null,
    tabId = null,
) {
    const widgetId = widget.dataset.id;
    if (!parentWidget && !containerId && !tabId) {
        state.widgetHierarchy.delete(widgetId);
        return;
    }
    const hierarchyData = {
        parentId: parentWidget ? parentWidget.dataset.id : null,
        parentVar: parentWidget ? parentWidget.dataset.widgetVar : null,
        containerId: containerId,
        tabId: tabId,
        widgetVar:
            widget.dataset.widgetVar ||
            generateWidgetVarName(widget.dataset.type),
    };
    state.widgetHierarchy.set(widgetId, hierarchyData);
    widget.dataset.widgetVar = hierarchyData.widgetVar;
    state.widgetVarNames.set(widgetId, hierarchyData.widgetVar);
}
export function removeWidgetFromHierarchy(widgetId) {
    state.widgetHierarchy.delete(widgetId);
    state.widgetVarNames.delete(widgetId);
}
export function generateWidgetVarName(type) {
    state.widgetCounter++;
    let baseName = `${type.toLowerCase()}_${state.widgetCounter}`;
    let counter = 1;
    let varName = baseName;
    const allWidgets = document.querySelectorAll(".widget");
    while (
        Array.from(allWidgets).some((w) => w.dataset.widgetVar === varName)
    ) {
        varName = `${type.toLowerCase()}_${state.widgetCounter}_${counter++}`;
    }
    return varName;
}
export function getWidgetsInContainer(containerWidget, containerId) {
    const widgets = [];
    const containerContent = containerWidget.querySelector(
        `.container-content[data-container-id="${containerId}"]`,
    );
    if (containerContent) {
        containerContent.querySelectorAll(".widget").forEach((widget) => {
            widgets.push({
                widget: widget,
                widgetId: widget.dataset.id,
                widgetVar:
                    widget.dataset.widgetVar ||
                    generateWidgetVarName(widget.dataset.type),
            });
        });
    }
    return widgets;
}
export function getWidgetsInTab(tabWidget, tabId) {
    const widgets = [];
    const tabContent = tabWidget.querySelector(
        `.tab-content[data-tab-content="${tabId}"]`,
    );
    if (tabContent) {
        tabContent.querySelectorAll(".widget").forEach((widget) => {
            widgets.push({
                widget: widget,
                widgetId: widget.dataset.id,
                widgetVar:
                    widget.dataset.widgetVar ||
                    generateWidgetVarName(widget.dataset.type),
            });
        });
    }
    return widgets;
}
export function getWidgetParentInfo(widget) {
    const widgetId = widget.dataset.id;
    const hierarchy = state.widgetHierarchy.get(widgetId);
    if (!hierarchy) return null;
    return {
        parentId: hierarchy.parentId,
        parentVar: hierarchy.parentVar,
        containerId: hierarchy.containerId,
        tabId: hierarchy.tabId,
    };
}
export function getAllWidgetsInHierarchy() {
    const widgets = [];
    for (const [widgetId, hierarchy] of state.widgetHierarchy) {
        const widget = document.querySelector(`.widget[data-id="${widgetId}"]`);
        if (widget) {
            widgets.push({
                widget: widget,
                hierarchy: hierarchy,
            });
        }
    }
    return widgets;
}

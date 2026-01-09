import state from "./state.js";
import { setupWidgetDrag } from "./dragHandlers.js";
import {
    updateWidgetHierarchy,
    removeWidgetFromHierarchy,
    generateWidgetVarName,
} from "./hierarchyManager.js";
export function createWidget(
    type,
    x,
    y,
    parent = null,
    containerId = null,
    tabId = null,
) {
    let newWidget = document.createElement("div");
    newWidget.className = "widget";
    newWidget.dataset.type = type;
    newWidget.dataset.id =
        "widget_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    newWidget.style.left = x + "px";
    newWidget.style.top = y + "px";
    newWidget.style.position = "absolute";
    const widgetVarName = generateWidgetVarName(type);
    newWidget.dataset.widgetVar = widgetVarName;
    switch (type) {
        case "RadioButtonGroup":
            newWidget.className += " widget-radiobuttongrp";
            newWidget.textContent = "RadioButton Group";
            newWidget.style.width = "150px";
            newWidget.style.height = "100px";
            newWidget.dataset.radioOptions = "[]";
            break;
        case "Menu":
            newWidget.className += " widget-menu";
            newWidget.textContent = "Menu";
            newWidget.style.width = "100px";
            newWidget.style.height = "30px";
            break;
        case "Button":
            newWidget.className += " widget-button";
            newWidget.textContent = "Button";
            newWidget.style.width = "100px";
            newWidget.style.height = "30px";
            break;
        case "Input":
            newWidget.className += " widget-input";
            newWidget.textContent = "";
            newWidget.style.width = "150px";
            newWidget.style.height = "24px";
            break;
        case "Slider":
            newWidget.className += " widget-slider";
            newWidget.style.width = "150px";
            newWidget.style.height = "5px";
            newWidget.dataset.minValue = "0";
            newWidget.dataset.maxValue = "100";
            newWidget.dataset.showHints = "false";
            break;
        case "Checkbox":
            newWidget.className += " widget-checkbox";
            newWidget.style.width = "16px";
            newWidget.style.height = "16px";
            newWidget.addEventListener("click", function (e) {
                e.stopPropagation();
                this.classList.toggle("checked");
            });
            break;
        case "Label":
            newWidget.className += " widget-label";
            newWidget.textContent = "Label";
            newWidget.style.width = "100px";
            newWidget.style.height = "20px";
            break;
        case "Canvas":
            newWidget.className += " widget-canvas";
            newWidget.textContent = "Canvas";
            newWidget.style.width = "200px";
            newWidget.style.height = "150px";
            newWidget.dataset.bgColor = "#ffffff";
            newWidget.dataset.showGrid = "false";
            break;
        case "Image":
            newWidget.className += " widget-image";
            newWidget.textContent = "Image";
            newWidget.style.width = "150px";
            newWidget.style.height = "150px";
            newWidget.dataset.relativePath = "./assets/example.png";
            break;
        case "DropSurface":
            newWidget.className += " widget-dropsurface";
            newWidget.textContent = "Drop files here..";
            newWidget.style.width = "200px";
            newWidget.style.height = "150px";
            newWidget.dataset.dropsurfaceMessage = "Drop files here..";
            break;
        case "Dropdown":
            newWidget.className += " widget-dropdown";
            newWidget.style.width = "100px";
            newWidget.style.height = "30px";
            newWidget.textContent = "Dropdown";
            newWidget.dataset.dropdownOptions = "";
            break;
        case "List":
            newWidget.className += " widget-list";
            newWidget.style.display = "flex";
            newWidget.style.alignItems = "center";
            newWidget.style.justifyContent = "center";
            newWidget.style.width = "200px";
            newWidget.style.height = "200px";
            newWidget.textContent = "List";
            newWidget.dataset.listOptions = "[]";
            break;
        case "Progressbar":
            newWidget.className += " widget-progressbar";
            newWidget.style.width = "150px";
            newWidget.style.height = "10px";
            newWidget.innerHTML =
                '<div class="progress-fill" style="width: 50%;"></div>';
            newWidget.dataset.value = "50";
            break;
        case "Meter":
            newWidget.className += " widget-meter";
            newWidget.style.width = "100px";
            newWidget.style.height = "100px";
            newWidget.textContent = "Meter";
            newWidget.dataset.value = "50";
            newWidget.dataset.label = "Meter";
            break;
        case "GSwitch":
            newWidget.className += " widget-gswitch";
            newWidget.style.width = "40px";
            newWidget.style.height = "20px";
            newWidget.innerHTML = '<div class="switch-toggle"></div>';
            newWidget.addEventListener("click", function (e) {
                e.stopPropagation();
                this.classList.toggle("checked");
            });
            newWidget.dataset.showHints = "false";
            break;
        case "Tabs":
            newWidget.className += " widget-tabs";
            newWidget.style.width = "200px";
            newWidget.style.height = "150px";
            newWidget.innerHTML = `
                <div class="tab-header">
                    <div class="tab-item active" data-tab-id="0">Tab 1</div>
                    <div class="tab-item" data-tab-id="1">Tab 2</div>
                    <div class="tab-controls">
                        <button class="tab-add-btn" title="Add Tab">+</button>
                        <button class="tab-remove-btn" title="Remove Tab">-</button>
                    </div>
                </div>
                <div class="tab-contents">
                    <div class="tab-content active" data-tab-content="0">
                        <div class="tab-placeholder">Drop widgets here for Tab 1</div>
                    </div>
                    <div class="tab-content" data-tab-content="1">
                        <div class="tab-placeholder">Drop widgets here for Tab 2</div>
                    </div>
                </div>
            `;
            newWidget.dataset.isSidebar = "false";
            newWidget.dataset.tabCount = "2";
            newWidget.dataset.activeTab = "0";
            newWidget.dataset.tabNames = JSON.stringify(["Tab 1", "Tab 2"]);
            break;
        case "Container":
            newWidget.className += " widget-container";
            newWidget.style.width = "200px";
            newWidget.style.height = "200px";
            newWidget.style.position = "relative";
            newWidget.style.overflow = "hidden";
            newWidget.dataset.borderWidth = "1";
            newWidget.dataset.borderRadius = "4";
            newWidget.dataset.containerCount = "1";
            newWidget.dataset.activeContainer = "0";
            newWidget.dataset.containerNames = JSON.stringify(["Container 0"]);
            newWidget.innerHTML = `
                <div class="container-header">
                    <div class="container-controls">
                        <button class="container-add-btn" title="Add Container">+</button>
                        <button class="container-remove-btn" title="Remove Container">-</button>
                    </div>
                    <div class="container-tabs">
                        <div class="container-tab active" data-container-id="0">Container 0</div>
                    </div>
                </div>
                <div class="container-contents">
                    <div class="container-content active" data-container-id="0">
                        <div class="container-placeholder">Drop widgets here for Container 0</div>
                    </div>
                </div>
            `;
            break;
        case "Plot":
            newWidget.className += " widget-plot";
            newWidget.textContent = "Plot";
            newWidget.style.width = "200px";
            newWidget.style.height = "150px";
            newWidget.dataset.plotType = "line";
            newWidget.dataset.xAxisDataList = "1.0f,2.0f,3.0f";
            newWidget.dataset.yAxisDataList = "1.0f,2.0f,3.0f";
            newWidget.dataset.xAxisLabel = "X-Axis Label";
            newWidget.dataset.yAxisLabel = "Y-Axis Label";
            newWidget.dataset.plotTitle = "Plot Title";
            break;
        case "Overlay":
            newWidget.className += " widget-overlay";
            newWidget.textContent = "Overlay";
            newWidget.style.width = "200px";
            newWidget.style.height = "150px";
            newWidget.dataset.opacity = "70";
            break;
    }
    if (
        type === "VerticalLayout" ||
        type === "HorizontalLayout" ||
        type === "Container" ||
        type === "Canvas" ||
        type === "Plot" ||
        type === "Tabs"
    ) {
        const resizeHandle = document.createElement("div");
        resizeHandle.className = "resize-handle";
        newWidget.appendChild(resizeHandle);
        setupResizeHandle(resizeHandle, newWidget);
    }
    if (type === "Dropdown" && !state.isDropdownInit) {
        initializeDropdownListeners();
        state.isDropdownInit = true;
    }
    if (type === "List" && !state.isListInit) {
        initializeListListeners();
        state.isListInit = true;
    }
    if (type === "RadioButtonGroup" && !state.isRadioInit) {
        initializeRadioListeners();
        state.isRadioInit = true;
    }
    if (type === "Container" || type === "Tabs") {
        setupWidgetDrag(newWidget);
    } else {
        if (containerId !== null || tabId !== null) {
            setupChildWidgetDrag(newWidget);
        } else {
            setupWidgetDrag(newWidget);
        }
    }
    if (parent) {
        parent.appendChild(newWidget);
        if (parent.classList.contains("container-content")) {
            const containerId = parseInt(parent.dataset.containerId);
            const containerWidget = parent.closest(".widget-container");
            updateWidgetHierarchy(
                newWidget,
                containerWidget,
                containerId,
                null,
            );
            const placeholder = parent.querySelector(".container-placeholder");
            if (placeholder) {
                placeholder.remove();
            }
        } else if (parent.classList.contains("tab-content")) {
            const tabId = parseInt(parent.dataset.tabContent);
            const tabWidget = parent.closest(".widget-tabs");
            updateWidgetHierarchy(newWidget, tabWidget, null, tabId);
            const placeholder = parent.querySelector(".tab-placeholder");
            if (placeholder) {
                placeholder.remove();
            }
        } else if (parent.classList.contains("layout")) {
            const placeholder = parent.querySelector(".layout-placeholder");
            if (placeholder) {
                parent.removeChild(placeholder);
            }
            if (
                parent.classList.contains("horizontal") ||
                parent.classList.contains("vertical")
            ) {
                newWidget.style.position = "";
                newWidget.style.left = "";
                newWidget.style.top = "";
            }
        }
    } else {
        state.previewContent.appendChild(newWidget);
        updateWidgetHierarchy(newWidget, null, null, null);
    }
    setupWidgetDrag(newWidget);
    setupWidgetSelection(newWidget);
    if (window.selectWidget) {
        window.selectWidget(newWidget);
    }
    state.widgetCallbacks[newWidget.dataset.id] = {
        callbackName: "",
        button: "",
        slider: "",
        checkbox: "",
        input: "",
        dropdown: "",
        dropsurface: "",
        list: "",
        progressbar: "",
        meter: "",
        gswitch: "",
        tabs: "",
        container: "",
        overlay: "",
        plot: "",
        radiobutton: "",
        canvas: "",
    };
    if (window.updateWidgetList) {
        window.updateWidgetList();
    }
    if (window.updateProjectXML) {
        window.updateProjectXML();
    }
    state.widgetMacroNames.set(newWidget.dataset.id, "");

    return newWidget;
}
export function setupContainerTabsListeners(widget) {
    if (!widget) return;
    const type = widget.dataset.type;
    if (type === "Container") {
        const containerTabs = widget.querySelector(".container-tabs");
        if (containerTabs) {
            containerTabs.addEventListener("click", (e) => {
                if (e.target.classList.contains("container-tab")) {
                    const containerId = e.target.dataset.containerId;
                    setActiveContainer(widget, parseInt(containerId));
                }
            });
        }
        const addBtn = widget.querySelector(".container-add-btn");
        if (addBtn) {
            addBtn.addEventListener("click", () => {
                addContainer(widget);
            });
        }
        const removeBtn = widget.querySelector(".container-remove-btn");
        if (removeBtn) {
            removeBtn.addEventListener("click", () => {
                removeContainer(widget);
            });
        }
    }
    if (type === "Tabs") {
        const tabHeader = widget.querySelector(".tab-header");
        if (tabHeader) {
            tabHeader.addEventListener("click", (e) => {
                if (e.target.classList.contains("tab-item")) {
                    const tabId = e.target.dataset.tabId;
                    setActiveTab(widget, parseInt(tabId));
                }
            });
        }
        const tabAddBtn = widget.querySelector(".tab-add-btn");
        if (tabAddBtn) {
            tabAddBtn.addEventListener("click", () => {
                addTab(widget);
            });
        }
        const tabRemoveBtn = widget.querySelector(".tab-remove-btn");
        if (tabRemoveBtn) {
            tabRemoveBtn.addEventListener("click", () => {
                removeTab(widget);
            });
        }
    }
}
export function addContainer(containerWidget) {
    const containerCount = parseInt(containerWidget.dataset.containerCount);
    const containerNames = JSON.parse(
        containerWidget.dataset.containerNames || "[]",
    );
    const newContainerId = containerCount;
    containerWidget.dataset.containerCount = (containerCount + 1).toString();
    containerNames.push(`Container ${newContainerId}`);
    containerWidget.dataset.containerNames = JSON.stringify(containerNames);
    const containerTabs = containerWidget.querySelector(".container-tabs");
    const newTab = document.createElement("div");
    newTab.className = "container-tab";
    newTab.dataset.containerId = newContainerId;
    newTab.textContent = `Container ${newContainerId}`;
    containerTabs.appendChild(newTab);
    const containerContents = containerWidget.querySelector(
        ".container-contents",
    );
    const newContent = document.createElement("div");
    newContent.className = "container-content";
    newContent.dataset.containerId = newContainerId;
    newContent.innerHTML = `<div class="container-placeholder">Drop widgets here for Container ${newContainerId}</div>`;
    containerContents.appendChild(newContent);
    setActiveContainer(containerWidget, newContainerId);
    if (
        state.selectedWidget === containerWidget &&
        window.updatePropertiesPanel
    ) {
        window.updatePropertiesPanel();
    }
}
export function removeContainer(containerWidget) {
    const containerCount = parseInt(containerWidget.dataset.containerCount);
    if (containerCount <= 1) return;
    const containerNames = JSON.parse(
        containerWidget.dataset.containerNames || "[]",
    );
    const activeContainer = parseInt(containerWidget.dataset.activeContainer);
    containerWidget.dataset.containerCount = (containerCount - 1).toString();
    containerNames.splice(activeContainer, 1);
    containerWidget.dataset.containerNames = JSON.stringify(containerNames);
    const containerTab = containerWidget.querySelector(
        `.container-tab[data-container-id="${activeContainer}"]`,
    );
    if (containerTab) containerTab.remove();
    const containerContent = containerWidget.querySelector(
        `.container-content[data-container-id="${activeContainer}"]`,
    );
    if (containerContent) {
        const widgets = containerContent.querySelectorAll(".widget");
        widgets.forEach((widget) => {
            const rect = widget.getBoundingClientRect();
            const previewRect = state.previewContent.getBoundingClientRect();
            widget.style.left = rect.left - previewRect.left + "px";
            widget.style.top = rect.top - previewRect.top + "px";
            widget.style.position = "absolute";
            state.previewContent.appendChild(widget);
            updateWidgetHierarchy(widget, null, null, null);
        });
        containerContent.remove();
    }
    updateContainerIds(containerWidget);
    const newActive = Math.min(activeContainer, containerCount - 2);
    setActiveContainer(containerWidget, newActive);
    if (
        state.selectedWidget === containerWidget &&
        window.updatePropertiesPanel
    ) {
        window.updatePropertiesPanel();
    }
}
export function setActiveContainer(containerWidget, containerId) {
    containerWidget.dataset.activeContainer = containerId.toString();
    const containerTabs = containerWidget.querySelectorAll(".container-tab");
    containerTabs.forEach((tab) => {
        tab.classList.remove("active");
        if (parseInt(tab.dataset.containerId) === containerId) {
            tab.classList.add("active");
        }
    });
    const containerContents =
        containerWidget.querySelectorAll(".container-content");
    containerContents.forEach((content) => {
        content.classList.remove("active");
        if (parseInt(content.dataset.containerId) === containerId) {
            content.classList.add("active");
        }
    });
    if (
        state.selectedWidget === containerWidget &&
        window.updatePropertiesPanel
    ) {
        window.updatePropertiesPanel();
    }
}
function updateContainerIds(containerWidget) {
    const containerContents =
        containerWidget.querySelectorAll(".container-content");
    const containerTabs = containerWidget.querySelectorAll(".container-tab");
    const containerIds = Array.from(containerContents)
        .map((content) => parseInt(content.dataset.containerId))
        .sort((a, b) => a - b);
    containerIds.forEach((oldId, newId) => {
        const content = containerWidget.querySelector(
            `.container-content[data-container-id="${oldId}"]`,
        );
        const tab = containerWidget.querySelector(
            `.container-tab[data-container-id="${oldId}"]`,
        );
        if (content) {
            content.dataset.containerId = newId;
            const placeholder = content.querySelector(".container-placeholder");
            if (placeholder) {
                placeholder.textContent = `Drop widgets here for Container ${newId}`;
            }
        }
        if (tab) {
            tab.dataset.containerId = newId;
            tab.textContent = `Container ${newId}`;
        }
    });
}
export function addTab(tabWidget) {
    const tabCount = parseInt(tabWidget.dataset.tabCount);
    const tabNames = JSON.parse(tabWidget.dataset.tabNames || "[]");
    const newTabId = tabCount;
    tabWidget.dataset.tabCount = (tabCount + 1).toString();
    tabNames.push(`Tab ${newTabId + 1}`);
    tabWidget.dataset.tabNames = JSON.stringify(tabNames);
    const tabHeader = tabWidget.querySelector(".tab-header");
    const tabControls = tabHeader.querySelector(".tab-controls");
    const newTab = document.createElement("div");
    newTab.className = "tab-item";
    newTab.dataset.tabId = newTabId;
    newTab.textContent = `Tab ${newTabId + 1}`;
    tabHeader.insertBefore(newTab, tabControls);
    const tabContents = tabWidget.querySelector(".tab-contents");
    const newContent = document.createElement("div");
    newContent.className = "tab-content";
    newContent.dataset.tabContent = newTabId;
    newContent.innerHTML = `<div class="tab-placeholder">Drop widgets here for Tab ${newTabId + 1}</div>`;
    tabContents.appendChild(newContent);
    setActiveTab(tabWidget, newTabId);
    if (state.selectedWidget === tabWidget && window.updatePropertiesPanel) {
        window.updatePropertiesPanel();
    }
}
export function removeTab(tabWidget) {
    const tabCount = parseInt(tabWidget.dataset.tabCount);
    if (tabCount <= 1) return;
    const tabNames = JSON.parse(tabWidget.dataset.tabNames || "[]");
    const activeTab = parseInt(tabWidget.dataset.activeTab);
    tabWidget.dataset.tabCount = (tabCount - 1).toString();
    tabNames.splice(activeTab, 1);
    tabWidget.dataset.tabNames = JSON.stringify(tabNames);
    const tabItem = tabWidget.querySelector(
        `.tab-item[data-tab-id="${activeTab}"]`,
    );
    if (tabItem) tabItem.remove();
    const tabContent = tabWidget.querySelector(
        `.tab-content[data-tab-content="${activeTab}"]`,
    );
    if (tabContent) {
        const widgets = tabContent.querySelectorAll(".widget");
        widgets.forEach((widget) => {
            const rect = widget.getBoundingClientRect();
            const previewRect = state.previewContent.getBoundingClientRect();
            widget.style.left = rect.left - previewRect.left + "px";
            widget.style.top = rect.top - previewRect.top + "px";
            widget.style.position = "absolute";
            state.previewContent.appendChild(widget);
            updateWidgetHierarchy(widget, null, null, null);
        });
        tabContent.remove();
    }
    updateTabIds(tabWidget);
    const newActive = Math.min(activeTab, tabCount - 2);
    setActiveTab(tabWidget, newActive);
    if (state.selectedWidget === tabWidget && window.updatePropertiesPanel) {
        window.updatePropertiesPanel();
    }
}
export function setActiveTab(tabWidget, tabId) {
    tabWidget.dataset.activeTab = tabId.toString();
    const tabItems = tabWidget.querySelectorAll(".tab-item");
    tabItems.forEach((tab) => {
        tab.classList.remove("active");
        if (parseInt(tab.dataset.tabId) === tabId) {
            tab.classList.add("active");
        }
    });
    const tabContents = tabWidget.querySelectorAll(".tab-content");
    tabContents.forEach((content) => {
        content.classList.remove("active");
        if (parseInt(content.dataset.tabContent) === tabId) {
            content.classList.add("active");
        }
    });
    if (state.selectedWidget === tabWidget && window.updatePropertiesPanel) {
        window.updatePropertiesPanel();
    }
}
function updateTabIds(tabWidget) {
    const tabContents = tabWidget.querySelectorAll(".tab-content");
    const tabItems = tabWidget.querySelectorAll(".tab-item");
    const tabIds = Array.from(tabContents)
        .map((content) => parseInt(content.dataset.tabContent))
        .sort((a, b) => a - b);
    tabIds.forEach((oldId, newId) => {
        const content = tabWidget.querySelector(
            `.tab-content[data-tab-content="${oldId}"]`,
        );
        const tab = tabWidget.querySelector(
            `.tab-item[data-tab-id="${oldId}"]`,
        );
        if (content) {
            content.dataset.tabContent = newId;
            const placeholder = content.querySelector(".tab-placeholder");
            if (placeholder) {
                placeholder.textContent = `Drop widgets here for Tab ${newId + 1}`;
            }
        }
        if (tab) {
            tab.dataset.tabId = newId;
            tab.textContent = `Tab ${newId + 1}`;
        }
    });
}
function initializeDropdownListeners() {
    const dropdownOptionAddButton = document.getElementById(
        "dropdown-option-add-button",
    );
    if (dropdownOptionAddButton) {
        dropdownOptionAddButton.addEventListener(
            "click",
            function dropdownListener(e) {
                if (
                    !state.selectedWidget ||
                    state.selectedWidget.dataset.type !== "Dropdown"
                )
                    return;
                const optionInput = document.getElementById(
                    "dropdown-option-input",
                );
                const newItem = optionInput.value.trim();
                if (!newItem) return;
                let list = state.selectedWidget.dataset.dropdownOptions
                    ? state.selectedWidget.dataset.dropdownOptions
                          .split(",")
                          .filter((item) => item.trim())
                    : [];
                list.push(newItem);
                state.selectedWidget.dataset.dropdownOptions = list.join(",");
                const dropdownOptionsUL =
                    document.getElementById("dropdown-options");
                if (dropdownOptionsUL) {
                    dropdownOptionsUL.innerHTML = "";
                    list.forEach((item, idx) => {
                        dropdownOptionsUL.innerHTML +=
                            generateListItemForDropdownOptions(idx, item);
                    });
                }
                optionInput.value = "";
            },
        );
    }
}
function initializeListListeners() {
    const listOptionAddButton = document.getElementById(
        "list-option-add-button",
    );
    if (listOptionAddButton) {
        listOptionAddButton.addEventListener("click", function listListener(e) {
            if (
                !state.selectedWidget ||
                state.selectedWidget.dataset.type !== "List"
            )
                return;
            const listItemName = document
                .getElementById("list-option-input")
                .value.trim();
            const listItemDesc = document
                .getElementById("list-option-input-desc")
                .value.trim();
            if (!listItemName) return;
            let list = state.selectedWidget.dataset.listOptions
                ? JSON.parse(state.selectedWidget.dataset.listOptions)
                : [];
            const newItem = {
                name: listItemName,
                description: listItemDesc,
            };
            list.push(newItem);
            state.selectedWidget.dataset.listOptions = JSON.stringify(list);
            const listOptionsUL = document.getElementById("list-options");
            if (listOptionsUL) {
                listOptionsUL.innerHTML = "";
                list.forEach((item, idx) => {
                    listOptionsUL.innerHTML += generateListItemForListOptions(
                        idx,
                        item,
                    );
                });
            }
            document.getElementById("list-option-input").value = "";
            document.getElementById("list-option-input-desc").value = "";
        });
    }
}
function initializeRadioListeners() {
    const radioOptionAddButton = document.getElementById(
        "radiobutton-option-add-button",
    );
    if (radioOptionAddButton) {
        radioOptionAddButton.addEventListener(
            "click",
            function radioListener(e) {
                if (
                    !state.selectedWidget ||
                    state.selectedWidget.dataset.type !== "RadioButtonGroup"
                )
                    return;
                const optionInput = document.getElementById(
                    "radiobutton-option-input",
                );
                const newItem = optionInput.value.trim();
                if (!newItem) return;
                let options = state.selectedWidget.dataset.radioOptions
                    ? JSON.parse(state.selectedWidget.dataset.radioOptions)
                    : [];
                options.push(newItem);
                state.selectedWidget.dataset.radioOptions =
                    JSON.stringify(options);
                const radioOptionsUL = document.getElementById(
                    "radiobutton-options",
                );
                if (radioOptionsUL) {
                    radioOptionsUL.innerHTML = "";
                    options.forEach((item, idx) => {
                        radioOptionsUL.innerHTML +=
                            generateListItemForRadioOptions(idx, item);
                    });
                }
                optionInput.value = "";
            },
        );
    }
    const overlayOpacity = document.getElementById("overlay-opacity");
    if (overlayOpacity) {
        overlayOpacity.addEventListener("input", function (e) {
            document.getElementById("overlay-opacity-value").textContent =
                e.target.value + "%";
        });
    }
}
function generateListItemForListOptions(id, item) {
    return `<li class="option-item" id="list-option-${id}">
        <div class="option-content">
            <span class="option-name">${item.name}</span>
            <span class="option-desc">${item.description}</span>
        </div>
        <button class="button" onclick="deleteListOption(${id})">delete</button>
    </li>`;
}
function generateListItemForDropdownOptions(id, item) {
    return `<li class="option-item" id="dropdown-option-${id}">
        <span class="option-name">${item}</span>
        <button class="button" onclick="deleteDropdownOption(${id})">delete</button>
    </li>`;
}
function generateListItemForRadioOptions(id, item) {
    return `<li class="option-item" id="radiobutton-option-${id}">
        <span class="option-name">${item}</span>
        <button class="button" onclick="deleteRadioOption(${id})">delete</button>
    </li>`;
}
export function deleteListOption(id) {
    if (!state.selectedWidget || state.selectedWidget.dataset.type !== "List")
        return;
    let list = state.selectedWidget.dataset.listOptions
        ? JSON.parse(state.selectedWidget.dataset.listOptions)
        : [];
    if (id >= 0 && id < list.length) {
        list.splice(id, 1);
        state.selectedWidget.dataset.listOptions = JSON.stringify(list);
        let listOptionsUL = document.getElementById("list-options");
        if (listOptionsUL) {
            listOptionsUL.innerHTML = "";
            list.forEach((item, idx) => {
                listOptionsUL.innerHTML += generateListItemForListOptions(
                    idx,
                    item,
                );
            });
        }
    }
}
export function deleteDropdownOption(id) {
    if (
        !state.selectedWidget ||
        state.selectedWidget.dataset.type !== "Dropdown"
    )
        return;
    let list = state.selectedWidget.dataset.dropdownOptions
        ? state.selectedWidget.dataset.dropdownOptions
              .split(",")
              .filter((item) => item.trim())
        : [];
    if (id >= 0 && id < list.length) {
        list.splice(id, 1);
        state.selectedWidget.dataset.dropdownOptions = list.join(",");
        let dropdownOptionsUL = document.getElementById("dropdown-options");
        if (dropdownOptionsUL) {
            dropdownOptionsUL.innerHTML = "";
            list.forEach((item, idx) => {
                dropdownOptionsUL.innerHTML +=
                    generateListItemForDropdownOptions(idx, item);
            });
        }
    }
}
export function setupResizeHandle(handle, widget) {
    handle.addEventListener("mousedown", function (e) {
        e.stopPropagation();
        state.resizingWidget = widget;
        state.resizeStartWidth = widget.offsetWidth;
        state.resizeStartHeight = widget.offsetHeight;
        state.resizeStartX = e.clientX;
        state.resizeStartY = e.clientY;
        document.addEventListener("mousemove", onResizeMove);
        document.addEventListener("mouseup", onResizeEnd);
    });
}
function onResizeMove(e) {
    if (!state.resizingWidget) return;
    const width = state.resizeStartWidth + (e.clientX - state.resizeStartX);
    const height = state.resizeStartHeight + (e.clientY - state.resizeStartY);
    state.resizingWidget.style.width = Math.max(50, width) + "px";
    state.resizingWidget.style.height = Math.max(50, height) + "px";
    if (window.updatePropertiesPanel) {
        window.updatePropertiesPanel();
    }
}
function onResizeEnd() {
    state.resizingWidget = null;
    document.removeEventListener("mousemove", onResizeMove);
    document.removeEventListener("mouseup", onResizeEnd);
}
export function setupWidgetSelection(element) {
    element.addEventListener("click", function (e) {
        if (e.target.classList.contains("resize-handle")) return;
        if (
            e.target.classList.contains("tab-add-btn") ||
            e.target.classList.contains("tab-remove-btn") ||
            e.target.classList.contains("container-add-btn") ||
            e.target.classList.contains("container-remove-btn") ||
            e.target.classList.contains("tab-controls") ||
            e.target.classList.contains("container-controls")
        ) {
            return;
        }
        if (e.target.classList.contains("tab-item")) {
            const tabId = e.target.dataset.tabId;
            const tabWidget = e.target.closest(".widget-tabs");
            if (tabWidget && tabId !== undefined) {
                setActiveTab(tabWidget, parseInt(tabId));
            }
            return;
        }
        if (e.target.classList.contains("container-tab")) {
            const containerId = e.target.dataset.containerId;
            const containerWidget = e.target.closest(".widget-container");
            if (containerWidget && containerId !== undefined) {
                setActiveContainer(containerWidget, parseInt(containerId));
            }
            return;
        }
        e.stopPropagation();
        if (window.selectWidget) {
            window.selectWidget(element);
        }
    });
}
function updateProjectXML() {
    try {
        if (window.generateProjectXML && state.uiXmlEditor) {
            const xmlCode = window.generateProjectXML();
            state.uiXmlEditor.setValue(xmlCode);
        }
    } catch (error) {
        console.error("Error updating project XML:", error);
    }
}
export function handleContainerTabDrop(widget, dropZone) {
    if (dropZone.classList.contains("container-content")) {
        const containerId = parseInt(dropZone.dataset.containerId);
        const containerWidget = dropZone.closest(".widget-container");
        updateWidgetHierarchy(widget, containerWidget, containerId, null);
        widget.removeEventListener("mousedown", widget.__dragHandler);
        setupChildWidgetDrag(widget);
    } else if (dropZone.classList.contains("tab-content")) {
        const tabId = parseInt(dropZone.dataset.tabContent);
        const tabWidget = dropZone.closest(".widget-tabs");
        updateWidgetHierarchy(widget, tabWidget, null, tabId);
        widget.removeEventListener("mousedown", widget.__dragHandler);
        setupChildWidgetDrag(widget);
    }
}
window.deleteListOption = deleteListOption;
window.deleteDropdownOption = deleteDropdownOption;
window.generateListItemForDropdownOptions = generateListItemForDropdownOptions;
window.generateListItemForListOptions = generateListItemForListOptions;
window.generateListItemForRadioOptions = generateListItemForRadioOptions;
window.updateProjectXML = updateProjectXML;
window.addContainer = addContainer;
window.removeContainer = removeContainer;
window.setActiveContainer = setActiveContainer;
window.addTab = addTab;
window.removeTab = removeTab;
window.setActiveTab = setActiveTab;

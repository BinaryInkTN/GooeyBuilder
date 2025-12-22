import state from "./state.js";
import { setupWidgetDrag } from "./dragHandlers.js";

export function createWidget(type, x, y, parent = null) {
    let newWidget = document.createElement("div");
    newWidget.className = "widget";
    newWidget.dataset.type = type;
    newWidget.dataset.id = "widget_" + Date.now();

    newWidget.style.left = x + "px";
    newWidget.style.top = y + "px";
    newWidget.style.position = "absolute";

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
            newWidget.style.height = "24px";
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
            newWidget.innerHTML = '<div class="progress-fill" style="width: 50%;"></div>';
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
                    <div class="tab-item active">Tab 1</div>
                    <div class="tab-item">Tab 2</div>
                </div>
                <div class="tab-content">Tab 1 Content</div>
            `;
            newWidget.dataset.isSidebar = "false";
            break;

        case "VerticalLayout":
            newWidget.className += " layout vertical";
            newWidget.style.width = "200px";
            newWidget.style.height = "200px";
            newWidget.style.display = "flex";
            newWidget.style.flexDirection = "column";
            newWidget.style.alignItems = "stretch";
            const placeholderV = document.createElement("div");
            placeholderV.className = "layout-placeholder";
            placeholderV.textContent = "Drop widgets here";
            newWidget.appendChild(placeholderV);
            break;

        case "HorizontalLayout":
            newWidget.className += " layout horizontal";
            newWidget.style.width = "300px";
            newWidget.style.height = "100px";
            newWidget.style.display = "flex";
            newWidget.style.flexDirection = "row";
            newWidget.style.alignItems = "stretch";
            const placeholderH = document.createElement("div");
            placeholderH.className = "layout-placeholder";
            placeholderH.textContent = "Drop widgets here";
            newWidget.appendChild(placeholderH);
            break;

        case "Container":
            newWidget.className += " layout container";
            newWidget.style.width = "200px";
            newWidget.style.height = "200px";
            newWidget.style.position = "relative";
            newWidget.style.overflow = "hidden";
            newWidget.dataset.borderWidth = "1";
            newWidget.dataset.borderRadius = "4";
            const placeholderC = document.createElement("div");
            placeholderC.className = "layout-placeholder";
            placeholderC.textContent = "Drop widgets here";
            newWidget.appendChild(placeholderC);
            break;

        case "Plot":
            newWidget.className += " widget-plot";
            newWidget.textContent = "Plot";
            newWidget.style.width = "200px";
            newWidget.style.height = "150px";
            newWidget.dataset.plotType = "line";
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
        type === "Plot"
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

    if (parent) {
        parent.appendChild(newWidget);
        const placeholder = parent.querySelector(".layout-placeholder");
        if (placeholder) {
            parent.removeChild(placeholder);
        }

        if (parent.classList.contains("horizontal") || parent.classList.contains("vertical")) {
            newWidget.style.position = "";
            newWidget.style.left = "";
            newWidget.style.top = "";
        }
    } else {
        state.previewContent.appendChild(newWidget);
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
        canvas: ""
    };

    if (window.updateWidgetList) {
        window.updateWidgetList();
    }
    if (window.updateProjectXML) {
        window.updateProjectXML();
    }

    return newWidget;
}

function initializeDropdownListeners() {
    const dropdownOptionAddButton = document.getElementById("dropdown-option-add-button");
    if (dropdownOptionAddButton) {
        dropdownOptionAddButton.addEventListener("click", function dropdownListener(e) {
            if (!state.selectedWidget || state.selectedWidget.dataset.type !== "Dropdown") return;

            const optionInput = document.getElementById("dropdown-option-input");
            const newItem = optionInput.value.trim();

            if (!newItem) return;

            let list = state.selectedWidget.dataset.dropdownOptions ?
                state.selectedWidget.dataset.dropdownOptions.split(",").filter(item => item.trim()) : [];

            list.push(newItem);
            state.selectedWidget.dataset.dropdownOptions = list.join(",");

            const dropdownOptionsUL = document.getElementById("dropdown-options");
            if (dropdownOptionsUL) {
                dropdownOptionsUL.innerHTML = "";
                list.forEach((item, idx) => {
                    dropdownOptionsUL.innerHTML += generateListItemForDropdownOptions(idx, item);
                });
            }

            optionInput.value = "";
        });
    }
}

function initializeListListeners() {
    const listOptionAddButton = document.getElementById("list-option-add-button");
    if (listOptionAddButton) {
        listOptionAddButton.addEventListener("click", function listListener(e) {
            if (!state.selectedWidget || state.selectedWidget.dataset.type !== "List") return;

            const listItemName = document.getElementById("list-option-input").value.trim();
            const listItemDesc = document.getElementById("list-option-input-desc").value.trim();

            if (!listItemName) return;

            let list = state.selectedWidget.dataset.listOptions ?
                JSON.parse(state.selectedWidget.dataset.listOptions) : [];

            const newItem = {
                name: listItemName,
                description: listItemDesc
            };

            list.push(newItem);
            state.selectedWidget.dataset.listOptions = JSON.stringify(list);

            const listOptionsUL = document.getElementById("list-options");
            if (listOptionsUL) {
                listOptionsUL.innerHTML = "";
                list.forEach((item, idx) => {
                    listOptionsUL.innerHTML += generateListItemForListOptions(idx, item);
                });
            }

            document.getElementById("list-option-input").value = "";
            document.getElementById("list-option-input-desc").value = "";
        });
    }
}

function initializeRadioListeners() {
    const radioOptionAddButton = document.getElementById("radiobutton-option-add-button");
    if (radioOptionAddButton) {
        radioOptionAddButton.addEventListener("click", function radioListener(e) {
            if (!state.selectedWidget || state.selectedWidget.dataset.type !== "RadioButtonGroup") return;

            const optionInput = document.getElementById("radiobutton-option-input");
            const newItem = optionInput.value.trim();

            if (!newItem) return;

            let options = state.selectedWidget.dataset.radioOptions ?
                JSON.parse(state.selectedWidget.dataset.radioOptions) : [];

            options.push(newItem);
            state.selectedWidget.dataset.radioOptions = JSON.stringify(options);

            const radioOptionsUL = document.getElementById("radiobutton-options");
            if (radioOptionsUL) {
                radioOptionsUL.innerHTML = "";
                options.forEach((item, idx) => {
                    radioOptionsUL.innerHTML += generateListItemForRadioOptions(idx, item);
                });
            }

            optionInput.value = "";
        });
    }

    const overlayOpacity = document.getElementById("overlay-opacity");
    if (overlayOpacity) {
        overlayOpacity.addEventListener("input", function(e) {
            document.getElementById("overlay-opacity-value").textContent = e.target.value + "%";
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
    if (!state.selectedWidget || state.selectedWidget.dataset.type !== "List") return;

    let list = state.selectedWidget.dataset.listOptions ?
        JSON.parse(state.selectedWidget.dataset.listOptions) : [];

    if (id >= 0 && id < list.length) {
        list.splice(id, 1);
        state.selectedWidget.dataset.listOptions = JSON.stringify(list);

        let listOptionsUL = document.getElementById("list-options");
        if (listOptionsUL) {
            listOptionsUL.innerHTML = "";
            list.forEach((item, idx) => {
                listOptionsUL.innerHTML += generateListItemForListOptions(idx, item);
            });
        }
    }
}

export function deleteDropdownOption(id) {
    if (!state.selectedWidget || state.selectedWidget.dataset.type !== "Dropdown") return;

    let list = state.selectedWidget.dataset.dropdownOptions ?
        state.selectedWidget.dataset.dropdownOptions.split(",").filter(item => item.trim()) : [];

    if (id >= 0 && id < list.length) {
        list.splice(id, 1);
        state.selectedWidget.dataset.dropdownOptions = list.join(",");

        let dropdownOptionsUL = document.getElementById("dropdown-options");
        if (dropdownOptionsUL) {
            dropdownOptionsUL.innerHTML = "";
            list.forEach((item, idx) => {
                dropdownOptionsUL.innerHTML += generateListItemForDropdownOptions(idx, item);
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

window.deleteListOption = deleteListOption;
window.deleteDropdownOption = deleteDropdownOption;
window.generateListItemForDropdownOptions = generateListItemForDropdownOptions;
window.generateListItemForListOptions = generateListItemForListOptions;
window.generateListItemForRadioOptions = generateListItemForRadioOptions;
window.updateProjectXML = updateProjectXML;
import state from "./state.js";

export function updatePropertiesPanel() {
    if (!state.selectedWidget) return;

    const widgetType = state.selectedWidget.dataset.type;

    document.getElementById("prop-type").value = widgetType;
    document.getElementById("prop-x").value =
        parseInt(state.selectedWidget.style.left) || 0;
    document.getElementById("prop-y").value =
        parseInt(state.selectedWidget.style.top) || 0;
    document.getElementById("prop-width").value =
        parseInt(state.selectedWidget.style.width) || 100;
    document.getElementById("prop-height").value =
        parseInt(state.selectedWidget.style.height) || 30;

    const textInput = document.getElementById("prop-text");
    if (textInput) {
        if (
            widgetType !== "Slider" &&
            widgetType !== "Image" &&
            widgetType !== "DropSurface" &&
            widgetType !== "Canvas" &&
            widgetType !== "Plot" &&
            widgetType !== "Progressbar" &&
            widgetType !== "Meter" &&
            widgetType !== "Overlay" &&
            widgetType !== "Container" &&
            widgetType !== "Tabs"
        ) {
            textInput.value = state.selectedWidget.textContent || "";
            textInput.disabled = false;
        } else {
            textInput.value = "";
            textInput.disabled = true;
        }
    }

    const widgetId = state.selectedWidget.dataset.id;
    const callbackInput = document.getElementById("prop-callback");
    if (callbackInput && state.widgetCallbacks[widgetId]) {
        callbackInput.value =
            state.widgetCallbacks[widgetId].callbackName || "";
    }

    const specialSections = [
        "menu-properties",
        "slider-properties",
        "image-properties",
        "dropsurface-properties",
        "dropdown-properties",
        "list-properties",
        "progressbar-properties",
        "meter-properties",
        "switch-properties",
        "tabs-properties",
        "radiobutton-properties",
        "plot-properties",
        "canvas-properties",
        "container-properties",
        "overlay-properties",
    ];

    specialSections.forEach((sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) section.style.display = "none";
    });

    switch (widgetType) {
        case "Slider":
            showSection("slider-properties");
            document.getElementById("slider-min-value").value =
                state.selectedWidget.dataset.minValue || 0;
            document.getElementById("slider-max-value").value =
                state.selectedWidget.dataset.maxValue || 100;
            document.getElementById("slider-show-hints").value =
                state.selectedWidget.dataset.showHints || "false";
            break;

        case "Image":
            showSection("image-properties");
            document.getElementById("image-relative-path").value =
                state.selectedWidget.dataset.relativePath ||
                "./assets/example.png";
            break;

        case "DropSurface":
            showSection("dropsurface-properties");
            document.getElementById("dropsurface-message").value =
                state.selectedWidget.dataset.dropsurfaceMessage ||
                "Drop files here..";
            break;

        case "Dropdown":
            showSection("dropdown-properties");
            updateDropdownOptions();
            break;

        case "List":
            showSection("list-properties");
            updateListOptions();
            break;

        case "Progressbar":
            showSection("progressbar-properties");
            document.getElementById("progressbar-value").value =
                state.selectedWidget.dataset.value || 50;
            break;

        case "Meter":
            showSection("meter-properties");
            document.getElementById("meter-value").value =
                state.selectedWidget.dataset.value || 50;
            document.getElementById("meter-label").value =
                state.selectedWidget.dataset.label || "Meter";
            break;

        case "GSwitch":
            showSection("switch-properties");
            document.getElementById("switch-state").checked =
                state.selectedWidget.classList.contains("checked");
            document.getElementById("switch-show-hints").value =
                state.selectedWidget.dataset.showHints || "false";
            break;

        case "Tabs":
            showSection("tabs-properties");
            document.getElementById("tabs-is-sidebar").checked =
                state.selectedWidget.dataset.isSidebar === "true";

            // Add dynamic tab management
            const tabsContainer = document.getElementById("tabs-properties");
            if (tabsContainer) {
                let tabsManagementHTML = `
                    <h4>Tab Management</h4>
                    <div class="property-item">
                        <label>Current Tabs:</label>
                        <div id="current-tabs-list" style="margin: 10px 0; max-height: 150px; overflow-y: auto;">
                `;

                const tabNames = JSON.parse(
                    state.selectedWidget.dataset.tabNames ||
                        '["Tab 1", "Tab 2"]',
                );
                const activeTab = parseInt(
                    state.selectedWidget.dataset.activeTab || "0",
                );

                tabNames.forEach((name, index) => {
                    const isActive = index === activeTab;
                    tabsManagementHTML += `
                        <div class="tab-management-item ${isActive ? "active" : ""}" style="padding: 5px; border-bottom: 1px solid var(--border-color);">
                            <span>${name} ${isActive ? "(Active)" : ""}</span>
                            <div style="float: right;">
                                <button onclick="setActiveTab(document.querySelector('.widget.selected'), ${index})" style="font-size: 11px; padding: 2px 5px; margin-left: 5px;">Activate</button>
                            </div>
                        </div>
                    `;
                });

                tabsManagementHTML += `
                        </div>
                    </div>
                    <div class="property-actions" style="margin-top: 10px;">
                        <button onclick="addTab(document.querySelector('.widget.selected'))" class="button" style="font-size: 12px; padding: 5px 10px;">
                            <span class="material-icons" style="font-size: 14px;">add</span>
                            Add Tab
                        </button>
                        <button onclick="removeTab(document.querySelector('.widget.selected'))" class="button danger" style="font-size: 12px; padding: 5px 10px;">
                            <span class="material-icons" style="font-size: 14px;">remove</span>
                            Remove Tab
                        </button>
                    </div>
                `;

                const existingManagement = tabsContainer.querySelector(
                    ".tabs-management-section",
                );
                if (existingManagement) {
                    existingManagement.innerHTML = tabsManagementHTML;
                } else {
                    const managementSection = document.createElement("div");
                    managementSection.className = "tabs-management-section";
                    managementSection.innerHTML = tabsManagementHTML;
                    tabsContainer.appendChild(managementSection);
                }
            }
            break;

        case "RadioButtonGroup":
            showSection("radiobutton-properties");
            updateRadioButtonOptions();
            break;

        case "Plot":
            showSection("plot-properties");
            document.getElementById("plot-type").value =
                state.selectedWidget.dataset.plotType || "line";

            document.getElementById("x-axis-data-list").value =
                state.selectedWidget.dataset.xAxisDataList ||
                "1.0f, 2.0f, 3.0f";

            document.getElementById("y-axis-data-list").value =
                state.selectedWidget.dataset.yAxisDataList ||
                "1.0f, 2.0f, 3.0f";

            document.getElementById("x-axis-label").value =
                state.selectedWidget.dataset.xAxisLabel || "X-Axis Label";

            document.getElementById("y-axis-label").value =
                state.selectedWidget.dataset.yAxisLabel || "Y-Axis Label";

            document.getElementById("plot-title").value =
                state.selectedWidget.dataset.plotTitle || "Plot Title";
            break;

        case "Canvas":
            showSection("canvas-properties");
            document.getElementById("canvas-bg-color").value =
                state.selectedWidget.dataset.bgColor || "#ffffff";
            document.getElementById("canvas-show-grid").checked =
                state.selectedWidget.dataset.showGrid === "true";
            break;

        case "Container":
            showSection("container-properties");
            document.getElementById("container-border-width").value =
                state.selectedWidget.dataset.borderWidth || 1;
            document.getElementById("container-border-radius").value =
                state.selectedWidget.dataset.borderRadius || 4;

            // Add dynamic container management
            const containerContainer = document.getElementById(
                "container-properties",
            );
            if (containerContainer) {
                let containerManagementHTML = `
                    <h4>Container Management</h4>
                    <div class="property-item">
                        <label>Current Containers:</label>
                        <div id="current-containers-list" style="margin: 10px 0; max-height: 150px; overflow-y: auto;">
                `;

                const containerNames = JSON.parse(
                    state.selectedWidget.dataset.containerNames ||
                        '["Container 0"]',
                );
                const activeContainer = parseInt(
                    state.selectedWidget.dataset.activeContainer || "0",
                );

                containerNames.forEach((name, index) => {
                    const isActive = index === activeContainer;
                    containerManagementHTML += `
                        <div class="container-management-item ${isActive ? "active" : ""}" style="padding: 5px; border-bottom: 1px solid var(--border-color);">
                            <span>${name} ${isActive ? "(Active)" : ""}</span>
                            <div style="float: right;">
                                <button onclick="setActiveContainer(document.querySelector('.widget.selected'), ${index})" style="font-size: 11px; padding: 2px 5px; margin-left: 5px;">Activate</button>
                            </div>
                        </div>
                    `;
                });

                containerManagementHTML += `
                        </div>
                    </div>
                    <div class="property-actions" style="margin-top: 10px;">
                        <button onclick="addContainer(document.querySelector('.widget.selected'))" class="button" style="font-size: 12px; padding: 5px 10px;">
                            <span class="material-icons" style="font-size: 14px;">add</span>
                            Add Container
                        </button>
                        <button onclick="removeContainer(document.querySelector('.widget.selected'))" class="button danger" style="font-size: 12px; padding: 5px 10px;">
                            <span class="material-icons" style="font-size: 14px;">remove</span>
                            Remove Container
                        </button>
                    </div>
                `;

                const existingManagement = containerContainer.querySelector(
                    ".container-management-section",
                );
                if (existingManagement) {
                    existingManagement.innerHTML = containerManagementHTML;
                } else {
                    const managementSection = document.createElement("div");
                    managementSection.className =
                        "container-management-section";
                    managementSection.innerHTML = containerManagementHTML;
                    containerContainer.appendChild(managementSection);
                }
            }
            break;

        case "Overlay":
            showSection("overlay-properties");
            document.getElementById("overlay-opacity").value =
                state.selectedWidget.dataset.opacity || 70;
            document.getElementById("overlay-opacity-value").textContent =
                (state.selectedWidget.dataset.opacity || 70) + "%";
            break;
    }
}

function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) section.style.display = "block";
}

function updateDropdownOptions() {
    let dropdownOptions = state.selectedWidget.dataset.dropdownOptions
        ? state.selectedWidget.dataset.dropdownOptions
              .split(",")
              .filter((item) => item.trim())
        : [];
    let dropdownOptionsUL = document.getElementById("dropdown-options");

    if (dropdownOptionsUL) {
        dropdownOptionsUL.innerHTML = "";
        dropdownOptions.forEach((item, idx) => {
            dropdownOptionsUL.innerHTML += generateListItemForDropdownOptions(
                idx,
                item,
            );
        });
    }
}

function updateListOptions() {
    let listOptions = state.selectedWidget.dataset.listOptions
        ? JSON.parse(state.selectedWidget.dataset.listOptions)
        : [];
    let listOptionsUL = document.getElementById("list-options");

    if (listOptionsUL) {
        listOptionsUL.innerHTML = "";
        listOptions.forEach((item, idx) => {
            listOptionsUL.innerHTML += generateListItemForListOptions(
                idx,
                item,
            );
        });
    }
}

function updateRadioButtonOptions() {
    let radioOptions = state.selectedWidget.dataset.radioOptions
        ? JSON.parse(state.selectedWidget.dataset.radioOptions)
        : [];
    let radioOptionsUL = document.getElementById("radiobutton-options");

    if (radioOptionsUL) {
        radioOptionsUL.innerHTML = "";
        radioOptions.forEach((item, idx) => {
            radioOptionsUL.innerHTML += generateListItemForRadioOptions(
                idx,
                item,
            );
        });
    }
}

function generateListItemForListOptions(id, item) {
    return `<li class="option-item" id="list-option-${id}">
        <div class="option-content">
            <span class="option-name">${item.name || item}</span>
            <span class="option-desc">${item.description || ""}</span>
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

export function applyWidgetProperties() {
    if (!state.selectedWidget) return;

    const widgetType = state.selectedWidget.dataset.type;

    state.selectedWidget.style.left =
        document.getElementById("prop-x").value + "px";
    state.selectedWidget.style.top =
        document.getElementById("prop-y").value + "px";
    state.selectedWidget.style.width =
        document.getElementById("prop-width").value + "px";
    state.selectedWidget.style.height =
        document.getElementById("prop-height").value + "px";

    const textInput = document.getElementById("prop-text");
    if (textInput && !textInput.disabled) {
        state.selectedWidget.textContent = textInput.value;
    }

    const widgetId = state.selectedWidget.dataset.id;
    const callbackInput = document.getElementById("prop-callback");
    if (callbackInput && state.widgetCallbacks[widgetId]) {
        state.widgetCallbacks[widgetId].callbackName = callbackInput.value;
    }

    switch (widgetType) {
        case "Slider":
            state.selectedWidget.dataset.minValue =
                document.getElementById("slider-min-value").value;
            state.selectedWidget.dataset.maxValue =
                document.getElementById("slider-max-value").value;
            state.selectedWidget.dataset.showHints =
                document.getElementById("slider-show-hints").value;
            break;

        case "Image":
            const imagePath = document.getElementById(
                "image-relative-path",
            ).value;
            state.selectedWidget.dataset.relativePath = imagePath;
            state.selectedWidget.textContent = imagePath
                .split("/")
                .pop()
                .split("\\")
                .pop();
            break;

        case "DropSurface":
            const message = document.getElementById(
                "dropsurface-message",
            ).value;
            state.selectedWidget.dataset.dropsurfaceMessage = message;
            state.selectedWidget.textContent = message;
            break;

        case "Progressbar":
            const progressValue =
                document.getElementById("progressbar-value").value;
            state.selectedWidget.dataset.value = progressValue;
            const progressFill =
                state.selectedWidget.querySelector(".progress-fill");
            if (progressFill) {
                progressFill.style.width = `${Math.min(100, Math.max(0, progressValue))}%`;
            }
            break;

        case "Meter":
            state.selectedWidget.dataset.value =
                document.getElementById("meter-value").value;
            state.selectedWidget.dataset.label =
                document.getElementById("meter-label").value;
            break;

        case "GSwitch":
            state.selectedWidget.dataset.showHints =
                document.getElementById("switch-show-hints").value;
            const isChecked = document.getElementById("switch-state").checked;
            if (isChecked) {
                state.selectedWidget.classList.add("checked");
            } else {
                state.selectedWidget.classList.remove("checked");
            }
            break;

        case "Tabs":
            state.selectedWidget.dataset.isSidebar = document.getElementById(
                "tabs-is-sidebar",
            ).checked
                ? "true"
                : "false";
            break;

        case "Plot":
            state.selectedWidget.dataset.plotType =
                document.getElementById("plot-type").value;
            state.selectedWidget.dataset.xAxisDataList =
                document.getElementById("x-axis-data-list").value;
            state.selectedWidget.dataset.yAxisDataList =
                document.getElementById("y-axis-data-list").value;
            state.selectedWidget.dataset.xAxisLabel =
                document.getElementById("x-axis-label").value;
            state.selectedWidget.dataset.yAxisLabel =
                document.getElementById("y-axis-label").value;
            state.selectedWidget.dataset.plotTitle =
                document.getElementById("plot-title").value;
            break;

        case "Canvas":
            state.selectedWidget.dataset.bgColor =
                document.getElementById("canvas-bg-color").value;
            state.selectedWidget.dataset.showGrid = document.getElementById(
                "canvas-show-grid",
            ).checked
                ? "true"
                : "false";
            break;

        case "Container":
            const borderWidth = document.getElementById(
                "container-border-width",
            ).value;
            const borderRadius = document.getElementById(
                "container-border-radius",
            ).value;
            state.selectedWidget.dataset.borderWidth = borderWidth;
            state.selectedWidget.dataset.borderRadius = borderRadius;
            state.selectedWidget.style.borderWidth = borderWidth + "px";
            state.selectedWidget.style.borderRadius = borderRadius + "px";

            // Update container header if border width is 0
            const containerHeader =
                state.selectedWidget.querySelector(".container-header");
            if (containerHeader) {
                if (borderWidth === "0") {
                    containerHeader.style.display = "none";
                } else {
                    containerHeader.style.display = "block";
                }
            }
            break;

        case "Overlay":
            const opacity = document.getElementById("overlay-opacity").value;
            state.selectedWidget.dataset.opacity = opacity;
            document.getElementById("overlay-opacity-value").textContent =
                opacity + "%";
            break;
    }

    document.getElementById("status-text").textContent = "Properties updated";
    setTimeout(() => {
        document.getElementById("status-text").textContent = "Ready";
    }, 2000);

    updateWidgetList();
}

export function deleteSelectedWidget() {
    if (state.selectedWidget) {
        const widgetId = state.selectedWidget.dataset.id;

        if (state.widgetCallbacks[widgetId]) {
            delete state.widgetCallbacks[widgetId];
        }

        if (state.selectedWidget.classList.contains("layout")) {
            const children = Array.from(state.selectedWidget.children);
            children.forEach((child) => {
                if (
                    child.classList.contains("widget") &&
                    !child.classList.contains("resize-handle")
                ) {
                    const rect = child.getBoundingClientRect();
                    const previewRect =
                        state.previewContent.getBoundingClientRect();
                    child.style.left = rect.left - previewRect.left + "px";
                    child.style.top = rect.top - previewRect.top + "px";
                    child.style.position = "absolute";
                    state.previewContent.appendChild(child);
                }
            });
        }

        state.selectedWidget.remove();
        state.selectedWidget = null;

        document.getElementById("widget-properties").style.display = "none";
        document.getElementById("status-text").textContent = "Widget deleted";

        setTimeout(() => {
            document.getElementById("status-text").textContent = "Ready";
        }, 2000);

        updateWidgetList();
    }
}

export function applyWindowSettings() {
    const title = document.getElementById("win-title").value;
    const width = document.getElementById("win-width").value;
    const height = document.getElementById("win-height").value;

    state.previewTitleBar.querySelector(".preview-title-text").textContent =
        title;
    state.previewWindow.style.width = width + "px";
    state.previewWindow.style.height = height + "px";

    const window_hint_debug_overlay = document.getElementById(
        "window-debug-enable-overlay",
    ).checked;
    const window_hint_cont_redraw = document.getElementById(
        "window-debug-enable-cont-redraw",
    ).checked;
    const window_hint_is_visible = document.getElementById(
        "window-debug-is-visible",
    ).checked;
    const window_hint_is_resizable = document.getElementById(
        "window-debug-is-resizable",
    ).checked;

    state.previewWindow.dataset.debug_overlay =
        window_hint_debug_overlay.toString();
    state.previewWindow.dataset.cont_redraw =
        window_hint_cont_redraw.toString();
    state.previewWindow.dataset.is_visible = window_hint_is_visible.toString();
    state.previewWindow.dataset.is_resizable =
        window_hint_is_resizable.toString();

    document.getElementById("status-text").textContent =
        "Window settings updated";
    setTimeout(() => {
        document.getElementById("status-text").textContent = "Ready";
    }, 2000);
}

export function selectWidget(widget) {
    if (state.selectedWidget) {
        state.selectedWidget.classList.remove("selected");
    }

    state.selectedWidget = widget;
    widget.classList.add("selected");

    document.getElementById("window-properties").style.display = "none";
    document.getElementById("widget-properties").style.display = "block";

    updateCallbackSelector(widget.dataset.id);

    document.getElementById("status-text").textContent =
        `Selected: ${widget.dataset.type}`;
}

export function updateWidgetList() {
    const widgetList = document.getElementById("widget-list");
    if (!widgetList) return;

    widgetList.innerHTML = "";

    state.previewContent.querySelectorAll(".widget").forEach((widget) => {
        if (!widget.parentElement.classList.contains("layout")) {
            const widgetId = widget.dataset.id;
            const widgetType = widget.dataset.type;
            const widgetText = widget.textContent || widgetType;
            const callbackName =
                state.widgetCallbacks[widgetId]?.callbackName || "";

            const listItem = document.createElement("div");
            listItem.className = "widget-list-item";
            listItem.dataset.widgetId = widgetId;
            listItem.innerHTML = `
                <div><strong>${widgetType}</strong></div>
                <div>${widgetText.substring(0, 20)}${widgetText.length > 20 ? "..." : ""}</div>
                ${callbackName ? `<div style="color: var(--vs-accent);">${callbackName}</div>` : ""}
            `;

            listItem.addEventListener("click", function () {
                document
                    .querySelectorAll(".widget-list-item")
                    .forEach((item) => {
                        item.classList.remove("selected");
                    });
                this.classList.add("selected");
                state.currentEditingWidget = widgetId;
                updateCallbackSelector(widgetId);
            });

            widgetList.appendChild(listItem);
        }
    });
}

function updateCallbackSelector(widgetId) {
    const selector = document.getElementById("callback-selector");
    if (!selector) return;

    selector.innerHTML = '<option value="">Select a callback to edit</option>';

    if (!widgetId) return;

    const widget = document.querySelector(`.widget[data-id="${widgetId}"]`);
    if (!widget) return;

    const widgetType = widget.dataset.type;
    const callbacks = state.widgetCallbacks[widgetId] || {};

    switch (widgetType) {
        case "Button":
            selector.innerHTML += `<option value="button" ${callbacks.button ? "selected" : ""}>Button Click</option>`;
            break;
        case "Slider":
            selector.innerHTML += `<option value="slider" ${callbacks.slider ? "selected" : ""}>Slider Value Changed</option>`;
            break;
        case "Checkbox":
            selector.innerHTML += `<option value="checkbox" ${callbacks.checkbox ? "selected" : ""}>Checkbox Toggled</option>`;
            break;
        case "Input":
            selector.innerHTML += `<option value="input" ${callbacks.input ? "selected" : ""}>Input Changed</option>`;
            break;
        case "Image":
            selector.innerHTML += `<option value="image" ${callbacks.image ? "selected" : ""}>Image Click</option>`;
            break;
        case "Dropdown":
            selector.innerHTML += `<option value="dropdown" ${callbacks.dropdown ? "selected" : ""}>Dropdown Selected Index</option>`;
            break;
        case "DropSurface":
            selector.innerHTML += `<option value="dropsurface" ${callbacks.dropsurface ? "selected" : ""}>File Drop</option>`;
            break;
        case "List":
            selector.innerHTML += `<option value="list" ${callbacks.list ? "selected" : ""}>List Item Selected</option>`;
            break;
        case "GSwitch":
            selector.innerHTML += `<option value="switch" ${callbacks.gswitch ? "selected" : ""}>Switch Toggled</option>`;
            break;
        case "RadioButtonGroup":
            selector.innerHTML += `<option value="radiobutton" ${callbacks.radiobutton ? "selected" : ""}>Radio Button Selected</option>`;
            break;
        case "Canvas":
            selector.innerHTML += `<option value="canvas" ${callbacks.canvas ? "selected" : ""}>Canvas Click</option>`;
            break;
        case "Plot":
            selector.innerHTML += `<option value="plot" ${callbacks.plot ? "selected" : ""}>Plot Interaction</option>`;
            break;
        case "Tabs":
            selector.innerHTML += `<option value="tabs" ${callbacks.tabs ? "selected" : ""}>Tab Changed</option>`;
            break;
        case "Container":
            selector.innerHTML += `<option value="container" ${callbacks.container ? "selected" : ""}>Container Changed</option>`;
            break;
        default:
            selector.innerHTML +=
                '<option value="">No callbacks available for this widget type</option>';
    }
    selector.addEventListener("change", function () {
        const callbackType = this.value;
        if (!callbackType) {
            if (state.callbackEditor) {
                state.callbackEditor.setValue("");
            }
            return;
        }

        const callbackName =
            state.widgetCallbacks[widgetId]?.callbackName || "";
        if (callbackName) {
            let callbackSignature = "";

            switch (callbackType) {
                case "button":
                    callbackSignature = `void ${callbackName}(void* user_data) {\n    // Your code here\n}`;
                    break;
                case "slider":
                    callbackSignature = `void ${callbackName}(long value, void* user_data) {\n    // value contains the current slider position\n}`;
                    break;
                case "checkbox":
                    callbackSignature = `void ${callbackName}(bool checked, void* user_data) {\n    // checked is true if checkbox is checked\n}`;
                    break;
                case "input":
                    callbackSignature = `void ${callbackName}(char* text, void* user_data) {\n    // text contains the current input text\n}`;
                    break;
                case "image":
                    callbackSignature = `void ${callbackName}(void* user_data) {\n    // Your code here\n}`;
                    break;
                case "dropdown":
                    callbackSignature = `void ${callbackName}(int selected_index, void* user_data) {\n    // selected_index contains the index of the selected option\n}`;
                    break;
                case "dropsurface":
                    callbackSignature = `void ${callbackName}(char* mime, char* file_path, void* user_data) {\n    // mime: MIME type, file_path: path to dropped file\n}`;
                    break;
                case "list":
                    callbackSignature = `void ${callbackName}(int selected_index, void* user_data) {\n    // selected_index: Index of selected item\n}`;
                    break;
                case "switch":
                    callbackSignature = `void ${callbackName}(bool state, void* user_data) {\n    // state: true if switched on\n}`;
                    break;
                case "radiobutton":
                    callbackSignature = `void ${callbackName}(bool selected, void* user_data) {\n    // selected: true if this radio button is selected\n}`;
                    break;
                case "canvas":
                    callbackSignature = `void ${callbackName}(int x, int y, void* user_data) {\n    // x, y: coordinates of click on canvas\n}`;
                    break;
                case "tabs":
                    callbackSignature = `void ${callbackName}(int tab_index, void* user_data) {\n    // tab_index: Index of selected tab\n}`;
                    break;
                case "container":
                    callbackSignature = `void ${callbackName}(int container_index, void* user_data) {\n    // container_index: Index of selected container\n}`;
                    break;
            }

            if (state.widgetCallbacks[widgetId][`${callbackType}_code`]) {
                if (state.callbackEditor) {
                    state.callbackEditor.setValue(
                        state.widgetCallbacks[widgetId][`${callbackType}_code`],
                    );
                }
            } else if (state.callbackEditor) {
                state.callbackEditor.setValue(callbackSignature);
            }
        } else if (state.callbackEditor) {
            state.callbackEditor.setValue("");
        }
    });
    const saveCallbackBtn = document.getElementById("save-callback");
    if (saveCallbackBtn) {
        saveCallbackBtn.onclick = function () {
            if (!state.currentEditingWidget) return;

            const selector = document.getElementById("callback-selector");
            const callbackType = selector.value;
            if (!callbackType) return;

            if (state.callbackEditor) {
                const code = state.callbackEditor.getValue();
                if (!state.widgetCallbacks[state.currentEditingWidget]) {
                    state.widgetCallbacks[state.currentEditingWidget] = {};
                }

                state.widgetCallbacks[state.currentEditingWidget][
                    `${callbackType}_code`
                ] = code;

                document.getElementById("status-text").textContent =
                    "Callback saved";
                setTimeout(() => {
                    document.getElementById("status-text").textContent =
                        "Ready";
                }, 2000);
            }
        };
    }

    selector.dispatchEvent(new Event("change"));
}

window.deleteRadioOption = function (id) {
    if (
        !state.selectedWidget ||
        state.selectedWidget.dataset.type !== "RadioButtonGroup"
    )
        return;

    let options = state.selectedWidget.dataset.radioOptions
        ? JSON.parse(state.selectedWidget.dataset.radioOptions)
        : [];

    if (id >= 0 && id < options.length) {
        options.splice(id, 1);
        state.selectedWidget.dataset.radioOptions = JSON.stringify(options);
        updateRadioButtonOptions();
    }
};

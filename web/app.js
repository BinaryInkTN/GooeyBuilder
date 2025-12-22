import state from './components/state.js';
import nativeBridge from './components/nativeBridge.js';
import { setupEditors } from './components/editorSetup.js';
import { setupEditorDrag, setupPreviewWindowDrag, setupWidgetDrag } from './components/dragHandlers.js';
import { createWidget, setupWidgetSelection, deleteListOption, deleteDropdownOption } from './components/widgetManagement.js';
import { updatePropertiesPanel, updateWidgetList, applyWidgetProperties, selectWidget, deleteSelectedWidget, applyWindowSettings } from './components/propertiesPanel.js';
import { generateC } from './components/codeGeneration.js';
import { saveProjectToXML, loadProjectFromXML, generateProjectXML } from './components/projectManagement.js';
import { showEditor, showStartScreen, openDocs, showPlatformSelection } from './components/uiHelpers.js';

// Initialize the app
function init() {
    // Set up event listeners
    document.addEventListener("contextmenu", (event) => event.preventDefault());

    // Initialize editors
    const { editor, callbackEditor, uiXmlEditor } = setupEditors();
    state.editor = editor;
    state.callbackEditor = callbackEditor;
    state.uiXmlEditor = uiXmlEditor;

    // Set up drag handlers
    setupEditorDrag(document.getElementById("code-editor"));

    // Create preview window
    state.previewWindow = document.createElement("div");
    state.previewWindow.className = "preview-window";
    state.previewWindow.style.width = "800px";
    state.previewWindow.style.height = "600px";

    state.previewTitleBar = document.createElement("div");
    state.previewTitleBar.className = "preview-title-bar";
    state.previewTitleBar.innerHTML = `
        <div class="preview-title-text">My Window</div>
        <div class="window-controls">
            <div class="window-control"></div>
            <div class="window-control"></div>
            <div class="window-control"></div>
        </div>
    `;

    state.previewContent = document.createElement("div");
    state.previewContent.className = "preview-content";
    state.previewContent.id = "preview-content";

    state.previewWindow.appendChild(state.previewTitleBar);
    state.previewWindow.appendChild(state.previewContent);
    document.getElementById("designer-tab").appendChild(state.previewWindow);

    // Set up preview window drag
    setupPreviewWindowDrag(state.previewWindow, state.previewTitleBar);

    // Widget creation from toolbox
    document.querySelectorAll(".toolbox-item").forEach((item) => {
        item.addEventListener("click", function () {
            createWidget(this.dataset.type, 10, 10);
        });
    });

    // Set up event listeners for UI elements
    document.getElementById("export-button").addEventListener("click", async () => await generateC());
    document.getElementById("run-button").addEventListener("click", function () {
        document.getElementById("code-editor").style.display = "flex";
    });
    document.getElementById("close-code-editor").addEventListener("click", function () {
        document.getElementById("code-editor").style.display = "none";
    });
    document.getElementById("apply-window-settings").addEventListener("click", applyWindowSettings);
    document.getElementById("apply-widget-properties").addEventListener("click", applyWidgetProperties);
    document.getElementById("delete-widget").addEventListener("click", deleteSelectedWidget);
    document.getElementById("save-xml-button").addEventListener("click", saveProjectToXML);
    document.getElementById("load-xml-button").addEventListener("click", loadProjectFromXML);
    document.getElementById("start-screen-btn").addEventListener("click", showStartScreen);

    // Tab switching
    document.querySelectorAll(".document-tab").forEach((tab) => {
        tab.addEventListener("click", function () {
            const tabName = this.dataset.tab;

            document.querySelectorAll(".document-tab").forEach((t) => t.classList.remove("active"));
            this.classList.add("active");

            document.querySelectorAll(".tab-content").forEach((content) => {
                content.classList.remove("active");
            });

            document.getElementById(`${tabName}-tab`).classList.add("active");

            if (tabName === "code") {
                updateWidgetList();
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", function (e) {
        if (e.key === "Delete") {
            deleteSelectedWidget();
        }
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveProjectToXML();
        }
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            document.getElementById("export-button").click();
        }
    });

    // Click on preview content to deselect widgets
    state.previewContent.addEventListener("click", function (e) {
        if (e.target === this) {
            if (state.selectedWidget) {
                state.selectedWidget.classList.remove("selected");
                state.selectedWidget = null;
            }
            document.getElementById("widget-properties").style.display = "none";
            document.getElementById("window-properties").style.display = "block";
        }
    });

    // Project card event listeners
    const newProjectBtn = document.getElementById("new-project-btn");
    if (newProjectBtn) {
        newProjectBtn.addEventListener("click", () => {
            showPlatformSelection("c");
        });
    }

    // Settings panel toggle
    const settingsToggle = document.getElementById('advanced-settings-toggle');
    const settingsPanel = document.getElementById('advanced-settings-panel');
    const closeSettings = document.getElementById('close-settings-button');

    function toggleSettings() {
        settingsPanel.classList.toggle('visible');
    }

    if (settingsToggle) {
        settingsToggle.addEventListener('click', toggleSettings);
    }
    if (closeSettings) {
        closeSettings.addEventListener('click', toggleSettings);
    }

    // Initialize status text
    document.getElementById("status-text").textContent = "Ready";

    // Initialize theme
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = prefersDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", initialTheme);
    
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.querySelector(".material-icons").textContent =
            initialTheme === "dark" ? "light_mode" : "dark_mode";
            
        themeToggle.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            themeToggle.querySelector(".material-icons").textContent =
                newTheme === "dark" ? "light_mode" : "dark_mode";
        });
    }
}

// Make functions globally available for HTML onclick handlers
window.deleteListOption = deleteListOption;
window.deleteDropdownOption = deleteDropdownOption;
window.showPlatformSelection = function(language = "c") {
    showPlatformSelection(language);
};

window.openDocs = function() {
    openDocs().catch(error => {
        console.error("Failed to open docs:", error);
        window.open("https://gooeyui.github.io/GooeyGUI/quickstart.html", "_blank");
    });
};

window.selectWidget = selectWidget;
window.updatePropertiesPanel = updatePropertiesPanel;
window.updateWidgetList = updateWidgetList;
window.generateProjectXML = generateProjectXML;

// Start the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
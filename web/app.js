import state from "./components/state.js";
import { setupEditors } from "./components/editorSetup.js";
import {
    setupEditorDrag,
    setupPreviewWindowDrag,
    setupWidgetDrag,
} from "./components/dragHandlers.js";
import {
    createWidget,
    setupWidgetSelection,
    deleteListOption,
    deleteDropdownOption,
} from "./components/widgetManagement.js";
import {
    updatePropertiesPanel,
    updateWidgetList,
    applyWidgetProperties,
    selectWidget,
    deleteSelectedWidget,
    applyWindowSettings,
} from "./components/propertiesPanel.js";
import { generateC } from "./components/codeGeneration.js";
import {
    saveProjectToXML,
    loadProjectFromXML,
    generateProjectXML,
} from "./components/projectManagement.js";
import {
    showEditor,
    showStartScreen,
    openDocs,
    showPlatformSelection,
} from "./components/uiHelpers.js";

// Replace Eel-based console output with Electron-based
export function jsConsoleOutput(outputData) {
    try {
        if (outputData) {
            if (window.terminalConsole && window.terminalConsole.addLine) {
                window.terminalConsole.addLine(outputData, "stdout");
            } else {
                console.log("Output:", outputData);
            }
        }
    } catch (error) {
        console.error("Error in jsConsoleOutput:", error);
    }
}

export const createTerminalConsoleManager = () => {
    const terminalState = {
        isConsoleVisible: false,
        isCollapsed: false,
        isRunning: false,
        currentProcessId: null,
        consolePanel: document.getElementById("console-panel"),
        consoleContent: document.getElementById("console-content"),
        consoleStatus: document.getElementById("console-status"),
        consoleRunBtn: document.getElementById("console-run"),
        consoleStopBtn: document.getElementById("console-stop"),
        consoleClearBtn: document.getElementById("console-clear"),
        consoleToggleBtn: document.getElementById("console-toggle"),
        toolbarConsoleBtn: document.getElementById("toolbar-console-toggle"),
        titlebarConsoleBtn: document.getElementById("titlebar-console-btn"),
    };

    const addLine = (text, type = "stdout") => {
        if (!terminalState.consoleContent) return;

        const line = document.createElement("div");
        line.className = `console-line ${type}`;
        line.textContent = text;

        terminalState.consoleContent.appendChild(line);
        terminalState.consoleContent.scrollTop =
            terminalState.consoleContent.scrollHeight;

        if (
            (type === "stderr" || type === "error") &&
            !terminalState.isConsoleVisible
        ) {
            toggle();
        }
    };

    const clear = () => {
        if (terminalState.consoleContent) {
            terminalState.consoleContent.innerHTML = "";
            addLine("Console cleared.", "system");
        }
    };

    const updateToggleIcon = () => {
        if (!terminalState.consoleToggleBtn) return;

        const icon =
            terminalState.consoleToggleBtn.querySelector(".material-icons");
        if (icon) {
            icon.textContent = terminalState.isCollapsed
                ? "keyboard_arrow_up"
                : "keyboard_arrow_down";
        }
    };

    const updateStatus = (status) => {
        if (!terminalState.consoleStatus) return;

        const indicator =
            terminalState.consoleStatus.querySelector(".status-indicator");
        const text = terminalState.consoleStatus.querySelector(".status-text");

        if (indicator) {
            indicator.className = "status-indicator " + status;
        }
        if (text) {
            text.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }

        if (terminalState.consoleRunBtn && terminalState.consoleStopBtn) {
            if (status === "running") {
                terminalState.consoleRunBtn.disabled = true;
                terminalState.consoleStopBtn.disabled = false;
                terminalState.isRunning = true;
            } else {
                terminalState.consoleRunBtn.disabled = false;
                terminalState.consoleStopBtn.disabled = true;
                terminalState.isRunning = false;
            }
        }
    };

    const toggle = () => {
        terminalState.isConsoleVisible = !terminalState.isConsoleVisible;

        if (terminalState.isConsoleVisible) {
            terminalState.consolePanel.classList.add("active");
            terminalState.toolbarConsoleBtn?.classList.add("active");
            terminalState.titlebarConsoleBtn?.classList.add("active");
            terminalState.isCollapsed = false;
            terminalState.consolePanel.classList.remove("collapsed");

            setTimeout(() => {
                terminalState.consoleContent.scrollTop =
                    terminalState.consoleContent.scrollHeight;
            }, 100);
        } else {
            terminalState.consolePanel.classList.remove("active");
            terminalState.toolbarConsoleBtn?.classList.remove("active");
            terminalState.titlebarConsoleBtn?.classList.remove("active");
        }

        updateToggleIcon();
    };

    const toggleCollapse = () => {
        terminalState.isCollapsed = !terminalState.isCollapsed;

        if (terminalState.isCollapsed) {
            terminalState.consolePanel.classList.add("collapsed");
        } else {
            terminalState.consolePanel.classList.remove("collapsed");
        }

        updateToggleIcon();
    };

    const runProgram = async () => {
        try {
            updateStatus("running");

            addLine("=== Generating C code ===", "system");
            const cCode = await generateC();

            if (!cCode || !cCode.trim()) {
                addLine("Error: Failed to generate C code", "stderr");
                updateStatus("error");
                setTimeout(() => updateStatus("idle"), 3000);
                return;
            }

            addLine("C code generated", "system");

            if (window.electronAPI) {
                addLine("Executing C code", "system");

                const result = await window.electronAPI.executeCCode(cCode);

                if (result.success) {
                    if (result.output) {
                        addLine(result.output, "stdout");
                    }
                    addLine("Program execution completed", "system");
                } else {
                    if (result.error) {
                        addLine(`Error: ${result.error}`, "stderr");
                    }
                    if (result.output) {
                        addLine(result.output, "stdout");
                    }
                    updateStatus("error");
                    setTimeout(() => updateStatus("idle"), 3000);
                }
            } else {
                // Fallback for web version
                addLine(
                    "Web version: Simulating program execution...",
                    "system",
                );
                simulateProgramOutput();
            }

            setTimeout(() => {
                if (terminalState.isRunning) {
                    updateStatus("idle");
                }
            }, 500);
        } catch (error) {
            addLine(`Error: ${error.message}`, "stderr");
            updateStatus("error");
            setTimeout(() => updateStatus("idle"), 3000);
        }
    };

    const stopProgram = async () => {
        if (!terminalState.isRunning || !terminalState.currentProcessId) return;

        addLine("=== Stopping program ===", "system");
        addLine(
            "Note: Program termination not implemented in Electron version",
            "system",
        );

        updateStatus("stopped");
        terminalState.currentProcessId = null;

        setTimeout(() => {
            updateStatus("idle");
        }, 2000);
    };

    const simulateProgramOutput = () => {
        const outputs = [
            "Initializing application...",
            "Window created: 800x600",
            "Starting main loop...",
            "Application running successfully",
            "Press Ctrl+C to exit",
            "Program exited with code 0",
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index < outputs.length) {
                const type = index === outputs.length - 1 ? "exit" : "stdout";
                addLine(outputs[index], type);
                index++;
            } else {
                clearInterval(interval);
                updateStatus("idle");
            }
        }, 800);
    };

    const setupEventListeners = () => {
        if (terminalState.consoleRunBtn) {
            terminalState.consoleRunBtn.addEventListener("click", runProgram);
        }

        if (terminalState.consoleStopBtn) {
            terminalState.consoleStopBtn.addEventListener("click", stopProgram);
        }

        if (terminalState.consoleClearBtn) {
            terminalState.consoleClearBtn.addEventListener("click", clear);
        }

        if (terminalState.consoleToggleBtn) {
            terminalState.consoleToggleBtn.addEventListener(
                "click",
                toggleCollapse,
            );
        }

        if (terminalState.toolbarConsoleBtn) {
            terminalState.toolbarConsoleBtn.addEventListener("click", toggle);
        }

        if (terminalState.titlebarConsoleBtn) {
            terminalState.titlebarConsoleBtn.addEventListener("click", toggle);
        }

        document.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === "`") {
                e.preventDefault();
                toggle();
            }
            if (
                e.ctrlKey &&
                e.key === "Enter" &&
                terminalState.isConsoleVisible
            ) {
                e.preventDefault();
                runProgram();
            }
            if (e.ctrlKey && e.key === "c" && terminalState.isRunning) {
                e.preventDefault();
                stopProgram();
            }
        });
    };

    const init = () => {
        setupEventListeners();
        updateStatus("idle");
        updateToggleIcon();
    };

    return {
        init,
        toggle,
        addLine,
        clear,
        runProgram,
        stopProgram,
    };
};

// Setup window controls
function setupWindowControls() {
    const minimizeBtn = document.getElementById("minimize-btn");
    const maximizeBtn = document.getElementById("maximize-btn");
    const closeBtn = document.getElementById("close-btn");

    if (minimizeBtn && window.electronAPI) {
        minimizeBtn.addEventListener("click", () => {
            window.electronAPI.minimizeWindow();
        });
    }

    if (maximizeBtn && window.electronAPI) {
        maximizeBtn.addEventListener("click", () => {
            window.electronAPI.maximizeWindow();
            // Update maximize button icon
            updateMaximizeButton();
        });
    }

    if (closeBtn && window.electronAPI) {
        closeBtn.addEventListener("click", () => {
            window.electronAPI.closeWindow();
        });
    }

    // Initial update of maximize button
    updateMaximizeButton();

    // Listen for window state changes
    if (window.electronAPI) {
        window.electronAPI.getWindowState().then((state) => {
            updateMaximizeButton(state.isMaximized);
        });
    }
}

function updateMaximizeButton(isMaximized) {
    const maximizeBtn = document.getElementById("maximize-btn");
    if (!maximizeBtn) return;

    const icon = maximizeBtn.querySelector("span");
    if (icon) {
        icon.textContent = isMaximized ? "❐" : "□";
        maximizeBtn.title = isMaximized ? "Restore" : "Maximize";
    }
}

// Setup menu handlers
function setupMenuHandlers() {
    if (!window.electronAPI) return;

    // Listen for menu events from main process
    window.electronAPI.onMenuEvent((event) => {
        switch (event) {
            case "new-project":
                showPlatformSelection();
                break;
            case "open-project":
                loadProjectFromXML();
                break;
            case "save-project":
            case "save-project-as":
                saveProjectToXML();
                break;
            case "export-c-code":
                exportCCode();
                break;
        }
    });

    // Setup local menu handlers
    const menuHandlers = [
        "menu-new-project",
        "menu-open-project",
        "menu-save-project",
        "menu-save-project-as",
        "menu-export-c-code",
        "edit-undo",
        "edit-redo",
        "edit-cut",
        "edit-copy",
        "edit-paste",
        "edit-delete",
        "view-toggle-console",
        "view-toggle-theme",
        "view-zoom-in",
        "view-zoom-out",
        "view-reset-zoom",
        "build-generate-code",
        "build-run-project",
        "build-stop-project",
        "help-about",
    ];

    menuHandlers.forEach((handlerId) => {
        const element = document.getElementById(handlerId);
        if (element) {
            element.addEventListener("click", (e) => {
                e.preventDefault();
                handleMenuAction(handlerId);
            });
        }
    });
}

function handleMenuAction(actionId) {
    switch (actionId) {
        case "menu-new-project":
            showPlatformSelection();
            break;
        case "menu-open-project":
            loadProjectFromXML();
            break;
        case "menu-save-project":
        case "menu-save-project-as":
            saveProjectToXML();
            break;
        case "menu-export-c-code":
            exportCCode();
            break;
        case "edit-undo":
            // Implement undo
            break;
        case "edit-redo":
            // Implement redo
            break;
        case "edit-cut":
            document.execCommand("cut");
            break;
        case "edit-copy":
            document.execCommand("copy");
            break;
        case "edit-paste":
            document.execCommand("paste");
            break;
        case "edit-delete":
            deleteSelectedWidget();
            break;
        case "view-toggle-console":
            if (window.terminalConsole) window.terminalConsole.toggle();
            break;
        case "view-toggle-theme":
            toggleTheme();
            break;
        case "view-zoom-in":
            document.body.style.zoom =
                parseFloat(document.body.style.zoom || 1) + 0.1;
            break;
        case "view-zoom-out":
            document.body.style.zoom =
                parseFloat(document.body.style.zoom || 1) - 0.1;
            break;
        case "view-reset-zoom":
            document.body.style.zoom = 1;
            break;
        case "build-generate-code":
            generateC();
            break;
        case "build-run-project":
            if (window.terminalConsole) window.terminalConsole.runProgram();
            break;
        case "build-stop-project":
            if (window.terminalConsole) window.terminalConsole.stopProgram();
            break;
        case "help-about":
            showAboutDialog();
            break;
    }
}

async function exportCCode() {
    try {
        const cCode = await generateC();

        if (!cCode || !cCode.trim()) {
            alert("Failed to generate C code");
            return;
        }

        if (window.electronAPI) {
            const result = await window.electronAPI.saveCCode(cCode);
            if (result.success) {
                window.terminalConsole.addLine(
                    `C code exported to: ${result.filePath}`,
                    "system",
                );
            } else {
                window.terminalConsole.addLine(
                    `Export failed: ${result.error}`,
                    "stderr",
                );
            }
        } else {
            // Web version fallback
            const blob = new Blob([cCode], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "main.c";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            window.terminalConsole.addLine("C code downloaded", "system");
        }
    } catch (error) {
        window.terminalConsole.addLine(
            `Export error: ${error.message}`,
            "stderr",
        );
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);

    // Update Monaco editors
    if (state.editor) {
        state.editor.updateOptions({
            theme: newTheme === "dark" ? "vs-dark" : "vs-light",
        });
    }
    if (state.callbackEditor) {
        state.callbackEditor.updateOptions({
            theme: newTheme === "dark" ? "vs-dark" : "vs-light",
        });
    }
    if (state.uiXmlEditor) {
        state.uiXmlEditor.updateOptions({
            theme: newTheme === "dark" ? "vs-dark" : "vs-light",
        });
    }

    // Update theme toggle button
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.querySelector(".material-icons").textContent =
            newTheme === "dark" ? "light_mode" : "dark_mode";
    }

    window.terminalConsole.addLine(
        `Theme changed to ${newTheme} mode`,
        "system",
    );
}

function showAboutDialog() {
    alert(
        "GUIIDE Beta\nVersion 1.0.0\n\nBuild stunning applications with ease.\nCreate, design, and deploy across platforms.",
    );
}

function init() {
    document.addEventListener("contextmenu", (event) => event.preventDefault());

    // Initialize terminal console
    window.terminalConsole = createTerminalConsoleManager();
    window.terminalConsole.init();

    // Setup Electron window controls
    setupWindowControls();

    // Setup menu handlers
    setupMenuHandlers();

    // Initialize editors
    const { editor, callbackEditor, uiXmlEditor } = setupEditors();
    state.editor = editor;
    state.callbackEditor = callbackEditor;
    state.uiXmlEditor = uiXmlEditor;

    // Setup UI components
    setupEditorDrag(document.getElementById("code-editor"));

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

    setupPreviewWindowDrag(state.previewWindow, state.previewTitleBar);

    // Setup toolbox
    document.querySelectorAll(".toolbox-item").forEach((item) => {
        item.addEventListener("click", function () {
            createWidget(this.dataset.type, 10, 10);
        });
    });

    // Setup button handlers
    document
        .getElementById("close-code-editor")
        .addEventListener("click", function () {
            document.getElementById("code-editor").style.display = "none";
        });

    document
        .getElementById("apply-window-settings")
        .addEventListener("click", applyWindowSettings);

    document
        .getElementById("apply-widget-properties")
        .addEventListener("click", applyWidgetProperties);

    document
        .getElementById("delete-widget")
        .addEventListener("click", deleteSelectedWidget);

    document.getElementById("save-xml-button").addEventListener("click", () => {
        saveProjectToXML();
    });

    document.getElementById("load-xml-button").addEventListener("click", () => {
        loadProjectFromXML();
    });

    document
        .getElementById("start-screen-btn")
        .addEventListener("click", () => {
            window.terminalConsole.close();
            showStartScreen();
        });

    // Setup titlebar buttons
    document
        .getElementById("titlebar-home-btn")
        .addEventListener("click", () => {
            showStartScreen();
        });

    document
        .getElementById("titlebar-save-btn")
        .addEventListener("click", () => {
            saveProjectToXML();
        });

    // Setup tabs
    document.querySelectorAll(".document-tab").forEach((tab) => {
        tab.addEventListener("click", function () {
            const tabName = this.dataset.tab;

            document
                .querySelectorAll(".document-tab")
                .forEach((t) => t.classList.remove("active"));
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
        if (e.ctrlKey && e.key === "s") {
            e.preventDefault();
            saveProjectToXML();
        }
        if (e.ctrlKey && e.key === "e") {
            e.preventDefault();
            exportCCode();
        }
    });

    // Widget selection
    state.previewContent.addEventListener("click", function (e) {
        if (e.target === this) {
            if (state.selectedWidget) {
                state.selectedWidget.classList.remove("selected");
                state.selectedWidget = null;
            }
            document.getElementById("widget-properties").style.display = "none";
            document.getElementById("window-properties").style.display =
                "block";
        }
    });

    // Theme initialization
    const initialTheme = "dark";
    document.documentElement.setAttribute("data-theme", initialTheme);

    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.querySelector(".material-icons").textContent =
            initialTheme === "dark" ? "light_mode" : "dark_mode";

        themeToggle.addEventListener("click", toggleTheme);
    }

    // Initialize status
    document.getElementById("status-text").textContent = "Ready";
}

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
    if (window.electronAPI) {
        window.electronAPI.removeMenuListeners();
    }
});

// Export functions to window
window.deleteListOption = deleteListOption;
window.deleteDropdownOption = deleteDropdownOption;
window.showPlatformSelection = function (language = "c") {
    showPlatformSelection(language);
};

window.openDocs = function () {
    openDocs().catch((error) => {
        console.error("Failed to open docs:", error);
        window.open(
            "https://gooeyui.github.io/GooeyGUI/quickstart.html",
            "_blank",
        );
    });
};

window.selectWidget = selectWidget;
window.updatePropertiesPanel = updatePropertiesPanel;
window.updateWidgetList = updateWidgetList;
window.generateProjectXML = generateProjectXML;

// Initialize app
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

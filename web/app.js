import state from "./components/state.js";
import nativeBridge from "./components/nativeBridge.js";
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

export function jsConsoleOutput(outputData) {
    try {
        if (outputData) {
            if (window.terminalConsole && window.terminalConsole.addLine) {
                window.terminalConsole.addLine(outputData, "stdout");
            } else {
                console.log("Python output:", outputData);
            }
        }
    } catch (error) {
        console.error("Error in jsConsoleOutput:", error);
    }
}
eel.expose(jsConsoleOutput);
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
            terminalState.isCollapsed = false;
            terminalState.consolePanel.classList.remove("collapsed");

            setTimeout(() => {
                terminalState.consoleContent.scrollTop =
                    terminalState.consoleContent.scrollHeight;
            }, 100);
        } else {
            terminalState.consolePanel.classList.remove("active");
            terminalState.toolbarConsoleBtn?.classList.remove("active");
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

    const exposeToPython = () => {
        if (window.eel) {
            eel.frontend_ready();
        }
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

            addLine("✓ C code generated", "system");

            if (window.eel) {
                terminalState.currentProcessId = Date.now().toString();

                const result = await new Promise((resolve) => {
                    eel.execute_app(cCode)((response) => {
                        resolve(response);
                    });
                });

                if (result.success) {
                    addLine("Program execution completed", "system");
                } else {
                    addLine(
                        `Error: ${result.error || "Failed to execute program"}`,
                        "stderr",
                    );
                    updateStatus("error");
                    setTimeout(() => updateStatus("idle"), 3000);
                }
            } else {
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

        if (window.eel && terminalState.currentProcessId) {
            const stopped = await new Promise((resolve) => {
                eel.stop_program(terminalState.currentProcessId)((result) => {
                    resolve(result);
                });
            });

            if (stopped) {
                addLine("Program stopped successfully", "system");
            } else {
                addLine(
                    "Note: Program cannot be stopped in this version",
                    "system",
                );
            }
        } else {
            addLine("Program stopped", "system");
        }

        updateStatus("stopped");
        terminalState.currentProcessId = null;

        setTimeout(() => {
            updateStatus("idle");
        }, 2000);
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
        exposeToPython();
        updateStatus("idle");
        updateToggleIcon();
        addLine(
            'Terminal ready. Click "Run" to execute your program.',
            "system",
        );
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

function init() {
    document.addEventListener("contextmenu", (event) => event.preventDefault());

    window.terminalConsole = createTerminalConsoleManager();
    window.terminalConsole.init();

    const { editor, callbackEditor, uiXmlEditor } = setupEditors();
    state.editor = editor;
    state.callbackEditor = callbackEditor;
    state.uiXmlEditor = uiXmlEditor;

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

    document.querySelectorAll(".toolbox-item").forEach((item) => {
        item.addEventListener("click", function () {
            createWidget(this.dataset.type, 10, 10);
        });
    });

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
        window.terminalConsole.addLine("Project saved successfully", "system");
    });

    document.getElementById("load-xml-button").addEventListener("click", () => {
        loadProjectFromXML();
        window.terminalConsole.addLine("Project loaded successfully", "system");
    });

    document
        .getElementById("start-screen-btn")
        .addEventListener("click", () => {
            showStartScreen();
            window.terminalConsole.addLine(
                "Returned to start screen",
                "system",
            );
        });

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

    document.addEventListener("keydown", function (e) {
        if (e.key === "Delete") {
            deleteSelectedWidget();
        }
        if (e.ctrlKey && e.key === "s") {
            e.preventDefault();
            saveProjectToXML();
            window.terminalConsole.addLine("Project saved (Ctrl+S)", "system");
        }
        if (e.ctrlKey && e.key === "e") {
            e.preventDefault();
            document.getElementById("export-button").click();
        }
    });

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

    const newProjectBtn = document.getElementById("new-project-btn");
    if (newProjectBtn) {
        newProjectBtn.addEventListener("click", () => {
            showPlatformSelection("c");
        });
    }

    const settingsToggle = document.getElementById("advanced-settings-toggle");
    const settingsPanel = document.getElementById("advanced-settings-panel");
    const closeSettings = document.getElementById("close-settings-button");

    function toggleSettings() {
        settingsPanel.classList.toggle("visible");
    }

    if (settingsToggle) {
        settingsToggle.addEventListener("click", toggleSettings);
    }
    if (closeSettings) {
        closeSettings.addEventListener("click", toggleSettings);
    }

    document.getElementById("status-text").textContent = "Ready";

    const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
    ).matches;
    const initialTheme = prefersDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", initialTheme);

    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.querySelector(".material-icons").textContent =
            initialTheme === "dark" ? "light_mode" : "dark_mode";

        themeToggle.addEventListener("click", () => {
            const currentTheme =
                document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            themeToggle.querySelector(".material-icons").textContent =
                newTheme === "dark" ? "light_mode" : "dark_mode";
            window.terminalConsole.addLine(
                `Theme changed to ${newTheme} mode`,
                "system",
            );
        });
    }
}

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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

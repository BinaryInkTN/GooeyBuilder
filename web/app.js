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
        if (
            window.document.getElementById("start-screen").style.display !==
            "none"
        )
            return;
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

            updateMaximizeButton();
        });
    }

    if (closeBtn && window.electronAPI) {
        closeBtn.addEventListener("click", () => {
            window.electronAPI.closeWindow();
        });
    }

    updateMaximizeButton();

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

function setupMenuHandlers() {
    if (!window.electronAPI) return;

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
            break;
        case "edit-redo":
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
        "GUIIDE Beta\nVersion 1.0.0\n\n A POS but still certainly more stable than any of the STMicroelectronics IDEs.",
    );
}

class CommandPalette {
    constructor() {
        this.palette = document.getElementById("command-palette");
        this.overlay = document.createElement("div");
        this.overlay.className = "command-palette-overlay";
        document.body.appendChild(this.overlay);

        this.input = document.getElementById("command-palette-input");
        this.content = document.getElementById("command-palette-content");

        this.commands = [];
        this.filteredCommands = [];
        this.selectedIndex = 0;

        this.initCommands();
        this.setupEventListeners();
    }

    initCommands() {
        this.commands = [
            {
                id: "new-project",
                title: "Create New Project",
                description: "Start a new project from scratch",
                icon: "add_circle",
                category: "File",
                shortcut: "Ctrl+N",
                action: () => showPlatformSelection(),
            },
            {
                id: "open-project",
                title: "Open Project",
                description: "Open an existing project file",
                icon: "folder_open",
                category: "File",
                shortcut: "Ctrl+O",
                action: () => loadProjectFromXML(),
            },
            {
                id: "save-project",
                title: "Save Project",
                description: "Save the current project",
                icon: "save",
                category: "File",
                shortcut: "Ctrl+S",
                action: () => saveProjectToXML(),
            },
            {
                id: "save-project-as",
                title: "Save Project As...",
                description: "Save the current project with a new name",
                icon: "save_as",
                category: "File",
                action: () => saveProjectToXML(true),
            },
            {
                id: "export-c-code",
                title: "Export C Code",
                description:
                    "Generate and export C code for the current project",
                icon: "download",
                category: "File",
                shortcut: "Ctrl+E",
                action: () => exportCCode(),
            },

            {
                id: "undo",
                title: "Undo",
                description: "Undo the last action",
                icon: "undo",
                category: "Edit",
                shortcut: "Ctrl+Z",
                action: () => console.log("Undo"),
            },
            {
                id: "redo",
                title: "Redo",
                description: "Redo the last undone action",
                icon: "redo",
                category: "Edit",
                shortcut: "Ctrl+Shift+Z",
                action: () => console.log("Redo"),
            },
            {
                id: "cut",
                title: "Cut",
                description: "Cut selected content to clipboard",
                icon: "content_cut",
                category: "Edit",
                shortcut: "Ctrl+X",
                action: () => document.execCommand("cut"),
            },
            {
                id: "copy",
                title: "Copy",
                description: "Copy selected content to clipboard",
                icon: "content_copy",
                category: "Edit",
                shortcut: "Ctrl+C",
                action: () => document.execCommand("copy"),
            },
            {
                id: "paste",
                title: "Paste",
                description: "Paste content from clipboard",
                icon: "content_paste",
                category: "Edit",
                shortcut: "Ctrl+V",
                action: () => document.execCommand("paste"),
            },
            {
                id: "delete",
                title: "Delete",
                description: "Delete selected widget",
                icon: "delete",
                category: "Edit",
                shortcut: "Delete",
                action: () => deleteSelectedWidget(),
            },

            {
                id: "toggle-console",
                title: "Toggle Console",
                description: "Show or hide the debug console",
                icon: "terminal",
                category: "View",
                shortcut: "Ctrl+`",
                action: () => window.terminalConsole?.toggle(),
            },
            {
                id: "toggle-theme",
                title: "Toggle Theme",
                description: "Switch between light and dark themes",
                icon: "dark_mode",
                category: "View",
                shortcut: "Ctrl+T",
                action: () => toggleTheme(),
            },
            {
                id: "zoom-in",
                title: "Zoom In",
                description: "Increase zoom level",
                icon: "zoom_in",
                category: "View",
                shortcut: "Ctrl+=",
                action: () => {
                    document.body.style.zoom =
                        parseFloat(document.body.style.zoom || 1) + 0.1;
                },
            },
            {
                id: "zoom-out",
                title: "Zoom Out",
                description: "Decrease zoom level",
                icon: "zoom_out",
                category: "View",
                shortcut: "Ctrl+-",
                action: () => {
                    document.body.style.zoom =
                        parseFloat(document.body.style.zoom || 1) - 0.1;
                },
            },
            {
                id: "reset-zoom",
                title: "Reset Zoom",
                description: "Reset zoom level to 100%",
                icon: "filter_center_focus",
                category: "View",
                shortcut: "Ctrl+0",
                action: () => {
                    document.body.style.zoom = 1;
                },
            },
            {
                id: "show-command-palette",
                title: "Show Command Palette",
                description: "Open the command palette",
                icon: "keyboard",
                category: "View",
                shortcut: "Ctrl+Shift+P",
                action: () => this.show(),
            },

            {
                id: "generate-code",
                title: "Generate C Code",
                description: "Generate C code for the current project",
                icon: "code",
                category: "Build",
                action: () => generateC(),
            },
            {
                id: "run-project",
                title: "Run Project",
                description: "Execute the current project",
                icon: "play_arrow",
                category: "Build",
                shortcut: "F5",
                action: () => window.terminalConsole?.runProgram(),
            },
            {
                id: "stop-project",
                title: "Stop Project",
                description: "Stop the running project",
                icon: "stop",
                category: "Build",
                shortcut: "Shift+F5",
                action: () => window.terminalConsole?.stopProgram(),
            },

            {
                id: "go-to-start",
                title: "Go to Start Screen",
                description: "Return to the start screen",
                icon: "home",
                category: "Navigation",
                shortcut: "Ctrl+H",
                action: () => showStartScreen(),
            },
            {
                id: "go-to-designer",
                title: "Go to Designer",
                description: "Switch to the designer tab",
                icon: "design_services",
                category: "Navigation",
                shortcut: "Ctrl+1",
                action: () => this.switchTab("designer"),
            },
            {
                id: "go-to-code",
                title: "Go to Code Editor",
                description: "Switch to the code editor tab",
                icon: "code",
                category: "Navigation",
                shortcut: "Ctrl+2",
                action: () => this.switchTab("code"),
            },
            {
                id: "go-to-ui-xml",
                title: "Go to UI.xml",
                description: "Switch to the UI.xml tab",
                icon: "description",
                category: "Navigation",
                shortcut: "Ctrl+3",
                action: () => this.switchTab("ui-xml"),
            },

            {
                id: "quickstart-guide",
                title: "Open Quickstart Guide",
                description: "Open the quickstart guide documentation",
                icon: "book",
                category: "Help",
                action: () =>
                    window.open(
                        "https://binaryinktn.github.io/GooeyGUI/docs/index.html#guides",
                        "_blank",
                    ),
            },
            {
                id: "api-docs",
                title: "Open API Documentation",
                description: "Open the complete API reference",
                icon: "api",
                category: "Help",
                action: () =>
                    window.open(
                        "https://binaryinktn.github.io/GooeyGUI/docs/index.html",
                        "_blank",
                    ),
            },
            {
                id: "report-issue",
                title: "Report Issue",
                description: "Report a bug or request a feature",
                icon: "bug_report",
                category: "Help",
                action: () =>
                    window.open(
                        "https://github.com/BinaryInkTN/GooeyBuilder/issues",
                        "_blank",
                    ),
            },
            {
                id: "about",
                title: "About GUIIDE",
                description: "Show information about GUIIDE",
                icon: "info",
                category: "Help",
                action: () => showAboutDialog(),
            },
        ];
    }

    setupEventListeners() {
        this.overlay.addEventListener("click", () => this.hide());

        this.input.addEventListener("input", () => this.filterCommands());
        this.input.addEventListener("keydown", (e) => this.handleKeyDown(e));

        document.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === "P") {
                e.preventDefault();
                this.show();
            }

            if (e.key === "Escape" && this.isVisible()) {
                e.preventDefault();
                this.hide();
            }
        });
    }

    show() {
        this.palette.classList.add("active");
        this.overlay.classList.add("active");
        this.input.value = "";
        this.filterCommands();
        this.input.focus();
        this.selectedIndex = 0;
    }

    hide() {
        this.palette.classList.remove("active");
        this.overlay.classList.remove("active");
    }

    isVisible() {
        return this.palette.classList.contains("active");
    }

    filterCommands() {
        const query = this.input.value.toLowerCase().trim();
        this.filteredCommands = [];

        if (!query) {
            this.filteredCommands = [...this.commands];
        } else {
            this.filteredCommands = this.commands.filter(
                (cmd) =>
                    cmd.title.toLowerCase().includes(query) ||
                    cmd.description.toLowerCase().includes(query) ||
                    cmd.category.toLowerCase().includes(query) ||
                    (cmd.shortcut &&
                        cmd.shortcut.toLowerCase().includes(query)),
            );
        }

        this.renderCommands();
    }

    renderCommands() {
        this.content.innerHTML = "";

        if (this.filteredCommands.length === 0) {
            const emptyDiv = document.createElement("div");
            emptyDiv.className = "command-palette-empty";
            emptyDiv.innerHTML = `
                <span class="material-icons">search_off</span>
                <div>No commands found</div>
                <div style="font-size: 12px; margin-top: 8px;">Try a different search term</div>
            `;
            this.content.appendChild(emptyDiv);
            return;
        }

        let currentCategory = null;

        this.filteredCommands.forEach((cmd, index) => {
            if (cmd.category !== currentCategory) {
                currentCategory = cmd.category;
                const categoryDiv = document.createElement("div");
                categoryDiv.className = "command-category";
                categoryDiv.textContent = currentCategory;
                this.content.appendChild(categoryDiv);
            }

            const itemDiv = document.createElement("div");
            itemDiv.className = `command-item ${index === this.selectedIndex ? "selected" : ""}`;
            itemDiv.innerHTML = `
                <div class="command-icon">
                    <span class="material-icons">${cmd.icon}</span>
                </div>
                <div class="command-details">
                    <div class="command-title">${cmd.title}</div>
                    <div class="command-description">${cmd.description}</div>
                </div>
                ${cmd.shortcut ? `<div class="command-shortcut">${cmd.shortcut}</div>` : ""}
            `;

            itemDiv.addEventListener("click", () => this.executeCommand(cmd));

            this.content.appendChild(itemDiv);
        });

        const selectedItem = this.content.querySelector(
            ".command-item.selected",
        );
        if (selectedItem) {
            selectedItem.scrollIntoView({ block: "nearest" });
        }
    }

    handleKeyDown(e) {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                this.selectedIndex = Math.min(
                    this.selectedIndex + 1,
                    this.filteredCommands.length - 1,
                );
                this.renderCommands();
                break;

            case "ArrowUp":
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                this.renderCommands();
                break;

            case "Enter":
                e.preventDefault();
                if (this.filteredCommands[this.selectedIndex]) {
                    this.executeCommand(
                        this.filteredCommands[this.selectedIndex],
                    );
                }
                break;

            case "Escape":
                e.preventDefault();
                this.hide();
                break;
        }
    }

    executeCommand(command) {
        this.hide();
        try {
            command.action();
            if (window.terminalConsole) {
                window.terminalConsole.addLine(
                    `Executed: ${command.title}`,
                    "system",
                );
            }
        } catch (error) {
            console.error("Error executing command:", error);
            if (window.terminalConsole) {
                window.terminalConsole.addLine(
                    `Error executing ${command.title}: ${error.message}`,
                    "stderr",
                );
            }
        }
    }

    switchTab(tabName) {
        const tab = document.querySelector(
            `.document-tab[data-tab="${tabName}"]`,
        );
        if (tab) {
            tab.click();
        }
    }

    addCommand(command) {
        this.commands.push(command);
        if (this.isVisible()) {
            this.filterCommands();
        }
    }

    removeCommand(commandId) {
        this.commands = this.commands.filter((cmd) => cmd.id !== commandId);
        if (this.isVisible()) {
            this.filterCommands();
        }
    }
}

let commandPalette;

function initCommandPalette() {
    commandPalette = new CommandPalette();

    window.commandPalette = commandPalette;

    const commandPaletteItem = document.createElement("div");
    commandPaletteItem.className = "menu-item";
    commandPaletteItem.innerHTML = `
        <span>Command Palette</span>
        <div class="menu-dropdown" style="min-width: 250px;">
            <a href="#" id="open-command-palette">
                <span class="material-icons">keyboard</span>
                Open Command Palette
                <span style="margin-left: auto; font-size: 12px; color: var(--text-secondary);">Ctrl+Shift+P</span>
            </a>
        </div>
    `;

    const helpMenu = document.getElementById("help-menu");
    if (helpMenu && helpMenu.parentNode) {
        helpMenu.parentNode.insertBefore(commandPaletteItem, helpMenu);
    }

    document
        .getElementById("open-command-palette")
        ?.addEventListener("click", (e) => {
            e.preventDefault();
            commandPalette.show();
        });
}
function init() {
    document.addEventListener("contextmenu", (event) => event.preventDefault());

    window.terminalConsole = createTerminalConsoleManager();
    window.terminalConsole.init();

    setupWindowControls();

    setupMenuHandlers();

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
        }
        if (e.ctrlKey && e.key === "e") {
            e.preventDefault();
            exportCCode();
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

    const initialTheme = "dark";
    document.documentElement.setAttribute("data-theme", initialTheme);

    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.querySelector(".material-icons").textContent =
            initialTheme === "dark" ? "light_mode" : "dark_mode";

        themeToggle.addEventListener("click", toggleTheme);
    }
    initCommandPalette();

    document.getElementById("status-text").textContent = "Ready";
}

const reportIssueLink = document.getElementById("report-issue");
if (reportIssueLink) {
    reportIssueLink.addEventListener("click", () => {
        window.open(
            "https://github.com",
            "_blank",
            "top=500,left=200,frame=false,nodeIntegration=no",
        );
    });
}

window.addEventListener("beforeunload", () => {
    if (window.electronAPI) {
        window.electronAPI.removeMenuListeners();
    }
});

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

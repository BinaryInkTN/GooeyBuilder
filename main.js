const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const util = require("util");

const execPromise = util.promisify(exec);

let mainWindow;
let currentProjectPath = null;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        frame: false,
        titleBarStyle: "hiddenInset",
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"),
            enableRemoteModule: false,
        },
        icon: path.join(__dirname, "assets/icon.png"),
        show: false,
        backgroundColor: "#1e1e1e",
    });

    splash = new BrowserWindow({
        width: 700,
        height: 420,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
    });
    splash.loadFile("web/splash.html");
    mainWindow.loadFile("web/index.html");

    mainWindow.once("ready-to-show", async () => {
        await sleep(5000);
        splash.destroy();
        mainWindow.show();
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        require("electron").shell.openExternal(url);
        return { action: "deny" };
    });

    // Development tools
    if (process.env.NODE_ENV === "development") {
        mainWindow.webContents.openDevTools({ mode: "detach" });
    }
}

// Window Controls
ipcMain.on("window-minimize", () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on("window-maximize", () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.on("window-close", () => {
    if (mainWindow) mainWindow.close();
});

ipcMain.handle("get-window-state", () => {
    if (!mainWindow) return { isMaximized: false };
    return { isMaximized: mainWindow.isMaximized() };
});

// File Operations
ipcMain.handle("save-project", async (event, content, filePath) => {
    try {
        if (!filePath) {
            const result = await dialog.showSaveDialog(mainWindow, {
                title: "Save GUIIDE Project",
                defaultPath: currentProjectPath || "project.xml",
                filters: [
                    { name: "GUIIDE Projects", extensions: ["xml"] },
                    { name: "All Files", extensions: ["*"] },
                ],
            });

            if (result.canceled)
                return { success: false, error: "Cancelled by user" };
            filePath = result.filePath;
        }

        await fs.promises.writeFile(filePath, content, "utf8");
        currentProjectPath = filePath;
        return { success: true, filePath };
    } catch (error) {
        console.error("Save error:", error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle("open-project", async () => {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            title: "Open GUIIDE Project",
            filters: [
                { name: "GUIIDE Projects", extensions: ["xml"] },
                { name: "All Files", extensions: ["*"] },
            ],
            properties: ["openFile"],
        });

        if (result.canceled)
            return { success: false, error: "Cancelled by user" };

        const filePath = result.filePaths[0];
        const content = await fs.promises.readFile(filePath, "utf8");
        currentProjectPath = filePath;
        return { success: true, filePath, content };
    } catch (error) {
        console.error("Open error:", error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle("save-c-code", async (event, cCode) => {
    try {
        const result = await dialog.showSaveDialog(mainWindow, {
            title: "Save C Code",
            defaultPath: "main.c",
            filters: [
                { name: "C Files", extensions: ["c"] },
                { name: "All Files", extensions: ["*"] },
            ],
        });

        if (result.canceled)
            return { success: false, error: "Cancelled by user" };

        const filePath = result.filePath;
        await fs.promises.writeFile(filePath, cCode, "utf8");

        return { success: true, filePath };
    } catch (error) {
        console.error("Save C code error:", error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle("execute-c-code", async (event, cCode) => {
    try {
        // Create temporary build directory
        const tempDir = path.join(app.getPath("temp"), "guiide-build");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const tempFile = path.join(tempDir, "main.c");
        await fs.promises.writeFile(tempFile, cCode, "utf8");

        let output = "";
        let error = "";

        // Check platform for compilation
        if (process.platform === "win32") {
            // Windows - Check if MinGW is available
            try {
                const { stdout } = await execPromise("gcc --version");
                output += "GCC detected:\n" + stdout.split("\n")[0] + "\n\n";

                // Try to compile
                const exePath = path.join(tempDir, "app.exe");
                const { stdout: compileOut, stderr: compileErr } =
                    await execPromise(
                        `gcc "${tempFile}" -o "${exePath}" -I"C:\\GooeyGUI\\include" -L"C:\\GooeyGUI\\lib" -lGooeyGUI`,
                    );

                if (compileErr && compileErr.includes("error")) {
                    error += "Compilation error:\n" + compileErr;
                } else {
                    output += "Compilation successful!\n";

                    // Try to run
                    try {
                        const { stdout: runOut, stderr: runErr } =
                            await execPromise(`"${exePath}"`);
                        if (runOut) output += "Program output:\n" + runOut;
                        if (runErr) error += "\nRuntime error:\n" + runErr;
                    } catch (runError) {
                        error += "\nRuntime error: " + runError.message;
                    }
                }
            } catch (gccError) {
                error =
                    "GCC not found. Please install MinGW or configure your build environment.\n";
                error += "For now, saving C code to: " + tempFile;
            }
        } else if (
            process.platform === "darwin" ||
            process.platform === "linux"
        ) {
            // macOS/Linux
            try {
                const { stdout } = await execPromise("gcc --version");
                output += "GCC detected:\n" + stdout.split("\n")[0] + "\n\n";

                // Try to compile
                const exePath = path.join(tempDir, "app");
                const { stdout: compileOut, stderr: compileErr } =
                    await execPromise(
                        `gcc "${tempFile}" -o "${exePath}" -lGooeyGUI-1 -lGLPS -I/usr/local/include/GLPS -I/usr/local/include/Gooey -L/usr/local/lib`,
                    );

                if (compileErr && compileErr.includes("error")) {
                    error += "Compilation error:\n" + compileErr;
                } else {
                    output += "Compilation successful!\n";

                    // Try to run
                    try {
                        const { stdout: runOut, stderr: runErr } =
                            await execPromise(`"${exePath}"`);
                        if (runOut) output += "Program output:\n" + runOut;
                        if (runErr) error += "\nRuntime error:\n" + runErr;
                    } catch (runError) {
                        error += "\nRuntime error: " + runError.message;
                    }
                }
            } catch (gccError) {
                error = "GCC not found. Please install build essentials.\n";
                error += "For now, saving C code to: " + tempFile;
            }
        }

        return {
            success: !error.includes("error"),
            output: output || "No output",
            error: error || "",
            tempFile,
        };
    } catch (error) {
        console.error("Execute error:", error);
        return { success: false, error: error.message };
    }
});

// Menu setup
function createApplicationMenu() {
    const isMac = process.platform === "darwin";

    const template = [
        // App Menu (macOS)
        ...(isMac
            ? [
                  {
                      label: app.name,
                      submenu: [
                          { role: "about" },
                          { type: "separator" },
                          { role: "services" },
                          { type: "separator" },
                          { role: "hide" },
                          { role: "hideOthers" },
                          { role: "unhide" },
                          { type: "separator" },
                          { role: "quit" },
                      ],
                  },
              ]
            : []),

        // File Menu
        {
            label: "File",
            submenu: [
                {
                    label: "New Project",
                    accelerator: "CmdOrCtrl+N",
                    click: () =>
                        mainWindow.webContents.send("menu-new-project"),
                },
                {
                    label: "Open Project",
                    accelerator: "CmdOrCtrl+O",
                    click: () =>
                        mainWindow.webContents.send("menu-open-project"),
                },
                {
                    label: "Save Project",
                    accelerator: "CmdOrCtrl+S",
                    click: () =>
                        mainWindow.webContents.send("menu-save-project"),
                },
                {
                    label: "Save Project As...",
                    accelerator: "CmdOrCtrl+Shift+S",
                    click: () =>
                        mainWindow.webContents.send("menu-save-project-as"),
                },
                { type: "separator" },
                {
                    label: "Export C Code",
                    accelerator: "CmdOrCtrl+E",
                    click: () =>
                        mainWindow.webContents.send("menu-export-c-code"),
                },
                { type: "separator" },
                isMac ? { role: "close" } : { role: "quit" },
            ],
        },

        // Edit Menu
        {
            label: "Edit",
            submenu: [
                { role: "undo" },
                { role: "redo" },
                { type: "separator" },
                { role: "cut" },
                { role: "copy" },
                { role: "paste" },
                ...(isMac
                    ? [
                          { role: "pasteAndMatchStyle" },
                          { role: "delete" },
                          { role: "selectAll" },
                          { type: "separator" },
                          {
                              label: "Speech",
                              submenu: [
                                  { role: "startSpeaking" },
                                  { role: "stopSpeaking" },
                              ],
                          },
                      ]
                    : [
                          { role: "delete" },
                          { type: "separator" },
                          { role: "selectAll" },
                      ]),
            ],
        },

        // View Menu
        {
            label: "View",
            submenu: [
                { role: "reload" },
                { role: "forceReload" },
                { role: "toggleDevTools" },
                { type: "separator" },
                { role: "resetZoom" },
                { role: "zoomIn" },
                { role: "zoomOut" },
                { type: "separator" },
                { role: "togglefullscreen" },
            ],
        },

        // Window Menu
        {
            label: "Window",
            submenu: [
                { role: "minimize" },
                { role: "zoom" },
                ...(isMac
                    ? [
                          { type: "separator" },
                          { role: "front" },
                          { type: "separator" },
                          { role: "window" },
                      ]
                    : [{ role: "close" }]),
            ],
        },

        // Help Menu
        {
            role: "help",
            submenu: [
                {
                    label: "Quickstart Guide",
                    click: async () => {
                        await require("electron").shell.openExternal(
                            "https://binaryinktn.github.io/GooeyGUI/docs/index.html#guides",
                        );
                    },
                },
                {
                    label: "API Documentation",
                    click: async () => {
                        await require("electron").shell.openExternal(
                            "https://binaryinktn.github.io/GooeyGUI/docs/index.html",
                        );
                    },
                },
                {
                    label: "Report Issue",
                    click: async () => {
                        await require("electron").shell.openExternal(
                            "https://github.com/BinaryInkTN/GooeyBuilder/issues",
                        );
                    },
                },
                { type: "separator" },
                {
                    label: "About GUIIDE",
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: "info",
                            title: "About GUIIDE",
                            message: "GUIIDE Beta",
                            detail: "Version 1.0.0\nBuild stunning applications with ease.\nCreate, design, and deploy across platforms.",
                            buttons: ["OK"],
                        });
                    },
                },
            ],
        },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}
let splash;

// App lifecycle
app.whenReady().then(() => {
    createWindow();
    createApplicationMenu();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// Handle multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on("second-instance", () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

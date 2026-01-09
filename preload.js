const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    // Window controls
    minimizeWindow: () => ipcRenderer.send("window-minimize"),
    maximizeWindow: () => ipcRenderer.send("window-maximize"),
    closeWindow: () => ipcRenderer.send("window-close"),
    getWindowState: () => ipcRenderer.invoke("get-window-state"),

    // File operations
    saveProject: (content, filePath) =>
        ipcRenderer.invoke("save-project", content, filePath),
    openProject: () => ipcRenderer.invoke("open-project"),
    saveCCode: (cCode) => ipcRenderer.invoke("save-c-code", cCode),

    // Code execution
    executeCCode: (cCode) => ipcRenderer.invoke("execute-c-code", cCode),

    // Menu events
    onMenuEvent: (callback) => {
        ipcRenderer.on("menu-new-project", () => callback("new-project"));
        ipcRenderer.on("menu-open-project", () => callback("open-project"));
        ipcRenderer.on("menu-save-project", () => callback("save-project"));
        ipcRenderer.on("menu-save-project-as", () =>
            callback("save-project-as"),
        );
        ipcRenderer.on("menu-export-c-code", () => callback("export-c-code"));
    },

    // Remove menu event listeners
    removeMenuListeners: () => {
        ipcRenderer.removeAllListeners("menu-new-project");
        ipcRenderer.removeAllListeners("menu-open-project");
        ipcRenderer.removeAllListeners("menu-save-project");
        ipcRenderer.removeAllListeners("menu-save-project-as");
        ipcRenderer.removeAllListeners("menu-export-c-code");
    },
});

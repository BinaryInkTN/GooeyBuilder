import state from "./state.js";
import nativeBridge from "./nativeBridge.js";

let platformCards = [];
let confirmButton = null;
let cancelButton = null;
let modal = null;

function initializePlatformSelection() {
    modal = document.getElementById("platform-selection-modal");
    confirmButton = document.getElementById("confirm-platform-selection");
    cancelButton = document.getElementById("cancel-platform-selection");
    platformCards = document.querySelectorAll(".platform-card");

    if (!modal || !confirmButton || !cancelButton) {
        console.error("Platform selection elements not found");
        return;
    }

    platformCards.forEach((card) => {
        card.addEventListener("click", handlePlatformSelect);
    });

    cancelButton.addEventListener("click", handleCancelSelection);
    confirmButton.addEventListener("click", handleConfirmSelection);

    confirmButton.disabled = true;
}

function handlePlatformSelect(event) {
    const card = event.currentTarget;
    platformCards.forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");

    state.selectedPlatform = card.dataset.platform;
    state.projectSettings.platform = card.dataset.platform;

    confirmButton.disabled = false;
}

function handleCancelSelection() {
    modal.classList.remove("active");
    state.selectedPlatform = null;
    state.projectSettings.platform = null;
    platformCards.forEach((c) => c.classList.remove("selected"));
    confirmButton.disabled = true;
}

function handleConfirmSelection() {
    if (!state.projectSettings.platform) {
        console.error("No platform selected");
        return;
    }

    modal.classList.remove("active");
    createNewProject();

    platformCards.forEach((c) => c.classList.remove("selected"));
    confirmButton.disabled = true;
}

function createNewProject() {
    if (!state.projectSettings.language || !state.projectSettings.platform) {
        console.error("Missing language or platform for project creation");
        return;
    }

    updateUIForPlatform();
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("editor-screen").style.display = "block";
}

function updateUIForPlatform() {
    const platformIndicator = document.getElementById("platform-indicator");
    if (platformIndicator) {
        platformIndicator.style.display = "block";
        platformIndicator.textContent = `${state.projectSettings.platform} | ${state.projectSettings.language}`;
    }
}

export function showEditor(language) {
    if (language) {
        showPlatformSelection(language);
    } else {
        document.getElementById("start-screen").style.display = "none";
        document.getElementById("editor-screen").style.display = "block";
    }
}

export function showStartScreen() {
    document.getElementById("platform-indicator").style.display = "none";
    document.getElementById("editor-screen").style.display = "none";
    document.getElementById("start-screen").style.display = "flex";
}

export async function openDocs() {
    try {
        await nativeBridge.docsCommand();
    } catch (error) {
        console.error("Failed to open docs:", error);
        window.open(
            "https://gooeyui.github.io/GooeyGUI/quickstart.html",
            "_blank",
        );
    }
}

export function showPlatformSelection(language = "c") {
    if (!modal) {
        initializePlatformSelection();
    }

    state.projectSettings.language = language;

    state.selectedPlatform = null;
    state.projectSettings.platform = null;

    platformCards.forEach((c) => c.classList.remove("selected"));
    if (confirmButton) {
        confirmButton.disabled = true;
    }

    modal.classList.add("active");
}

document.addEventListener("DOMContentLoaded", function () {
    initializePlatformSelection();

    document.querySelectorAll(".section-toggle").forEach((toggle) => {
        toggle.addEventListener("click", () => {
            const sectionId = toggle.getAttribute("data-section");
            const content = document.getElementById(`${sectionId}-settings`);
            const isCollapsed = content.classList.contains("collapsed");
            content.classList.toggle("collapsed", !isCollapsed);
            toggle.classList.toggle("collapsed", !isCollapsed);
        });
    });

    document
        .querySelectorAll('.backend-toggle input[type="checkbox"]')
        .forEach((toggle) => {
            toggle.addEventListener("change", (e) => {
                alert("Backend configuration is coming soon!");
                e.target.checked = false;
            });
        });

    document.querySelectorAll(".backend-config-btn").forEach((button) => {
        button.addEventListener("click", () => {
            alert("Backend configuration is coming soon!");
        });
    });
});

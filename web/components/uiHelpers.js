import state from "./state.js";
import nativeBridge from "./nativeBridge.js";

// Store references to elements
let platformCards = [];
let confirmButton = null;
let cancelButton = null;
let modal = null;

// Initialize elements once DOM is ready
function initializePlatformSelection() {
  modal = document.getElementById("platform-selection-modal");
  confirmButton = document.getElementById("confirm-platform-selection");
  cancelButton = document.getElementById("cancel-platform-selection");
  platformCards = document.querySelectorAll(".platform-card");

  if (!modal || !confirmButton || !cancelButton) {
    console.error("Platform selection elements not found");
    return;
  }

  // Set up platform card click handlers
  platformCards.forEach((card) => {
    card.addEventListener("click", handlePlatformSelect);
  });

  // Set up button handlers
  cancelButton.addEventListener("click", handleCancelSelection);
  confirmButton.addEventListener("click", handleConfirmSelection);

  // Initially disable confirm button
  confirmButton.disabled = true;
}

function handlePlatformSelect(event) {
  const card = event.currentTarget;

  // Remove selection from all cards
  platformCards.forEach((c) => c.classList.remove("selected"));

  // Add selection to clicked card
  card.classList.add("selected");

  // Update state
  state.selectedPlatform = card.dataset.platform;
  state.projectSettings.platform = card.dataset.platform;

  // Enable confirm button
  confirmButton.disabled = false;
}

function handleCancelSelection() {
  modal.classList.remove("active");
  state.selectedPlatform = null;
  state.projectSettings.platform = null;

  // Reset UI
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

  // Reset for next time
  platformCards.forEach((c) => c.classList.remove("selected"));
  confirmButton.disabled = true;
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
  await nativeBridge.docsCommand();
}

export function showPlatformSelection(language) {
  // Initialize if not done yet
  if (!modal) {
    initializePlatformSelection();
  }

  state.projectSettings.language = language;

  // Reset state
  state.selectedPlatform = null;
  state.projectSettings.platform = null;

  // Reset UI
  if (platformCards.length > 0) {
    platformCards.forEach((c) => c.classList.remove("selected"));
  }
  if (confirmButton) {
    confirmButton.disabled = true;
  }

  // Show modal
  modal.classList.add("active");
}

function createNewProject() {
  // Validate that we have both language and platform
  if (!state.projectSettings.language || !state.projectSettings.platform) {
    console.error("Missing language or platform for project creation");
    return;
  }

  console.log(
    `Creating new ${state.projectSettings.language} project for ${state.projectSettings.platform} platform`,
  );

  // Update UI and show editor
  updateUIForPlatform();

  // Hide start screen and show editor screen
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

// Initialize when module loads
document.addEventListener("DOMContentLoaded", function () {
  initializePlatformSelection();

  // Initialize modal section toggles
  document.querySelectorAll(".section-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const sectionId = toggle.getAttribute("data-section");
      const content = document.getElementById(`${sectionId}-settings`);
      const isCollapsed = content.classList.contains("collapsed");
      content.classList.toggle("collapsed", !isCollapsed);
      toggle.classList.toggle("collapsed", !isCollapsed);
    });
  });

  // Handle backend toggle switches
  document
    .querySelectorAll('.backend-toggle input[type="checkbox"]')
    .forEach((toggle) => {
      toggle.addEventListener("change", (e) => {
        alert("Backend configuration is coming soon!");
        e.target.checked = false;
      });
    });

  // Handle configuration buttons
  document.querySelectorAll(".backend-config-btn").forEach((button) => {
    button.addEventListener("click", () => {
      alert("Backend configuration is coming soon!");
    });
  });
});

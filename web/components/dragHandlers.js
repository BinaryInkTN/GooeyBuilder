import state from "./state.js";
import { selectWidget, updatePropertiesPanel } from "./propertiesPanel.js";

export function setupEditorDrag(codeEditor) {
  let isDraggingEditor = false;
  let editorDragOffsetX = 0;
  let editorDragOffsetY = 0;

  const codeEditorHeader = codeEditor.querySelector(".code-editor-header");

  codeEditorHeader.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "BUTTON" || e.target.closest("button")) return;

    isDraggingEditor = true;
    const rect = codeEditor.getBoundingClientRect();
    editorDragOffsetX = e.clientX - rect.left;
    editorDragOffsetY = e.clientY - rect.top;

    document.addEventListener("mousemove", onEditorDragMove);
    document.addEventListener("mouseup", onEditorDragEnd);
  });

  function onEditorDragMove(e) {
    if (!isDraggingEditor) return;

    const container = document.querySelector(".workspace");
    const containerRect = container.getBoundingClientRect();
    const editorRect = codeEditor.getBoundingClientRect();

    let newX = e.clientX - editorDragOffsetX - containerRect.left;
    let newY = e.clientY - editorDragOffsetY - containerRect.top;

    // Constrain within workspace
    newX = Math.max(0, Math.min(newX, containerRect.width - editorRect.width));
    newY = Math.max(
      0,
      Math.min(newY, containerRect.height - editorRect.height),
    );

    codeEditor.style.left = newX + "px";
    codeEditor.style.top = newY + "px";
  }

  function onEditorDragEnd() {
    isDraggingEditor = false;
    document.removeEventListener("mousemove", onEditorDragMove);
    document.removeEventListener("mouseup", onEditorDragEnd);
  }
}

export function setupPreviewWindowDrag(previewWindow, previewTitleBar) {
  let isDraggingPreview = false;
  let previewDragOffsetX = 0;
  let previewDragOffsetY = 0;

  previewTitleBar.addEventListener("mousedown", (e) => {
    if (
      e.target.classList.contains("window-control") ||
      e.target.closest(".window-control")
    )
      return;

    isDraggingPreview = true;
    const rect = previewWindow.getBoundingClientRect();
    const workspaceRect = document
      .getElementById("workspace")
      .getBoundingClientRect();
    previewDragOffsetX = e.clientX - rect.left + workspaceRect.left;
    previewDragOffsetY = e.clientY - rect.top + workspaceRect.top;

    document.addEventListener("mousemove", onPreviewDragMove);
    document.addEventListener("mouseup", onPreviewDragEnd);
  });

  function onPreviewDragMove(e) {
    if (!isDraggingPreview) return;

    const workspace = document.getElementById("workspace");
    const workspaceRect = workspace.getBoundingClientRect();

    let newX = e.clientX - previewDragOffsetX;
    let newY = e.clientY - previewDragOffsetY;

    newX = Math.max(
      0,
      Math.min(newX, workspaceRect.width - previewWindow.offsetWidth),
    );
    newY = Math.max(
      0,
      Math.min(newY, workspaceRect.height - previewWindow.offsetHeight),
    );

    previewWindow.style.left = newX + "px";
    previewWindow.style.top = newY + "px";
    previewWindow.style.right = "auto";
    previewWindow.style.bottom = "auto";
  }

  function onPreviewDragEnd() {
    isDraggingPreview = false;
    document.removeEventListener("mousemove", onPreviewDragMove);
    document.removeEventListener("mouseup", onPreviewDragEnd);
  }
}

export function setupWidgetDrag(element) {
  element.addEventListener("mousedown", function (e) {
    if (e.button !== 0) return;
    if (e.target.classList.contains("resize-handle")) return;

    e.stopPropagation();

    state.draggedWidget = element;
    const previewContent =
      state.previewContent || document.querySelector(".preview-content");

    if (!previewContent) {
      console.error("Preview content not found");
      return;
    }

    // Calculate offset relative to the current parent container
    const rect = element.getBoundingClientRect();
    const parentRect = element.parentElement.getBoundingClientRect();

    state.dragOffsetX = e.clientX - rect.left;
    state.dragOffsetY = e.clientY - rect.top;
    state.originalParent = element.parentElement;
    state.originalPosition = {
      left: element.style.left,
      top: element.style.top,
      position: element.style.position,
    };

    selectWidget(element);

    // If dragging from a layout, convert to absolute positioning temporarily
    if (element.parentElement.classList.contains("layout")) {
      element.style.position = "absolute";
      const previewRect = previewContent.getBoundingClientRect();
      element.style.left = rect.left - previewRect.left + "px";
      element.style.top = rect.top - previewRect.top + "px";
      previewContent.appendChild(element);
    }

    document.addEventListener("mousemove", onWidgetDragMove);
    document.addEventListener("mouseup", onWidgetDragEnd);
  });
}

function onWidgetDragMove(e) {
  if (
    !state.draggedWidget ||
    state.draggedWidget.classList.contains("widget-menu")
  )
    return;

  e.preventDefault();

  const previewContent =
    state.previewContent || document.querySelector(".preview-content");
  if (!previewContent) return;

  const previewRect = previewContent.getBoundingClientRect();

  // Calculate new position relative to preview content
  let newX = e.clientX - state.dragOffsetX - previewRect.left;
  let newY = e.clientY - state.dragOffsetY - previewRect.top;

  // Constrain within preview content
  newX = Math.max(
    0,
    Math.min(newX, previewRect.width - state.draggedWidget.offsetWidth),
  );
  newY = Math.max(
    0,
    Math.min(newY, previewRect.height - state.draggedWidget.offsetHeight),
  );

  state.draggedWidget.style.left = newX + "px";
  state.draggedWidget.style.top = newY + "px";

  // Check for layout drop zones
  const layouts = previewContent.querySelectorAll(".layout");
  let hoveredLayout = null;

  layouts.forEach((layout) => {
    layout.classList.remove("drop-hover");
    const rect = layout.getBoundingClientRect();
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      hoveredLayout = layout;
      layout.classList.add("drop-hover");
    }
  });

  updatePropertiesPanel();
}

function onWidgetDragEnd(e) {
  if (!state.draggedWidget) return;

  document.removeEventListener("mousemove", onWidgetDragMove);
  document.removeEventListener("mouseup", onWidgetDragEnd);

  const previewContent =
    state.previewContent || document.querySelector(".preview-content");
  if (!previewContent) return;

  const layouts = previewContent.querySelectorAll(".layout");
  let droppedInLayout = null;

  // Find which layout we dropped into (if any)
  layouts.forEach((layout) => {
    layout.classList.remove("drop-hover");
    const rect = layout.getBoundingClientRect();
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      droppedInLayout = layout;
    }
  });

  if (droppedInLayout) {
    // Reset positioning for layout container
    state.draggedWidget.style.position = "";
    state.draggedWidget.style.left = "";
    state.draggedWidget.style.top = "";

    // Calculate relative position within the layout
    const layoutRect = droppedInLayout.getBoundingClientRect();
    const widgetRect = state.draggedWidget.getBoundingClientRect();

    // For horizontal/vertical layouts, just append (they handle positioning)
    if (
      droppedInLayout.classList.contains("horizontal") ||
      droppedInLayout.classList.contains("vertical")
    ) {
      // These layouts use flexbox, so no manual positioning needed
      droppedInLayout.appendChild(state.draggedWidget);
    } else {
      // For regular containers, calculate relative position
      const relativeX = widgetRect.left - layoutRect.left;
      const relativeY = widgetRect.top - layoutRect.top;

      state.draggedWidget.style.left = relativeX + "px";
      state.draggedWidget.style.top = relativeY + "px";
      state.draggedWidget.style.position = "absolute";
      droppedInLayout.appendChild(state.draggedWidget);
    }

    // Remove placeholder if it exists
    const placeholder = droppedInLayout.querySelector(".layout-placeholder");
    if (placeholder) {
      droppedInLayout.removeChild(placeholder);
    }
  } else {
    // Dropped outside any layout - keep absolute positioning in preview content
    state.draggedWidget.style.position = "absolute";
    // Position is already set from drag movement
  }

  state.draggedWidget = null;
  updatePropertiesPanel();
}

// Helper function to get correct coordinates within a container
function getRelativeCoordinates(element, container) {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return {
    x: elementRect.left - containerRect.left,
    y: elementRect.top - containerRect.top,
  };
}

// UI Utility Module for DRY, modularity, and reusability
// Adhere to modularity and reusability

export function addEventListenerSafe(element, event, handler) {
    if (element) element.addEventListener(event, handler);
}

export function setTextContentSafe(element, text) {
    if (element) element.textContent = text;
}

export function setDisplaySafe(element, display) {
    if (element) element.style.display = display;
}

export function showError(message, container) {
    if (container) {
        container.textContent = message;
        container.style.color = 'var(--danger-color)';
        container.style.display = 'block';
    }
}

export function resetSelection() {
    if (window.getSelection) {
        const selection = window.getSelection();
        if (!selection.isCollapsed) {
            selection.removeAllRanges();
        }
    }
    else if (document.selection) {
        document.selection.empty();
    }
}

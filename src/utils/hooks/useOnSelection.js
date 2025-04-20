import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to listen for text selection end, invoke a callback, and track invocation state.
 * @param {Function} callback - Function invoked with the selected text.
 * @param {Object} options - Configuration options.
 * @param {boolean} options.enableTouch - Listen on touchend (default true).
 * @param {boolean} options.enableMouse - Listen on mouseup (default true).
 * @returns {boolean} - `true` if the callback has been invoked at least once.
 */
export default function useOnSelection(callback, {enableTouch = true, enableMouse = true} = {}) {
    const [hasFired, setHasFired] = useState(false);

    const handleSelectionEnd = useCallback(() => {
        const text = window.getSelection().toString();
        if (text?.trim()) {
            callback(text);
            setHasFired(true);
        }
    }, [callback]);

    useEffect(() => {
        if (enableMouse) {
            document.addEventListener('mouseup', handleSelectionEnd);
        }
        if (enableTouch) {
            document.addEventListener('touchend', handleSelectionEnd);
        }

        return () => {
            if (enableMouse) {
                document.removeEventListener('mouseup', handleSelectionEnd);
            }
            if (enableTouch) {
                document.removeEventListener('touchend', handleSelectionEnd);
            }
        };
    }, [handleSelectionEnd, enableMouse, enableTouch]);

  return hasFired;
}

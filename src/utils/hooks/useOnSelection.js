import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Hook to listen for new text selections within a specified target element and invoke a callback only when selection changes.
 * Automatically resets internal state if selection occurs outside the target.
 *
 * @param {Function} callback - Function to be called with the newly selected text.
 * @param {React.RefObject<HTMLElement>} targetRef - Ref pointing to the container element to scope selection.
 * @returns {boolean} - `true` once a selection inside the target has been processed.
 */
export default function useOnSelection(callback, targetRef) {
    const lastSelectionRef = useRef('');
    const [hasFired, setHasFired] = useState(false);

    const handleSelectionEnd = useCallback(() => {
        const selection = window.getSelection();
        if (!selection) return;

        const text = selection.toString().trim();
        const target = targetRef.current;
        if (!target) return;

        const { anchorNode, focusNode } = selection;
        const isInside = target.contains(anchorNode) || target.contains(focusNode);

        if (text && (text !== lastSelectionRef.current)) {
            if (isInside) {
                lastSelectionRef.current = text;
                callback(text);
                setHasFired(true);
            }
        } else {
            lastSelectionRef.current = '';
            setHasFired(false);
        }
    }, [callback, targetRef]);

    useEffect(() => {
        const target = targetRef.current;
        if (!target) return;

        target.addEventListener('mouseup', handleSelectionEnd);
        target.addEventListener('touchend', handleSelectionEnd);

        return () => {
            target.removeEventListener('mouseup', handleSelectionEnd);
            target.removeEventListener('touchend', handleSelectionEnd);
        };
    }, [handleSelectionEnd, targetRef]);

    return hasFired;
}

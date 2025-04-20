import { useRef } from 'react';

/**
 * Hook to separate single vs double click (desktop) and tap (mobile),
 * ignore clicks if text selection is present, prevent click/tap conflicts,
 * and suppress the synthetic click after touch.
 * @param {Object}   handlers       - callbacks for interactions
 * @param {Function} handlers.onClick       - single-click callback
 * @param {Function} handlers.onDoubleClick - double-click callback
 * @param {Object}   options         - configuration
 * @param {number}   options.delay   - max ms between interactions (default 250)
 * @returns {Object} event handlers to spread on your element
 */
export default function useClickAndDoubleClick({onClick, onDoubleClick}, {delay = 250} = {}){
    const clickTimeout = useRef(null);
    const lastTapTime = useRef(0);
    const tapTimeout = useRef(null);

    // On touch start, prevent default to stop the synthetic click later
    const handleTouchStart = e => {
        e.preventDefault();
    };

    const handleClick = e => {
        // schedule single click after delay
        clearTimeout(clickTimeout.current);
        clickTimeout.current = setTimeout(() => {
            const selection = window.getSelection?.().toString();
            if (!selection?.trim()) {
                onClick(e);
            }
        }, delay);
    };

    const handleDoubleClick = e => {
        clearTimeout(clickTimeout.current);
        const selection = window.getSelection?.().toString();
        if (!selection?.trim()) {
            onDoubleClick(e);
        }
    };

    const handleTouchEnd = e => {
        // prevent the synthetic mouse event after touch
        e.preventDefault();
        const now = Date.now();
        if (now - lastTapTime.current < delay) {
            clearTimeout(tapTimeout.current);
            lastTapTime.current = 0;
            onDoubleClick(e);
        }
        else {
            lastTapTime.current = now;
            tapTimeout.current = setTimeout(() => {
                onClick(e);
                lastTapTime.current = 0;
            }, delay);
        }
    };

    return {
        onTouchStart: handleTouchStart,
        onClick: handleClick,
        onDoubleClick: handleDoubleClick,
        onTouchEnd: handleTouchEnd,
    };
}

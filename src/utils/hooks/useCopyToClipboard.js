import { useCallback, useState } from 'react';

/**
 * Hook to copy a given text string to the clipboard.
 * @returns {[boolean, function(string): Promise<boolean>]} - isCopied flag and copy function and.
 */
export default function useCopyToClipboard() {
    const [isCopied, setCopied] = useState(false);

    const copy = useCallback(async (text) => {
        if (!text) {
            setCopied(false);
            return false;
        }
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            }
            else {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            setCopied(true);
            return true;
        }
        catch (error) {
            console.error(error.toString())
            setCopied(false);
            return false;
        }
    }, []);

    return [isCopied, copy];
}

import React, { useState, useRef } from 'react';
import { formatHM } from '@app/assets/utils/time';
import { resetSelection } from '@app/utils/functions/resetSelection';

import Markdown from "react-markdown";
import Notification from '@app/utils/classes/Notification';

import useOnSelection from '@app/utils/hooks/useOnSelection';
import useCopyToClipboard from '@app/utils/hooks/useCopyToClipboard';
import useClickAndDoubleClick from '@app/utils/hooks/useClickAndDoubleClick';

import './Message.css';

function Message({ group, message }) {
    const messageRef = useRef(null);

    const [_, copy] = useCopyToClipboard();
    const [showOptions, setShowOptions] = useState(false);

    const toggleOptions = () => {
        setShowOptions(prev => !prev);
        resetSelection();
    }

    const copyToClipboard = () => {
        copy(message.text);
        Notification.show('Copied to clipboard.');
    }

    const handlers = useClickAndDoubleClick({
        onClick: copyToClipboard, 
        onDoubleClick: toggleOptions,
    });

    // eslint-disable-next-line no-unused-vars
    const selected = useOnSelection((text) => {
        copy(text);
        Notification.show('Copied to clipboard.');
    }, messageRef);

    return (
        <>
            {group.fromAiA ? (
                <div className="message-container" ref={messageRef}>
                    <div className="avatar"></div>
                    <div className="message received" 
                        onClick={handlers.onClick}
                        onDoubleClick={handlers.onDoubleClick}
                        onTouchEnd={handlers.onTouchEnd}
                    >
                        <div className="message-content">
                            <Markdown>{message.text}</Markdown>
                        </div>
                        {showOptions && (
                            <div className="message-time">{formatHM(message.date)}</div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="message-container sent" ref={messageRef}>
                    <div className="message sent"
                        onClick={handlers.onClick}
                        onDoubleClick={handlers.onDoubleClick}
                        onTouchEnd={handlers.onTouchEnd}
                    >
                        <div className="message-content">
                            <Markdown>{message.text}</Markdown>
                        </div>
                        {showOptions && (
                            <div className="message-time">{formatHM(message.date)}</div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default Message;

import React, { useState } from 'react';
import { formatHM } from '../../../assets/utils/time';

import './Message.css';

function Message({ group, message }) {
    const [showInfo, setShowInfo] = useState(false);
    const toggleShowInfo = () => setShowInfo(prev => !prev);

    return (
        <>
            {group.fromAiA ? (
                <div className="message-container">
                    <div className="avatar"></div>
                    <div className="message received" onClick={toggleShowInfo}>
                        <div className="message-content">{message.text}</div>
                        {showInfo && (
                            <div className="message-time">{formatHM(message.date)}</div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="message-container sent">
                    <div className="message sent" onClick={toggleShowInfo}>
                        <div className="message-content">{message.text}</div>
                        {showInfo && (
                            <div className="message-time">{formatHM(message.date)}</div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default Message;

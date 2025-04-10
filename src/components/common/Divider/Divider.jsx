import React from 'react';
import { formatWM } from '../../../assets/utils/time';

import './Divider.css';

function Divider({group, message}) {
    return (
        <>
            <div className="date-divider">
                <span>{formatWM(message.date)}</span>
            </div>
        </>
    );
}

export default Divider;

import React from 'react';
import { formatWM } from '@app/assets/utils/time';

import './Divider.css';

function Divider({message}) {
    return (
        <>
            <div className="date-divider">
                <span>{formatWM(message.date)}</span>
            </div>
        </>
    );
}

export default Divider;

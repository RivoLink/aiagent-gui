import './Notification.css';

function Notification() {
    return (
        <div id="notification" className="notification">
            <div className="notification-message"></div>
            <button className="notification-close" >×</button>
            <div className="progress">
                <div className="progress-fill"></div>
            </div>
        </div>
    );
}

export default Notification;

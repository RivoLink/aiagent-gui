export default class Notification {

    static #TIMEOUT_ID = null;

    static info(text, duration = 2000) {
        Notification.show(text, 'info', duration);
    }

    static warn(text, duration = 2500) {
        Notification.show(text, 'warn', duration);
    }

    static error(text, duration = 2500) {
        Notification.show(text, 'error', duration);
    }

    static show(text, type = 'info', duration = 2000) {
        const notif = document.getElementById('notification');
        const msg = notif.querySelector('.notification-message');
        const fill = notif.querySelector('.progress-fill');
  
        msg.textContent = text;
        notif.classList.add('show', type);
  
        // reset progress bar
        fill.style.transition = 'none';
        fill.style.width = '0%';
  
        // kick off the fill animation
        requestAnimationFrame(() => {
          fill.style.transition = `width ${duration}ms linear`;
          fill.style.width = '100%';
        });
  
        clearTimeout(Notification.#TIMEOUT_ID);
        Notification.#TIMEOUT_ID = setTimeout(Notification.hide, duration);
    }

    static hide() {
        const notif = document.getElementById('notification');
        const fill = notif.querySelector('.progress-fill');
        notif.classList.remove('show');
        fill.style.transition = 'none';
        fill.style.width = '0%';
        clearTimeout(Notification.#TIMEOUT_ID);
    }
}

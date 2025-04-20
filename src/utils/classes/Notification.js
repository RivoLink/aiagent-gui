export default class Notification {

    static #TIMEOUT_ID = null;

    static show(text, duration = 2000) {
        const notif = document.getElementById('notification');
        const msg = notif.querySelector('.notification-message');
        const fill = notif.querySelector('.progress-fill');
  
        msg.textContent = text;
        notif.classList.add('show');
  
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

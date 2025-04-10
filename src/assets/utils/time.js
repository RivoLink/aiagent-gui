const DAYS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export function today() {
    return new Date();
}

export function nowISOString() {
    return (new Date()).toISOString()
}

export function minutesIntervall(strDate1, strDate2 = null, minutes = 1) {
    strDate2 = strDate2 || nowISOString();

    const date1 = new Date(strDate1);
    const date2 = new Date(strDate2);

    return Math.abs(date1 - date2) <= minutes * 60 * 1000;
}

export function areSameDay(strDate1, strDate2 = null) {
    strDate2 = strDate2 || nowISOString();

    const date1 = new Date(strDate1);
    const date2 = new Date(strDate2);

    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

export function formatHM(strDate = null) {
    strDate = strDate || nowISOString();

    const date = new Date(strDate);

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
}

export function formatWM(strDate = null, today = 'Today') {
    strDate = strDate || nowISOString();

    if (today && areSameDay(strDate, nowISOString())) {
        return today;
    }

    const date = new Date(strDate);

    const dayOfWeek = DAYS[date.getDay()];
    const dayOfMonth = date.getDate();
    const monthName = MONTHS[date.getMonth()];

    return `${dayOfWeek} ${dayOfMonth} ${monthName}`;
}

import AiAgent from "./AiAgent";
import { formatHM, formatWM } from "@app/assets/utils/time";

export default class Runnable {

    static runnable_clear(_, callback) {
        callback('Messages cleared.');
    }

    static runnable_retore(_, callback) {
        callback('Messages restored.');
    }

    static runnable_newsession(_, callback) {
        AiAgent.Session.refresh();
        callback('New session start.');
    }

    static runnable_new(_, callback) {
        Runnable.runnable_newsession(_, callback);
    }

    static runnable_today(_, callback) {
        callback(formatWM(null, false));
    }

    static runnable_now(_, callback) {
        callback(`${formatWM(null, false)}, ${formatHM()}`);
    }
}

import Runnable from "./Runnable";

export default class Command {

    static run({action, message}, callback) {
        Runnable[`runnable_${action}`](message, callback);
    }

    static addRunnable(action, runnable) {
        Runnable[`runnable_${action}`] = runnable;
    }

    static isRunnable(action) {
        return (`runnable_${action}` in Runnable);
    }

    static parse(action, message) {
        const regex = /^:(\w+)\s*(.*)$/;
        const match = message.match(regex);

        if (!match) {
            return {isRunnable: false, action, message};
        }
        else {
            const isRunnable = Command.isRunnable(match[1]);
            return {isRunnable, action: match[1], message: match[2]};
        }
    }
}

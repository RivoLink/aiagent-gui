import fleet from 'fleet.js';
import { v4 as uuidv4 } from 'uuid';

export default class AiAgent {

    static #SESSION = uuidv4();

    static URL = import.meta.env.VITE_AIAGENT_URL;
    static TOKEN = import.meta.env.VITE_AIAGENT_TOKEN;

    static send({action, message}, callback) {
        action = action || 'generic';

        const url = AiAgent.#getUrl(action);
        const token = AiAgent.#getToken();

        const data = {
            'text': message,
            'action': action,
            'session': AiAgent.#SESSION,
        }

        const onResponse = (json) => {
            if (json && json.output) {
                callback(json.output);
            } else {
                callback('An error occured.')
            }
        }

        fleet.jsonPost(url, token, data, onResponse, onResponse);
    }

    static #getToken() {
        return AiAgent.TOKEN;
    }

    static #getUrl(action) {
        switch(action) {
            default:
            case 'generic'  : return AiAgent.URL + '/generic';
            case 'chatting' : return AiAgent.URL + '/chat';
            case 'spelling' : return AiAgent.URL + '/lexifix';
            case 'translate': return AiAgent.URL + '/lexifix';
        }
    }

    static Session = class {

        static #BACKUP_KEY  = 'backup_session';
        static #CURRENT_KEY = 'current_session';

        static refresh() {
            AiAgent.#SESSION = uuidv4();
            AiAgent.Session.save();
        }

        static save() {
            fleet.$save(AiAgent.Session.#CURRENT_KEY, AiAgent.#SESSION);
        }

        static load() {
            AiAgent.#SESSION = fleet.$load(AiAgent.Session.#CURRENT_KEY, uuidv4());
            AiAgent.Session.save();
        }

        static backup() {
            fleet.$save(AiAgent.Session.#BACKUP_KEY, AiAgent.#SESSION);
        }

        static restore() {
            AiAgent.#SESSION = fleet.$load(AiAgent.Session.#BACKUP_KEY, uuidv4());
            AiAgent.Session.save();
        }
    };
}

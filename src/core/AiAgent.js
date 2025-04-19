import fleet from 'fleet.js';

export default class AiAgent {

    static URL = import.meta.env.VITE_AIAGENT_URL;
    static TOKEN = import.meta.env.VITE_AIAGENT_TOKEN;
    
    static send({action, message}, callback) {
        action = action || 'chatting';

        const url = AiAgent.#getUrl(action);
        const token = AiAgent.#getToken();

        const data = {
            'text': message,
            'action': action,
        }

        const onResponse = (json) => {
            if (json && json.output) {
                callback(json.output);
            } else {
                callback('An error occured.')
            }
        }

        fleet.ajaxPost(url, token, data, onResponse, onResponse);
    }

    static #getToken() {
        return AiAgent.TOKEN;
    }

    static #getUrl(action) {
        switch(action) {
            default:
            case 'chatting' : return AiAgent.URL + '/chat';
            case 'spelling' : return AiAgent.URL + '/lexifix';
            case 'translate': return AiAgent.URL + '/lexifix';
        }
    }
}

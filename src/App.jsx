import './App.css';

function App() {

    const autoResize = function(){
        const textarea = document.getElementById('txt');
        textarea.style.height = 'auto'; 
        textarea.style.height = (textarea.scrollHeight - 12) + 'px';
    }

    return (
        <>
            <div class="header-container">
                <div class="header-left">
                    <div class="header-avatar">AiA</div>
                    <div class="header-info">
                        <h2>Ai Agent</h2>
                        <div class="status">An AI assistant for instant, intelligent support.</div>
                    </div>
                </div>
                <div class="header-actions">
                    <svg viewBox="0 0 24 24" fill="none" width="24px" height="24px">
                        <path d="M13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6C12.5523 6 13 5.55228 13 5Z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        <path d="M13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12Z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        <path d="M13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19Z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </div>
            </div>

            <div class="chat-messages">
                <div class="date-divider">
                    <span>Today</span>
                </div>
                
                <div class="message-group">
                    <div class="message-container">
                        <div class="avatar"></div>
                        <div class="message received">
                            <div class="message-content">
                                Hey! I'm Ai Agent. <br/>
                                An AI assistant for instant, intelligent support. <br/>
                                How are you doing today?
                            </div>
                            <div class="message-time">10:15 AM</div>
                        </div>
                    </div>
                </div>
                
                <div class="message-group">
                    <div class="message-container sent">
                        <div class="message sent">
                            <div class="message-content">
                                Hi, Ai Agent! I'm doing great, thanks for asking.
                            </div>
                            <div class="message-time">10:17 AM <span class="message-status">✓✓</span></div>
                        </div>
                    </div>
                    
                    <div class="message-container sent">
                        <div class="message sent">
                            <div class="message-content">
                                I was wondering if you could help me brainstorm some ideas for a new hobby.
                            </div>
                            <div class="message-time">10:17 AM <span class="message-status">✓✓</span></div>
                        </div>
                    </div>
                </div>

                <div class="message-group">
                    <div class="message-container">
                        <div class="avatar"></div>
                        <div class="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="input-container">
                <div class="chat-input">
                    <textarea id="txt" onInput={autoResize} type="text" rows="1" placeholder="Your message"></textarea>
                    <div class="send">
                        <svg viewBox="0 0 24 24" fill="none" width="30px" height="30px">
                            <path d="M8.46997 13.4599L12 9.93994L15.53 13.4599" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </div>
                    <div class="tail">
                        <div class="front"></div>
                        <div class="back"></div>
                    </div>
                </div>
                <div class="options-input">
                    <div class="option">
                        <svg viewBox="0 0 24 24" fill="none" width="30px" height="30px">
                            <path d="M8 12H16" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            <path d="M12 16V8" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </>
    )
}

export default App;

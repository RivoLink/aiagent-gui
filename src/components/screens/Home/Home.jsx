import React, { useEffect, useState, useRef } from 'react';

import AiAgent from '@app/core/AiAgent';
import Command from '@app/core/Command';

import fleet from 'fleet.js';
import classNames from 'classnames';

import Message from '@app/components/common/Message/Message';
import Divider from '@app/components/common/Divider/Divider';
import Notification from '@app/components/common/Notification/Notification';

import {
    areSameDay,
    minutesIntervall,
    nowISOString,
} from '@app/assets/utils/time';

import './Home.css';

function Home() {
    const scrollRef = useRef(null);

    const savedAction = fleet.$load('action');
    const savedMessages = fleet.$load('messages', []);

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(savedMessages);

    const [action, setAction] = useState(savedAction);
    const [showFabs, setShowFabs] = useState(false);

    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState(0);

    Command.addRunnable('clear', () => {
        AiAgent.Session.backup();
        AiAgent.Session.refresh();

        fleet.$save('backup', fleet.$load('messages'));
        setMessages([]);
    });

    Command.addRunnable('restore', () => {
        AiAgent.Session.restore();

        const backup = fleet.$load('backup', []);
        setMessages(backup);
    })

    const sendMessage = () => {
        if (!message || !message.trim()) {
            return;
        }

        const newMessages = [...messages];
        const last = messages.pop();

        if (!last || !areSameDay(last.date)) {
            newMessages.push({
                date: nowISOString(),
                isDivider: true
            });
        }

        newMessages.push({
            text: message,
            date: nowISOString(),
            fromAiA: false
        });

        setMessage('');
        setMessages(newMessages);

        const command = Command.parse(
            action,
            message,
        );

        if (command.isRunnable) {
            Command.run(command, (output) => {
                if (!output) return;

                const data = {
                    text: output,
                    date: nowISOString(),
                    fromAiA: true
                }

                setMessages(prev => [...prev, data]);
            });
        }
        else {
            setLoading(true);
            setRequests(prev => prev + 1);

            AiAgent.send(command, (response) => {
                const data = {
                    text: response,
                    date: nowISOString(),
                    fromAiA: true
                }

                setRequests(prev => prev - 1);
                setMessages(prev => [...prev, data]);
            })
        }
    }

    const toggleFabButtons = function(show){
        if (show == undefined) {
            setShowFabs(prev => !prev);
        } else {
            setShowFabs(show);
        }
    }

    const handleClick = ({target = {}}) => {
        switch (target.id || target.parentElement?.id) {
            case 'fabX':
                toggleFabButtons();
                break;
            case 'fab1':
            case 'fab2':
            case 'fab3':
                setAction(fleet.getData(target, 'action'));
                toggleFabButtons(false);
                break;
            default:
                toggleFabButtons(false);
                break;
        }
    };

    const onMessage = (e) => {
        setMessage(e.target.value);
    }

    const onSend = () => {
        sendMessage();
    }

    const onEnter = (e) => {
        if ((e.key == 'Enter') && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    useEffect(() => {
        const textarea = fleet.find('message');
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight - 12) + 'px';
    }, [message]);

    useEffect(() => {
        fleet.$save('action', action);
    }, [action]);

    useEffect(() => {
        if (requests == 0) {
            setLoading(false);
        }
    }, [requests]);

    useEffect(() => {
        fleet.$save('messages', messages);

        scrollRef.current?.scrollIntoView({
            behavior: 'smooth'
        });
    }, [messages]);

    useEffect(() => {
        fleet.addEvent(document, 'click', handleClick)

        return () => {
            fleet.removeEvent(document, 'click', handleClick)
        };
    });

    const getMessageGroups = () => {
        let groups = [];
        let current = null;

        const areSameGroup = (msg1, msg2) => {
            return (
                (msg1 && msg2) &&
                (msg1.fromAiA == msg2.fromAiA)
            );
        }

        messages.forEach((message, i) => {
            if (message.isDivider){
                current = {
                    isDivider: true,
                    message: message,
                };

                groups.push(current);
                return null;
            }

            const sameGroup = areSameGroup(message, current);
            const minutesInter = minutesIntervall(message.date, current?.lastDate);

            if (!sameGroup || !minutesInter){
                current = {
                    fromAiA: message.fromAiA,
                    messages: [message],
                    lastDate: message.date,
                };
                groups.push(current);
            } else {
                current.messages.push(message);
                current.lastDate = message.date;
            }

            if ((i + 1) == messages.length) {
                current.last = true;
            }
        });

        return groups;
    }

    return (
        <>
            <div className="header-container">
                <div className="header-left">
                    <div className="header-avatar">AiA</div>
                    <div className="header-info">
                        <h2>Ai Agent</h2>
                        <div className="status">An AI assistant for instant, intelligent support.</div>
                    </div>
                </div>
                <div className="header-actions">
                    <svg viewBox="0 0 24 24" fill="none" width="24px" height="24px">
                        <path d="M13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6C12.5523 6 13 5.55228 13 5Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </div>
            </div>

            <div className="notification-container">
                <Notification />
            </div>

            <div className="chat-messages">
                {getMessageGroups().map((group, grpKey) => {
                    if (group.isDivider) return (
                        <Divider key={grpKey} message={group.message}/>
                    )

                    const lastAiA = loading && group.last && group.fromAiA;

                    return (
                        <div key={grpKey} className={classNames("message-group", {"last-aia": lastAiA})}>
                            {group.messages.map((message, msgKey) => (
                                <Message key={msgKey} group={group} message={message}/>
                            ))}
                        </div>
                    )
                })}

                {loading && (
                    <div className="message-group">
                        <div className="message-container">
                            <div className="avatar"></div>
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={scrollRef} />
            </div>

            <div className="input-container">
                <div className="chat-input">
                    <textarea id="message" type="text" rows="1" placeholder="Your message"
                        value={message}
                        onChange={onMessage}
                        onKeyDown={onEnter}
                    />
                    <div id="send" className="send" onClick={onSend}>
                        <svg viewBox="0 0 24 24" fill="none" width="30px" height="30px">
                            <path d="M8.46997 13.4599L12 9.93994L15.53 13.4599" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                    </div>
                    <div className="tail">
                        <div className="front"></div>
                        <div className="back"></div>
                    </div>
                </div>
                <div className="options-input">
                    <div className="fabs-container">
                        <div className={classNames("inner-fabs", {"show": showFabs})}>
                            <div className="fab" id="fab3" data-tooltip="Chatting" data-action="chatting">
                                <svg viewBox="0 0 24 24" fill="none" width="28px" height="28px" stroke="#fff" strokeWidth="0.4">
                                    <path fill="#fff" d="M13.0867 21.3877L13.7321 21.7697L13.0867 21.3877ZM13.6288 20.4718L12.9833 20.0898L13.6288 20.4718ZM10.3712 20.4718L9.72579 20.8539H9.72579L10.3712 20.4718ZM10.9133 21.3877L11.5587 21.0057L10.9133 21.3877ZM2.3806 15.9134L3.07351 15.6264V15.6264L2.3806 15.9134ZM7.78958 18.9915L7.77666 19.7413L7.78958 18.9915ZM5.08658 18.6194L4.79957 19.3123H4.79957L5.08658 18.6194ZM21.6194 15.9134L22.3123 16.2004V16.2004L21.6194 15.9134ZM16.2104 18.9915L16.1975 18.2416L16.2104 18.9915ZM18.9134 18.6194L19.2004 19.3123H19.2004L18.9134 18.6194ZM19.6125 2.7368L19.2206 3.37628L19.6125 2.7368ZM21.2632 4.38751L21.9027 3.99563V3.99563L21.2632 4.38751ZM4.38751 2.7368L3.99563 2.09732V2.09732L4.38751 2.7368ZM2.7368 4.38751L2.09732 3.99563H2.09732L2.7368 4.38751ZM9.40279 19.2098L9.77986 18.5615L9.77986 18.5615L9.40279 19.2098ZM13.7321 21.7697L14.2742 20.8539L12.9833 20.0898L12.4412 21.0057L13.7321 21.7697ZM9.72579 20.8539L10.2679 21.7697L11.5587 21.0057L11.0166 20.0898L9.72579 20.8539ZM12.4412 21.0057C12.2485 21.3313 11.7515 21.3313 11.5587 21.0057L10.2679 21.7697C11.0415 23.0767 12.9585 23.0767 13.7321 21.7697L12.4412 21.0057ZM10.5 2.75H13.5V1.25H10.5V2.75ZM21.25 10.5V11.5H22.75V10.5H21.25ZM2.75 11.5V10.5H1.25V11.5H2.75ZM1.25 11.5C1.25 12.6546 1.24959 13.5581 1.29931 14.2868C1.3495 15.0223 1.45323 15.6344 1.68769 16.2004L3.07351 15.6264C2.92737 15.2736 2.84081 14.8438 2.79584 14.1847C2.75041 13.5189 2.75 12.6751 2.75 11.5H1.25ZM7.8025 18.2416C6.54706 18.2199 5.88923 18.1401 5.37359 17.9265L4.79957 19.3123C5.60454 19.6457 6.52138 19.7197 7.77666 19.7413L7.8025 18.2416ZM1.68769 16.2004C2.27128 17.6093 3.39066 18.7287 4.79957 19.3123L5.3736 17.9265C4.33223 17.4951 3.50486 16.6678 3.07351 15.6264L1.68769 16.2004ZM21.25 11.5C21.25 12.6751 21.2496 13.5189 21.2042 14.1847C21.1592 14.8438 21.0726 15.2736 20.9265 15.6264L22.3123 16.2004C22.5468 15.6344 22.6505 15.0223 22.7007 14.2868C22.7504 13.5581 22.75 12.6546 22.75 11.5H21.25ZM16.2233 19.7413C17.4786 19.7197 18.3955 19.6457 19.2004 19.3123L18.6264 17.9265C18.1108 18.1401 17.4529 18.2199 16.1975 18.2416L16.2233 19.7413ZM20.9265 15.6264C20.4951 16.6678 19.6678 17.4951 18.6264 17.9265L19.2004 19.3123C20.6093 18.7287 21.7287 17.6093 22.3123 16.2004L20.9265 15.6264ZM13.5 2.75C15.1512 2.75 16.337 2.75079 17.2619 2.83873C18.1757 2.92561 18.7571 3.09223 19.2206 3.37628L20.0044 2.09732C19.2655 1.64457 18.4274 1.44279 17.4039 1.34547C16.3915 1.24921 15.1222 1.25 13.5 1.25V2.75ZM22.75 10.5C22.75 8.87781 22.7508 7.6085 22.6545 6.59611C22.5572 5.57256 22.3554 4.73445 21.9027 3.99563L20.6237 4.77938C20.9078 5.24291 21.0744 5.82434 21.1613 6.73809C21.2492 7.663 21.25 8.84876 21.25 10.5H22.75ZM19.2206 3.37628C19.7925 3.72672 20.2733 4.20752 20.6237 4.77938L21.9027 3.99563C21.4286 3.22194 20.7781 2.57144 20.0044 2.09732L19.2206 3.37628ZM10.5 1.25C8.87781 1.25 7.6085 1.24921 6.59611 1.34547C5.57256 1.44279 4.73445 1.64457 3.99563 2.09732L4.77938 3.37628C5.24291 3.09223 5.82434 2.92561 6.73809 2.83873C7.663 2.75079 8.84876 2.75 10.5 2.75V1.25ZM2.75 10.5C2.75 8.84876 2.75079 7.663 2.83873 6.73809C2.92561 5.82434 3.09223 5.24291 3.37628 4.77938L2.09732 3.99563C1.64457 4.73445 1.44279 5.57256 1.34547 6.59611C1.24921 7.6085 1.25 8.87781 1.25 10.5H2.75ZM3.99563 2.09732C3.22194 2.57144 2.57144 3.22194 2.09732 3.99563L3.37628 4.77938C3.72672 4.20752 4.20752 3.72672 4.77938 3.37628L3.99563 2.09732ZM11.0166 20.0898C10.8136 19.7468 10.6354 19.4441 10.4621 19.2063C10.2795 18.9559 10.0702 18.7304 9.77986 18.5615L9.02572 19.8582C9.07313 19.8857 9.13772 19.936 9.24985 20.0898C9.37122 20.2564 9.50835 20.4865 9.72579 20.8539L11.0166 20.0898ZM7.77666 19.7413C8.21575 19.7489 8.49387 19.7545 8.70588 19.7779C8.90399 19.7999 8.98078 19.832 9.02572 19.8582L9.77986 18.5615C9.4871 18.3912 9.18246 18.3215 8.87097 18.287C8.57339 18.2541 8.21375 18.2487 7.8025 18.2416L7.77666 19.7413ZM14.2742 20.8539C14.4916 20.4865 14.6287 20.2564 14.7501 20.0898C14.8622 19.936 14.9268 19.8857 14.9742 19.8582L14.2201 18.5615C13.9298 18.7304 13.7204 18.9559 13.5379 19.2063C13.3646 19.4441 13.1864 19.7468 12.9833 20.0898L14.2742 20.8539ZM16.1975 18.2416C15.7862 18.2487 15.4266 18.2541 15.129 18.287C14.8175 18.3215 14.5129 18.3912 14.2201 18.5615L14.9742 19.8582C15.0192 19.832 15.096 19.7999 15.2941 19.7779C15.5061 19.7545 15.7842 19.7489 16.2233 19.7413L16.1975 18.2416Z"></path>
                                    <path d="M8 11H8.009M11.991 11H12M15.991 11H16" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </div>
                            <div className="fab" id="fab2" data-tooltip="Spelling" data-action="spelling">
                                <svg viewBox="0 0 32 32" fill="#fff" width="24px" height="24px" stroke="#fff" strokeWidth="0.6">
                                    <path d="M14.275 15.8h0.575c0 0 0.001 0 0.001 0 0.441 0 0.799-0.358 0.799-0.799 0-0.124-0.028-0.241-0.078-0.346l0.002 0.005-6.108-13c-0.131-0.274-0.405-0.46-0.723-0.46-0 0-0 0-0 0h-0.632c-0 0-0 0-0 0-0.318 0-0.593 0.186-0.721 0.455l-0.002 0.005-6.11 13c-0.048 0.1-0.076 0.217-0.076 0.341 0 0.441 0.358 0.799 0.799 0.799 0 0 0.001 0 0.001 0h0.576c0.318-0 0.593-0.186 0.723-0.455l0.002-0.005 1.325-2.827h7.584l1.343 2.83c0.132 0.272 0.405 0.457 0.723 0.457h0zM5.62 10.375l2.804-5.94 2.79 5.94zM17.537 15.8h6.369c0.070 0.004 0.151 0.006 0.233 0.006 1.187 0 2.269-0.451 3.084-1.19l-0.004 0.003c0.765-0.72 1.241-1.74 1.241-2.87 0-0.026-0-0.051-0.001-0.077l0 0.004c0-0.013 0-0.028 0-0.044 0-0.97-0.339-1.861-0.905-2.561l0.006 0.008c-0.263-0.328-0.568-0.608-0.911-0.836l-0.015-0.009c0.184-0.18 0.35-0.376 0.495-0.588l0.009-0.013c0.455-0.655 0.727-1.468 0.727-2.343 0-0.014-0-0.028-0-0.042l0 0.002c0-0.014 0-0.032 0-0.049 0-1.119-0.477-2.127-1.24-2.831l-0.003-0.002c-0.813-0.729-1.892-1.174-3.075-1.174-0.083 0-0.165 0.002-0.247 0.006l0.011-0h-5.775c-0.442 0-0.8 0.358-0.8 0.8v13c0 0.442 0.358 0.8 0.8 0.8h0zM25.164 6.746c-0.29 0.357-0.729 0.584-1.221 0.584-0.020 0-0.040-0-0.060-0.001l0.003 0h-5.012v-3.99h4.418c0.059-0.005 0.128-0.008 0.197-0.008 0.619 0 1.186 0.219 1.629 0.584l-0.004-0.003c0.363 0.322 0.59 0.79 0.59 1.31 0 0.016-0 0.032-0.001 0.049l0-0.002c0 0.011 0 0.023 0 0.035 0 0.553-0.205 1.059-0.544 1.445l0.002-0.003zM25.674 10.108c0.386 0.39 0.625 0.926 0.625 1.519 0 0.011-0 0.021-0 0.032l0-0.002c0 0.015 0.001 0.033 0.001 0.051 0 0.539-0.229 1.024-0.595 1.363l-0.001 0.001c-0.431 0.371-0.995 0.597-1.613 0.597-0.072 0-0.142-0.003-0.213-0.009l0.009 0.001h-5.012v-4.195h5.031c0.050-0.004 0.109-0.006 0.168-0.006 0.622 0 1.186 0.247 1.6 0.648l-0.001-0.001zM30.75 16.078c-0.221-0.204-0.518-0.328-0.844-0.328-0.365 0-0.693 0.156-0.921 0.406l-0.001 0.001-10.981 12.002-3.030-3.008c-0.226-0.224-0.537-0.363-0.881-0.363-0.69 0-1.25 0.56-1.25 1.25 0 0.347 0.141 0.66 0.369 0.887l3.954 3.926 0.022 0.015 0.015 0.021c0.074 0.061 0.159 0.114 0.25 0.156l0.007 0.003c0.037 0.026 0.079 0.053 0.123 0.077l0.007 0.003c0.135 0.056 0.292 0.089 0.457 0.089 0.175 0 0.341-0.037 0.491-0.103l-0.008 0.003c0.051-0.030 0.095-0.060 0.136-0.091l-0.003 0.002c0.103-0.051 0.192-0.111 0.271-0.181l-0.001 0.001 0.015-0.023 0.020-0.014 11.859-12.963c0.204-0.221 0.328-0.518 0.328-0.844 0-0.365-0.156-0.693-0.406-0.921l-0.001-0.001z"></path>
                                </svg>
                            </div>
                            <div className="fab" id="fab1" data-tooltip="Translate" data-action="translate">
                                <svg viewBox="0 0 24 24" fill="none" width="30px" height="30px">
                                    <path fill="#fff" d="M8.93 2H5.02C3 2 2 3 2 5.02V8.94C2 11 3 12 5.02 11.95H8.94C11 12 12 11 11.95 8.93V5.02C12 3 11 2 8.93 2ZM9.01 9.76C8.33 9.76 7.67 9.5 7.12 9.04C6.5 9.49 5.75 9.76 4.94 9.76C4.53 9.76 4.19 9.42 4.19 9.01C4.19 8.6 4.53 8.26 4.94 8.26C5.96 8.26 6.81 7.56 7.12 6.6H4.94C4.53 6.6 4.19 6.26 4.19 5.85C4.19 5.44 4.53 5.1 4.94 5.1H6.23C6.27 4.72 6.58 4.42 6.97 4.42C7.36 4.42 7.67 4.72 7.71 5.1H7.97C7.98 5.1 7.99 5.1 7.99 5.1H8.01H9C9.41 5.1 9.75 5.44 9.75 5.85C9.75 6.26 9.42 6.6 9 6.6H8.67C8.58 7.08 8.39 7.53 8.14 7.94C8.41 8.14 8.7 8.26 9.01 8.26C9.42 8.26 9.76 8.6 9.76 9.01C9.76 9.42 9.42 9.76 9.01 9.76Z"></path>
                                    <path fill="#fff" d="M9 22.75C4.73 22.75 1.25 19.27 1.25 15C1.25 14.59 1.59 14.25 2 14.25C2.41 14.25 2.75 14.59 2.75 15C2.75 17.96 4.81 20.44 7.58 21.09L7.31 20.64C7.1 20.28 7.21 19.82 7.57 19.61C7.92 19.4 8.39 19.51 8.6 19.87L9.65 21.62C9.79 21.85 9.79 22.14 9.66 22.37C9.52 22.6 9.27 22.75 9 22.75Z"></path>
                                    <path fill="#fff" d="M21.9985 9.75C21.5885 9.75 21.2485 9.41 21.2485 9C21.2485 6.04 19.1885 3.56 16.4185 2.91L16.6885 3.36C16.8985 3.72 16.7885 4.18 16.4285 4.39C16.0785 4.6 15.6085 4.49 15.3985 4.13L14.3485 2.38C14.2085 2.15 14.2085 1.86 14.3385 1.63C14.4785 1.4 14.7285 1.25 14.9985 1.25C19.2685 1.25 22.7485 4.73 22.7485 9C22.7485 9.41 22.4085 9.75 21.9985 9.75Z"></path>
                                    <path fill="#fff" d="M16.9198 11.8516C14.1198 11.8516 11.8398 14.1216 11.8398 16.9316C11.8398 19.7316 14.1098 22.0116 16.9198 22.0116C19.7198 22.0116 21.9998 19.7416 21.9998 16.9316C21.9998 14.1216 19.7298 11.8516 16.9198 11.8516ZM19.3998 19.3416C19.0298 19.5216 18.5798 19.3816 18.3898 19.0016L18.2198 18.6616H15.6298L15.4598 19.0016C15.3298 19.2616 15.0598 19.4116 14.7898 19.4116C14.6798 19.4116 14.5598 19.3816 14.4598 19.3316C14.0898 19.1416 13.9398 18.6916 14.1198 18.3216L16.2598 14.0516C16.3898 13.8016 16.6498 13.6416 16.9298 13.6416C17.2098 13.6416 17.4698 13.8016 17.5998 14.0616L19.7398 18.3316C19.9198 18.7016 19.7698 19.1516 19.3998 19.3416Z"></path>
                                    <path fill="#fff" d="M16.3789 17.1603H17.4689L16.9189 16.0703L16.3789 17.1603Z"></path>
                                </svg>
                            </div>
                            <div className="d-none" id="fab0">
                                <svg viewBox="0 0 24 24" fill="none" width="30px" height="30px">
                                    <path d="M8 12H16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M12 16V8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </div>
                        </div>
                        <div className="fab fabX" id="fabX">
                            {!action && (
                                <svg viewBox="0 0 24 24" fill="none" width="30px" height="30px" className="default">
                                    <path d="M8 12H16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M12 16V8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            )}
                            {(action == 'chatting') && (
                                <svg viewBox="0 0 24 24" fill="none" width="28px" height="28px" stroke="#fff" strokeWidth="0.4">
                                    <path fill="#fff" d="M13.0867 21.3877L13.7321 21.7697L13.0867 21.3877ZM13.6288 20.4718L12.9833 20.0898L13.6288 20.4718ZM10.3712 20.4718L9.72579 20.8539H9.72579L10.3712 20.4718ZM10.9133 21.3877L11.5587 21.0057L10.9133 21.3877ZM2.3806 15.9134L3.07351 15.6264V15.6264L2.3806 15.9134ZM7.78958 18.9915L7.77666 19.7413L7.78958 18.9915ZM5.08658 18.6194L4.79957 19.3123H4.79957L5.08658 18.6194ZM21.6194 15.9134L22.3123 16.2004V16.2004L21.6194 15.9134ZM16.2104 18.9915L16.1975 18.2416L16.2104 18.9915ZM18.9134 18.6194L19.2004 19.3123H19.2004L18.9134 18.6194ZM19.6125 2.7368L19.2206 3.37628L19.6125 2.7368ZM21.2632 4.38751L21.9027 3.99563V3.99563L21.2632 4.38751ZM4.38751 2.7368L3.99563 2.09732V2.09732L4.38751 2.7368ZM2.7368 4.38751L2.09732 3.99563H2.09732L2.7368 4.38751ZM9.40279 19.2098L9.77986 18.5615L9.77986 18.5615L9.40279 19.2098ZM13.7321 21.7697L14.2742 20.8539L12.9833 20.0898L12.4412 21.0057L13.7321 21.7697ZM9.72579 20.8539L10.2679 21.7697L11.5587 21.0057L11.0166 20.0898L9.72579 20.8539ZM12.4412 21.0057C12.2485 21.3313 11.7515 21.3313 11.5587 21.0057L10.2679 21.7697C11.0415 23.0767 12.9585 23.0767 13.7321 21.7697L12.4412 21.0057ZM10.5 2.75H13.5V1.25H10.5V2.75ZM21.25 10.5V11.5H22.75V10.5H21.25ZM2.75 11.5V10.5H1.25V11.5H2.75ZM1.25 11.5C1.25 12.6546 1.24959 13.5581 1.29931 14.2868C1.3495 15.0223 1.45323 15.6344 1.68769 16.2004L3.07351 15.6264C2.92737 15.2736 2.84081 14.8438 2.79584 14.1847C2.75041 13.5189 2.75 12.6751 2.75 11.5H1.25ZM7.8025 18.2416C6.54706 18.2199 5.88923 18.1401 5.37359 17.9265L4.79957 19.3123C5.60454 19.6457 6.52138 19.7197 7.77666 19.7413L7.8025 18.2416ZM1.68769 16.2004C2.27128 17.6093 3.39066 18.7287 4.79957 19.3123L5.3736 17.9265C4.33223 17.4951 3.50486 16.6678 3.07351 15.6264L1.68769 16.2004ZM21.25 11.5C21.25 12.6751 21.2496 13.5189 21.2042 14.1847C21.1592 14.8438 21.0726 15.2736 20.9265 15.6264L22.3123 16.2004C22.5468 15.6344 22.6505 15.0223 22.7007 14.2868C22.7504 13.5581 22.75 12.6546 22.75 11.5H21.25ZM16.2233 19.7413C17.4786 19.7197 18.3955 19.6457 19.2004 19.3123L18.6264 17.9265C18.1108 18.1401 17.4529 18.2199 16.1975 18.2416L16.2233 19.7413ZM20.9265 15.6264C20.4951 16.6678 19.6678 17.4951 18.6264 17.9265L19.2004 19.3123C20.6093 18.7287 21.7287 17.6093 22.3123 16.2004L20.9265 15.6264ZM13.5 2.75C15.1512 2.75 16.337 2.75079 17.2619 2.83873C18.1757 2.92561 18.7571 3.09223 19.2206 3.37628L20.0044 2.09732C19.2655 1.64457 18.4274 1.44279 17.4039 1.34547C16.3915 1.24921 15.1222 1.25 13.5 1.25V2.75ZM22.75 10.5C22.75 8.87781 22.7508 7.6085 22.6545 6.59611C22.5572 5.57256 22.3554 4.73445 21.9027 3.99563L20.6237 4.77938C20.9078 5.24291 21.0744 5.82434 21.1613 6.73809C21.2492 7.663 21.25 8.84876 21.25 10.5H22.75ZM19.2206 3.37628C19.7925 3.72672 20.2733 4.20752 20.6237 4.77938L21.9027 3.99563C21.4286 3.22194 20.7781 2.57144 20.0044 2.09732L19.2206 3.37628ZM10.5 1.25C8.87781 1.25 7.6085 1.24921 6.59611 1.34547C5.57256 1.44279 4.73445 1.64457 3.99563 2.09732L4.77938 3.37628C5.24291 3.09223 5.82434 2.92561 6.73809 2.83873C7.663 2.75079 8.84876 2.75 10.5 2.75V1.25ZM2.75 10.5C2.75 8.84876 2.75079 7.663 2.83873 6.73809C2.92561 5.82434 3.09223 5.24291 3.37628 4.77938L2.09732 3.99563C1.64457 4.73445 1.44279 5.57256 1.34547 6.59611C1.24921 7.6085 1.25 8.87781 1.25 10.5H2.75ZM3.99563 2.09732C3.22194 2.57144 2.57144 3.22194 2.09732 3.99563L3.37628 4.77938C3.72672 4.20752 4.20752 3.72672 4.77938 3.37628L3.99563 2.09732ZM11.0166 20.0898C10.8136 19.7468 10.6354 19.4441 10.4621 19.2063C10.2795 18.9559 10.0702 18.7304 9.77986 18.5615L9.02572 19.8582C9.07313 19.8857 9.13772 19.936 9.24985 20.0898C9.37122 20.2564 9.50835 20.4865 9.72579 20.8539L11.0166 20.0898ZM7.77666 19.7413C8.21575 19.7489 8.49387 19.7545 8.70588 19.7779C8.90399 19.7999 8.98078 19.832 9.02572 19.8582L9.77986 18.5615C9.4871 18.3912 9.18246 18.3215 8.87097 18.287C8.57339 18.2541 8.21375 18.2487 7.8025 18.2416L7.77666 19.7413ZM14.2742 20.8539C14.4916 20.4865 14.6287 20.2564 14.7501 20.0898C14.8622 19.936 14.9268 19.8857 14.9742 19.8582L14.2201 18.5615C13.9298 18.7304 13.7204 18.9559 13.5379 19.2063C13.3646 19.4441 13.1864 19.7468 12.9833 20.0898L14.2742 20.8539ZM16.1975 18.2416C15.7862 18.2487 15.4266 18.2541 15.129 18.287C14.8175 18.3215 14.5129 18.3912 14.2201 18.5615L14.9742 19.8582C15.0192 19.832 15.096 19.7999 15.2941 19.7779C15.5061 19.7545 15.7842 19.7489 16.2233 19.7413L16.1975 18.2416Z"></path>
                                    <path d="M8 11H8.009M11.991 11H12M15.991 11H16" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            )}
                            {(action == 'spelling') && (
                                <svg viewBox="0 0 32 32" fill="#fff" width="24px" height="24px" stroke="#fff" strokeWidth="0.6">
                                    <path d="M14.275 15.8h0.575c0 0 0.001 0 0.001 0 0.441 0 0.799-0.358 0.799-0.799 0-0.124-0.028-0.241-0.078-0.346l0.002 0.005-6.108-13c-0.131-0.274-0.405-0.46-0.723-0.46-0 0-0 0-0 0h-0.632c-0 0-0 0-0 0-0.318 0-0.593 0.186-0.721 0.455l-0.002 0.005-6.11 13c-0.048 0.1-0.076 0.217-0.076 0.341 0 0.441 0.358 0.799 0.799 0.799 0 0 0.001 0 0.001 0h0.576c0.318-0 0.593-0.186 0.723-0.455l0.002-0.005 1.325-2.827h7.584l1.343 2.83c0.132 0.272 0.405 0.457 0.723 0.457h0zM5.62 10.375l2.804-5.94 2.79 5.94zM17.537 15.8h6.369c0.070 0.004 0.151 0.006 0.233 0.006 1.187 0 2.269-0.451 3.084-1.19l-0.004 0.003c0.765-0.72 1.241-1.74 1.241-2.87 0-0.026-0-0.051-0.001-0.077l0 0.004c0-0.013 0-0.028 0-0.044 0-0.97-0.339-1.861-0.905-2.561l0.006 0.008c-0.263-0.328-0.568-0.608-0.911-0.836l-0.015-0.009c0.184-0.18 0.35-0.376 0.495-0.588l0.009-0.013c0.455-0.655 0.727-1.468 0.727-2.343 0-0.014-0-0.028-0-0.042l0 0.002c0-0.014 0-0.032 0-0.049 0-1.119-0.477-2.127-1.24-2.831l-0.003-0.002c-0.813-0.729-1.892-1.174-3.075-1.174-0.083 0-0.165 0.002-0.247 0.006l0.011-0h-5.775c-0.442 0-0.8 0.358-0.8 0.8v13c0 0.442 0.358 0.8 0.8 0.8h0zM25.164 6.746c-0.29 0.357-0.729 0.584-1.221 0.584-0.020 0-0.040-0-0.060-0.001l0.003 0h-5.012v-3.99h4.418c0.059-0.005 0.128-0.008 0.197-0.008 0.619 0 1.186 0.219 1.629 0.584l-0.004-0.003c0.363 0.322 0.59 0.79 0.59 1.31 0 0.016-0 0.032-0.001 0.049l0-0.002c0 0.011 0 0.023 0 0.035 0 0.553-0.205 1.059-0.544 1.445l0.002-0.003zM25.674 10.108c0.386 0.39 0.625 0.926 0.625 1.519 0 0.011-0 0.021-0 0.032l0-0.002c0 0.015 0.001 0.033 0.001 0.051 0 0.539-0.229 1.024-0.595 1.363l-0.001 0.001c-0.431 0.371-0.995 0.597-1.613 0.597-0.072 0-0.142-0.003-0.213-0.009l0.009 0.001h-5.012v-4.195h5.031c0.050-0.004 0.109-0.006 0.168-0.006 0.622 0 1.186 0.247 1.6 0.648l-0.001-0.001zM30.75 16.078c-0.221-0.204-0.518-0.328-0.844-0.328-0.365 0-0.693 0.156-0.921 0.406l-0.001 0.001-10.981 12.002-3.030-3.008c-0.226-0.224-0.537-0.363-0.881-0.363-0.69 0-1.25 0.56-1.25 1.25 0 0.347 0.141 0.66 0.369 0.887l3.954 3.926 0.022 0.015 0.015 0.021c0.074 0.061 0.159 0.114 0.25 0.156l0.007 0.003c0.037 0.026 0.079 0.053 0.123 0.077l0.007 0.003c0.135 0.056 0.292 0.089 0.457 0.089 0.175 0 0.341-0.037 0.491-0.103l-0.008 0.003c0.051-0.030 0.095-0.060 0.136-0.091l-0.003 0.002c0.103-0.051 0.192-0.111 0.271-0.181l-0.001 0.001 0.015-0.023 0.020-0.014 11.859-12.963c0.204-0.221 0.328-0.518 0.328-0.844 0-0.365-0.156-0.693-0.406-0.921l-0.001-0.001z"></path>
                                </svg>
                            )}
                            {(action == 'translate') && (
                                <svg viewBox="0 0 24 24" fill="none" width="30px" height="30px">
                                    <path fill="#fff" d="M8.93 2H5.02C3 2 2 3 2 5.02V8.94C2 11 3 12 5.02 11.95H8.94C11 12 12 11 11.95 8.93V5.02C12 3 11 2 8.93 2ZM9.01 9.76C8.33 9.76 7.67 9.5 7.12 9.04C6.5 9.49 5.75 9.76 4.94 9.76C4.53 9.76 4.19 9.42 4.19 9.01C4.19 8.6 4.53 8.26 4.94 8.26C5.96 8.26 6.81 7.56 7.12 6.6H4.94C4.53 6.6 4.19 6.26 4.19 5.85C4.19 5.44 4.53 5.1 4.94 5.1H6.23C6.27 4.72 6.58 4.42 6.97 4.42C7.36 4.42 7.67 4.72 7.71 5.1H7.97C7.98 5.1 7.99 5.1 7.99 5.1H8.01H9C9.41 5.1 9.75 5.44 9.75 5.85C9.75 6.26 9.42 6.6 9 6.6H8.67C8.58 7.08 8.39 7.53 8.14 7.94C8.41 8.14 8.7 8.26 9.01 8.26C9.42 8.26 9.76 8.6 9.76 9.01C9.76 9.42 9.42 9.76 9.01 9.76Z"></path>
                                    <path fill="#fff" d="M9 22.75C4.73 22.75 1.25 19.27 1.25 15C1.25 14.59 1.59 14.25 2 14.25C2.41 14.25 2.75 14.59 2.75 15C2.75 17.96 4.81 20.44 7.58 21.09L7.31 20.64C7.1 20.28 7.21 19.82 7.57 19.61C7.92 19.4 8.39 19.51 8.6 19.87L9.65 21.62C9.79 21.85 9.79 22.14 9.66 22.37C9.52 22.6 9.27 22.75 9 22.75Z"></path>
                                    <path fill="#fff" d="M21.9985 9.75C21.5885 9.75 21.2485 9.41 21.2485 9C21.2485 6.04 19.1885 3.56 16.4185 2.91L16.6885 3.36C16.8985 3.72 16.7885 4.18 16.4285 4.39C16.0785 4.6 15.6085 4.49 15.3985 4.13L14.3485 2.38C14.2085 2.15 14.2085 1.86 14.3385 1.63C14.4785 1.4 14.7285 1.25 14.9985 1.25C19.2685 1.25 22.7485 4.73 22.7485 9C22.7485 9.41 22.4085 9.75 21.9985 9.75Z"></path>
                                    <path fill="#fff" d="M16.9198 11.8516C14.1198 11.8516 11.8398 14.1216 11.8398 16.9316C11.8398 19.7316 14.1098 22.0116 16.9198 22.0116C19.7198 22.0116 21.9998 19.7416 21.9998 16.9316C21.9998 14.1216 19.7298 11.8516 16.9198 11.8516ZM19.3998 19.3416C19.0298 19.5216 18.5798 19.3816 18.3898 19.0016L18.2198 18.6616H15.6298L15.4598 19.0016C15.3298 19.2616 15.0598 19.4116 14.7898 19.4116C14.6798 19.4116 14.5598 19.3816 14.4598 19.3316C14.0898 19.1416 13.9398 18.6916 14.1198 18.3216L16.2598 14.0516C16.3898 13.8016 16.6498 13.6416 16.9298 13.6416C17.2098 13.6416 17.4698 13.8016 17.5998 14.0616L19.7398 18.3316C19.9198 18.7016 19.7698 19.1516 19.3998 19.3416Z"></path>
                                    <path fill="#fff" d="M16.3789 17.1603H17.4689L16.9189 16.0703L16.3789 17.1603Z"></path>
                                </svg>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Home;

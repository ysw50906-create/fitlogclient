import { useEffect, useRef, useState } from 'react';
import '../../style/Chat/Chat.css';
import { useSelector } from 'react-redux';
import axios from 'axios';
import jaxios from '../../util/JWTUtil';

function Chat({ activate, setActivate }) {
    const loginUser = useSelector(state => state.user);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!loginUser.num) {
            setMessages([{ type: 'ai', text: '로그인 후 이용해주세요.' }])
        } else {
            jaxios.get(`/api/chat/getHistory/${loginUser.num}`)
                .then((res) => {
                    setMessages([...res.data])
                }).catch((err) => { console.error(err) })
        }
    }, [loginUser.num])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        });
    }, [messages, activate]);

    const handleSend = async () => {
        if (!message.trim()) return;
        const msg = message;
        setMessage('');

        setMessages((prev) => [
            ...prev,
            {
                type: 'user',
                text: msg,
            },
        ]);

        try {
            const res = await jaxios.post("/api/ai/query", { userChat: msg, userId: loginUser.num })
            setMessages((prev) => [
                ...prev,
                {
                    type: 'ai',
                    text: res.data.answer,
                },
            ]);
            
        } catch (err) {
            console.error(err)
        }


    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-container" style={activate ? { display: 'block' } : { display: 'none' }}>

            <div className="chat-window">

                {/* 헤더 */}
                <div className="chat-header">
                    <div className="chat-header-title">
                        <span className="chat-header-icon">🤖</span>
                        <span>FITLOG CHATBOT</span>
                    </div>
                    <button
                        className="chat-close-button"
                        onClick={() => setActivate(false)}
                        aria-label="챗봇 닫기"
                    >
                        ✕
                    </button>
                </div>

                {/* 메시지 */}
                <div className="chat-messages">

                    {messages.length === 0 && (
                        <div className="chat-welcome">
                            <div className="chat-welcome-icon">🤖</div>

                            <div className="chat-welcome-title">
                                안녕하세요!
                            </div>

                            <div className="chat-welcome-text">
                                식단이나 운동에 대해<br />
                                궁금한 점을 물어보세요.
                            </div>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`chat-message chat-message--${msg.type}`}
                        >
                            {msg.text}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />

                </div>

                {/* 입력 */}
                <div className="chat-input-container">

                    <textarea
                        className="chat-input"
                        placeholder="메시지를 입력하세요..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        disabled={!loginUser.num}
                    />

                    <button
                        className="chat-send-button"
                        onClick={handleSend}
                    >
                        ↑
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Chat;
import { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';

export default function ChatPage() {
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        if (!socket) return;

        socket.on('message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        return () => {
            socket.off('message');
        };
    }, [socket]);

    const sendMessage = () => {
        if (socket) {
            socket.emit('message', input);
            setInput('');
        }
    };

    return (
        <div>
            <h2>Chat Page</h2>
            <input value={input} onChange={(e) => setInput(e.target.value)} />
            <button onClick={sendMessage}>Send</button>

            <div style={{ marginTop: 20 }}>
                {messages.map((msg, i) => <div key={i}>{msg}</div>)}
            </div>
        </div>
    );
}
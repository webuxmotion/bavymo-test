// src/components/Layout.js
import { Link } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';

export default function Header() {
    const socket = useSocket();

    return (
        <header style={{ padding: 20, borderBottom: '1px solid #ccc' }}>
            <h1>My App. Socket id: {socket?.id}</h1>
            <nav>
                <Link to="/" style={{ marginRight: 10 }}>Home</Link>
                <Link to="/chat">Chat</Link>
            </nav>
        </header>
    );
}
// src/components/Layout.js
import { Link } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useEffect, useRef, useState } from 'react';
import { useWebRTC } from '../hooks/userWebRTC';

export default function Header() {
    const { socket, randomId, serverData } = useSocket();
    const { startCall, remoteStream, localStream } = useWebRTC(socket, randomId);
    const [users, setUsers] = useState([]);
    const videoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && localStream) {
            videoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    useEffect(() => {
        const newUsers = serverData?.users?.filter(el => el !== randomId) || [];
        setUsers(newUsers);
    }, [serverData, randomId]);

    return (
        <header style={{ padding: 20, borderBottom: '1px solid #ccc' }}>
            <h1>My App.</h1>
            <p>Socket id: {socket?.id}</p>
            <p>random id: {randomId}</p>

            {users.length ? (
                <>
                    {users.map(u => (
                        <div key={u}>
                            <span>{u}</span>
                            <button onClick={() => startCall(u)}>Call</button>
                        </div>
                    ))}
                </>
            ) : ''}

            <div>
                <h3>Local</h3>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: 200 }}
                />
            </div>

            <div>
                <h3>Remote</h3>
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    style={{ width: 200 }}
                />
            </div>

            <nav>
                <Link to="/" style={{ marginRight: 10 }}>Home</Link>
                <Link to="/chat">Chat</Link>
            </nav>
        </header>
    );
}
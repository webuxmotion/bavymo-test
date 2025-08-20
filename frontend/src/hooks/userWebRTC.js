import { useEffect, useRef, useState } from 'react';

const configuration = {
    iceServers: [
        // Публічні STUN сервери для резерву
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        { urls: 'stun:stun.stunprotocol.org:3478' },
        { urls: 'stun:stun.voiparound.com' },
        { urls: 'stun:stun.voipbuster.com' },
        { urls: 'stun:stun.voipstunt.com' },
        {
            urls: [
                'stun:185.233.47.117:3478',
                'turn:185.233.47.117:3478?transport=udp',
                'turn:185.233.47.117:3478?transport=tcp'
            ],
            username: 'webrtcuser',
            credential: 'strongpassword'
        }
    ],
    iceTransportPolicy: "all"
};

export function useWebRTC(socket, randomId) {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const pcRef = useRef(null);
    const iceCandidateQueue = useRef([]);

    const startCall = async (calleeRandomId) => {
        if (!socket) return;

        // Get local media
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);

        // Create peer connection if not exists
        if (!pcRef.current) {
            pcRef.current = new RTCPeerConnection(configuration);

            // Add local tracks
            stream.getTracks().forEach(track => pcRef.current.addTrack(track, stream));

            // Listen for remote tracks
            pcRef.current.ontrack = (event) => setRemoteStream(event.streams[0]);

            // ICE candidates
            pcRef.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('signal', { to: calleeRandomId, data: { candidate: event.candidate } });
                }
            };
        }

        // Create and send offer
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        socket.emit('signal', { to: calleeRandomId, data: { sdp: offer } });
        console.log('emit offer');
    };

    useEffect(() => {
        if (!socket) return;

        const handleSignal = async ({ from, data }) => {
            // Create peer connection if not exists
            if (!pcRef.current) {
                pcRef.current = new RTCPeerConnection(configuration);

                // Add local tracks
                let stream = localStream;
                if (!stream) {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    setLocalStream(stream);
                }
                stream.getTracks().forEach(track => pcRef.current.addTrack(track, stream));

                // Listen for remote tracks
                pcRef.current.ontrack = (event) => setRemoteStream(event.streams[0]);

                // ICE candidates
                pcRef.current.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit('signal', { to: from, data: { candidate: event.candidate } });
                    }
                };
            }

            // Handle SDP
            if (data.sdp) {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));

                // After setting remote description, add any queued ICE candidates
                iceCandidateQueue.current.forEach(candidate => pcRef.current.addIceCandidate(candidate));
                iceCandidateQueue.current = [];

                if (data.sdp.type === 'offer') {
                    const answer = await pcRef.current.createAnswer();
                    await pcRef.current.setLocalDescription(answer);
                    socket.emit('signal', { to: from, data: { sdp: answer } });
                }
            }

            // Handle ICE candidates
            if (data.candidate) {
                const candidate = new RTCIceCandidate(data.candidate);
                if (pcRef.current.remoteDescription) {
                    await pcRef.current.addIceCandidate(candidate);
                } else {
                    // Queue candidate if remote description not yet set
                    iceCandidateQueue.current.push(candidate);
                }
            }
        };

        socket.on('signal', handleSignal);
        return () => socket.off('signal', handleSignal);
    }, [socket, localStream]);

    return { startCall, localStream, remoteStream };
}
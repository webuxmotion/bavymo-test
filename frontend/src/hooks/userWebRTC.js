import { useCallback, useEffect, useRef, useState } from 'react';
import { configuration } from './configuration';

export function useWebRTC(socket) {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const pcRef = useRef(null);
    const iceCandidateQueue = useRef([]);

    const createPeerConnection = useCallback(async (calleeRandomId) => {
        pcRef.current = new RTCPeerConnection(configuration);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        stream?.getTracks().forEach(track => pcRef.current.addTrack(track, stream));
        pcRef.current.ontrack = (event) => setRemoteStream(event.streams[0]);
        pcRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('signal', { to: calleeRandomId, data: { candidate: event.candidate } });
            }
        };
    }, [socket]);

    const startCall = async (calleeRandomId) => {
        await createPeerConnection(calleeRandomId);

        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);

        socket.emit('signal', { to: calleeRandomId, data: { sdp: offer } });
    }

    useEffect(() => {
        if (!socket) return;

        const handleSignal = async ({ from, data }) => {
            if (!pcRef.current) {
                await createPeerConnection(from);
            }

            if (data.sdp) {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));

                iceCandidateQueue.current.forEach(candidate => pcRef.current.addIceCandidate(candidate));
                iceCandidateQueue.current = [];

                if (data.sdp.type === 'offer') {
                    const answer = await pcRef.current.createAnswer();
                    await pcRef.current.setLocalDescription(answer);
                    socket.emit('signal', { to: from, data: { sdp: answer } });
                }
            }

            if (data.candidate) {
                const candidate = new RTCIceCandidate(data.candidate);
                if (pcRef.current.remoteDescription) {
                    await pcRef.current.addIceCandidate(candidate);
                } else {
                    // Queue candidate if remote description not yet set
                    iceCandidateQueue.current.push(candidate);
                }
            }
        }

        socket.on('signal', handleSignal);

        return () => socket.off('signal', handleSignal);
    }, [socket, localStream, createPeerConnection]);

    return { startCall, localStream, remoteStream };
}
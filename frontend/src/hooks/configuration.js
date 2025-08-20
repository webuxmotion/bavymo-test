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

export { configuration };
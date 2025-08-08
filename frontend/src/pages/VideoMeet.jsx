import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import { Badge, IconButton, TextField, Button, Paper, Typography, Box, Avatar, Divider, Tooltip, AppBar, Toolbar, Slide, Fade } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import styles from "../styles/videoComponent.module.css";
import server from '../environment';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    // TODO
    // if(isChrome() === false) {


    // }

    useEffect(() => {
        console.log("HELLO")
        getPermissions();

    })

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);

        }


    }, [video, audio])
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(!video);
        // getUserMedia();
    }
    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };



    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }

    
    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }


    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)', p: 0, m: 0 }}>
            <AppBar position="static" sx={{ background: 'rgba(30,30,30,0.95)', boxShadow: 2 }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
                        Apna Video Call
                    </Typography>
                    {username && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32 }}>
                                <PersonIcon />
                            </Avatar>
                            <Typography variant="subtitle1" sx={{ color: '#fff' }}>{username}</Typography>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            {askForUsername ? (
                <Fade in={askForUsername}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                        <Paper elevation={6} sx={{ p: 5, borderRadius: 4, background: 'rgba(255,255,255,0.95)', minWidth: 340 }}>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#1976d2' }}>Enter the Lobby</Typography>
                            <TextField fullWidth id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" sx={{ mb: 3 }} />
                            <Button fullWidth variant="contained" size="large" onClick={connect} sx={{ fontWeight: 600, mb: 2 }}>Connect</Button>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <video ref={localVideoref} autoPlay muted style={{ width: 220, borderRadius: 12, background: '#222' }}></video>
                            </Box>
                        </Paper>
                    </Box>
                </Fade>
            ) : (
                <Box className={styles.meetVideoContainer} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: 'calc(100vh - 64px)', p: 0 }}>
                    {/* Chat Sidebar */}
                    <Slide direction="right" in={showModal} mountOnEnter unmountOnExit>
                        <Paper elevation={8} sx={{ width: { xs: '100%', md: 340 }, maxWidth: 400, minWidth: 260, background: 'rgba(255,255,255,0.98)', borderRadius: 0, display: 'flex', flexDirection: 'column', zIndex: 10 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #eee' }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>Chat</Typography>
                                <Button onClick={closeChat} size="small" sx={{ color: '#1976d2', fontWeight: 600 }}>Close</Button>
                            </Box>
                            <Divider />
                            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, background: '#f7f7f7' }}>
                                {messages.length !== 0 ? messages.map((item, index) => (
                                    <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <Avatar sx={{ bgcolor: '#1976d2', width: 28, height: 28, fontSize: 16 }}>
                                            <PersonIcon fontSize="small" />
                                        </Avatar>
                                        <Box>
                                            <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#222' }}>{item.sender}</Typography>
                                            <Typography sx={{ fontSize: 14, color: '#444' }}>{item.data}</Typography>
                                        </Box>
                                    </Box>
                                )) : (
                                    <Typography sx={{ color: '#888', textAlign: 'center', mt: 4 }}>No Messages Yet</Typography>
                                )}
                            </Box>
                            <Divider />
                            <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 1, background: '#fff' }}>
                                <TextField value={message} onChange={handleMessage} id="outlined-basic" label="Type a message" variant="outlined" size="small" sx={{ flex: 1 }} onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }} />
                                <Button variant='contained' onClick={sendMessage} sx={{ fontWeight: 600, minWidth: 80 }}>Send</Button>
                            </Box>
                        </Paper>
                    </Slide>

                    {/* Main Video Area */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', p: { xs: 1, md: 3 } }}>
                        {/* Controls */}
                        <Box className={styles.buttonContainers} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2, background: 'rgba(30,30,30,0.85)', borderRadius: 3, p: 1, boxShadow: 2 }}>
                            <Tooltip title={video ? 'Turn off camera' : 'Turn on camera'}>
                                <IconButton onClick={handleVideo} sx={{ color: video ? '#fff' : '#b71c1c', bgcolor: video ? '#1976d2' : '#fff', '&:hover': { bgcolor: video ? '#115293' : '#ffcdd2' } }}>
                                    {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="End Call">
                                <IconButton onClick={handleEndCall} sx={{ color: '#fff', bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}>
                                    <CallEndIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={audio ? 'Mute mic' : 'Unmute mic'}>
                                <IconButton onClick={handleAudio} sx={{ color: audio ? '#fff' : '#b71c1c', bgcolor: audio ? '#1976d2' : '#fff', '&:hover': { bgcolor: audio ? '#115293' : '#ffcdd2' } }}>
                                    {audio === true ? <MicIcon /> : <MicOffIcon />}
                                </IconButton>
                            </Tooltip>
                            {screenAvailable === true && (
                                <Tooltip title={screen ? 'Stop sharing screen' : 'Share screen'}>
                                    <IconButton onClick={handleScreen} sx={{ color: '#fff', bgcolor: screen ? '#1976d2' : '#fff', '&:hover': { bgcolor: screen ? '#115293' : '#e3f2fd' } }}>
                                        {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Badge badgeContent={newMessages} max={999} color='warning'>
                                <Tooltip title="Open chat">
                                    <IconButton onClick={() => setModal(!showModal)} sx={{ color: '#fff', bgcolor: '#1976d2', '&:hover': { bgcolor: '#115293' } }}>
                                        <ChatIcon />
                                    </IconButton>
                                </Tooltip>
                            </Badge>
                        </Box>

                        {/* Local Video */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                            <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted style={{ width: 260, borderRadius: 12, background: '#222', boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}></video>
                        </Box>

                        {/* Conference Videos */}
                        <Box className={styles.conferenceView} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                            {videos.map((video) => (
                                <Paper key={video.socketId} elevation={4} sx={{ borderRadius: 3, overflow: 'hidden', background: '#222', minWidth: 220, maxWidth: 320 }}>
                                    <video
                                        data-socket={video.socketId}
                                        ref={ref => {
                                            if (ref && video.stream) {
                                                ref.srcObject = video.stream;
                                            }
                                        }}
                                        autoPlay
                                        style={{ width: '100%', borderRadius: 0 }}
                                    ></video>
                                </Paper>
                            ))}
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

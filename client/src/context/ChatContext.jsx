import axios from "axios";
import { toast } from "sonner";
import { baseUrl } from "../utils/services";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { faBullseye } from "@fortawesome/free-solid-svg-icons";
import { io } from "socket.io-client"


export const ChatContext = createContext()

export const ChatProvider = ({ children, user }) => {
    const [userChats, setUserChats] = useState(null)
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false)
    const [allUsers, setAllUsers] = useState([])
    const [discoverChats, setDiscoverChats] = useState([])
    const [currentChat, setCurrentChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [isMessagesLoading, setIsMessagesLoading] = useState(false)
    const [newMessage, setNewMessage] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])
    const [notifications, setNotifications] = useState([])

    // WebRTC-related states
    const [call, setCall] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const peerConnection = useRef(null);
    const [socket, setSocket] = useState(null);

    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isMuted, setIsMuted] = useState(false);

    const toggleVideo = (enable) => {
        setIsVideoEnabled(enable);
        localStream?.getVideoTracks().forEach(track => {
            track.enabled = enable;
        });
    };

    const toggleMute = (mute) => {
        setIsMuted(mute);
        localStream?.getAudioTracks().forEach(track => {
            track.enabled = !mute;
        });
    };

    // initializing socket
    useEffect(() => {
        if (!user?.id) return;

        const newSocket = io(baseUrl, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.connected);
            newSocket.emit("addNewUser", user.id);
        });

        newSocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

        newSocket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, [user]);

    // add online users
    useEffect(() => {
        if (!socket || !user?.id) return;

        socket.emit("addNewUser", user.id);
        socket.on('getOnlineUsers', (res) => {
            setOnlineUsers(res);
        });

        // cleanup
        return () => {
            socket.off('getOnlineUsers');
        };
    }, [socket, user]);

    // send message
    useEffect(() => {
        if (!socket || !newMessage) return;
        const recipientId = currentChat?.members.find((id) => id !== user?.id);
        socket.emit('sendMessage', { ...newMessage, recipientId });
    }, [newMessage, socket, currentChat, user]);


    //recieving message and notofication
    useEffect(() => {
        if (!socket) return;

        const handleMessage = (res) => {
            if (currentChat?._id !== res.chatId) return;
            setMessages((prev) => [...prev, res]);
        };

        socket.on('getMessage', handleMessage);

        socket.on('getNotification', (res) => {
            const isChatOpened = currentChat?.members.some((id) => id === res.senderId)
            if (isChatOpened) {
                setNotifications(prev => [{ ...res, isRead: true }, ...prev])
            } else {
                setNotifications(prev => [res, ...prev])
            }
        })

        // cleanup
        return () => {
            socket.off('getMessage', handleMessage);
            socket.off('getNotification')
        };
    }, [socket, currentChat]);


    useEffect(() => {
        const getUsers = async () => {
            try {
                if (userChats) {
                    const response = await axios.get(`${baseUrl}/users`);

                    const chatsToShow = response?.data?.filter((u) => {
                        let isChatCreated = false;
                        if (user.id == u._id) return false
                        if (userChats) {
                            isChatCreated = userChats?.some((chat) => {
                                return chat?.members[0] == u._id || chat?.members[1] == u._id
                            })
                        }

                        return !isChatCreated
                    })
                    setDiscoverChats(chatsToShow);
                    setAllUsers(response.data)
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || "Something wensdsdsdt wrong!";
                toast.error(errorMessage);
            }
        }

        getUsers()
    }, [userChats])


    const fetchUserChats = useCallback(async () => {
        try {
            if (user?.id) {
                setIsUserChatsLoading(true);
                const response = await axios.get(`${baseUrl}/chats/${user?.id}`);
                setUserChats(response.data.chats);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Something went wrong!";
            toast.error(errorMessage);
        } finally {
            setIsUserChatsLoading(false);
        }
    }, [user?.id]);


    useEffect(() => {
        fetchUserChats();
    }, [fetchUserChats, notifications]);


    useEffect(() => {
        const getMessages = async () => {
            try {
                if (currentChat?._id) {
                    setIsMessagesLoading(true);
                    const response = await axios.get(`${baseUrl}/messages/${currentChat?._id}`);
                    setMessages(response.data.messages);
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || "Something went wrong!";
                toast.error(errorMessage);
            } finally {
                setIsMessagesLoading(false);
            }
        };

        getMessages();
    }, [currentChat]);


    const sendTextMessage = useCallback(
        async (textMessage, sender, currentChatId, setTextMessage) => {
            if (!textMessage) return;

            // Create the outgoing message
            const outgoingMessage = {
                chatId: currentChatId,
                senderId: sender.id,
                text: textMessage,
                createdAt: new Date().toISOString(),
                pending: true,
            };

            setMessages((prev) => (prev ? [...prev, outgoingMessage] : [outgoingMessage]));
            setNewMessage(outgoingMessage);

            try {
                // Send the message to the backend
                const response = await axios.post(`${baseUrl}/messages`, {
                    chatId: currentChatId,
                    senderId: sender.id,
                    text: textMessage,
                });

                const savedMessage = response.data.savedMessage;

                // Replace message with the saved message
                setMessages((prev) =>
                    prev.map((message) =>
                        message.createdAt === outgoingMessage.createdAt
                            ? { ...savedMessage, pending: false }
                            : message
                    )
                );
                setTextMessage("");
            } catch (error) {
                const errorMessage = error.response?.data?.message || "Something went wrong!";
                toast.error(errorMessage);

                // Remove the optimistic message on error
                setMessages((prev) =>
                    prev.filter((message) => message.createdAt !== outgoingMessage.createdAt)
                );
            }
        },
        []
    );

    const updateCurrentChat = useCallback((chat) => {
        setCurrentChat(chat)
    }, [])

    const createChat = useCallback(async (firstUserId, secondUserId) => {
        try {
            const response = await axios.post(`${baseUrl}/chats`, { firstUserId, secondUserId });
            await fetchUserChats(); // Refresh the user chats list
            return response.data.chats;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Something went wrong!";
            toast.error(errorMessage);
            throw error;
        }
    }, [fetchUserChats]);

    const markAllNotificationsRead = useCallback((notifications) => {
        const markedNotifications = notifications.map(n => {
            return { ...n, isRead: true }
        })

        setNotifications(markedNotifications)
    }, [])

    const markNotificationAsRead = useCallback((n, userChats, user) => {
        const findChat = userChats.find(chat => {
            const chatMembers = [user.id, n.senderId];
            return chat?.members.every(member => chatMembers.includes(member));
        });

        // Mark notifications from this sender as read
        setNotifications(prev => prev.map(m =>
            m.senderId === n.senderId ? { ...m, isRead: true } : m
        ));

        updateCurrentChat(findChat);
    }, [updateCurrentChat]);

    const markThisUserNotificationsAsRead = useCallback((thisUserNotifications) => {
        // Get the senderId from the first notification (all are from the same sender)
        const senderId = thisUserNotifications[0]?.senderId;
        if (!senderId) return;

        // Mark all notifications from this sender as read
        setNotifications(prev =>
            prev.map(notification =>
                notification.senderId === senderId
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleCallIncoming = (data) => {
            console.log(data, "call data")
            setCall({
                isReceivingCall: true,
                from: data.from,
                fromId: data.fromId,
                name: data.name,
                type: data.type,
                signal: data.signal
            });
        };

        const handleCallAccepted = (signal) => {
            setIsCallActive(true);
            peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
        };

        const handleCallEnded = () => endCall();
        // Update the ICE candidate handler in the socket.io connection
        const handleICECandidate = (data) => {
            try {
                const candidate = new RTCIceCandidate(data.candidate);
                peerConnection.current?.addIceCandidate(candidate)
                    .catch(error => console.error('Error adding ICE candidate:', error));
            } catch (error) {
                console.error('Error creating ICE candidate:', error);
            }
        };

        socket.on("callIncoming", handleCallIncoming);
        socket.on("callAccepted", handleCallAccepted);
        socket.on("callEnded", handleCallEnded);
        socket.on("ICEcandidate", handleICECandidate);

        return () => {
            socket.off("callIncoming", handleCallIncoming);
            socket.off("callAccepted", handleCallAccepted);
            socket.off("callEnded", handleCallEnded);
            socket.off("ICEcandidate", handleICECandidate);
        };
    }, [socket]);

    // createPeerConnection function
    const createPeerConnection = (stream, isVideo) => {
        const config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        };

        peerConnection.current = new RTCPeerConnection(config);

        // Add local tracks
        stream.getTracks().forEach(track => {
            peerConnection.current.addTrack(track, stream);
        });

        // Handle remote tracks
        peerConnection.current.ontrack = (event) => {
            const newStream = new MediaStream();
            event.streams[0].getTracks().forEach(track => {
                newStream.addTrack(track);
            });
            setRemoteStream(newStream);
        };

        // ICE Candidate handling
        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate && socket) {
                const target = call?.from || call?.target;
                socket.emit("ICEcandidate", {
                    target: target,
                    candidate: event.candidate.toJSON(),
                    sender: user.id
                });
            }
        };
    };

    const startCall = async (isVideo, targetSocket) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: isVideo ? { facingMode: "user" } : false,
                audio: true
            });

            setLocalStream(stream);
            createPeerConnection(stream, isVideo);

            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);

            socket.emit("callUser", {
                userToCall: targetSocket,
                signalData: offer,
                from: socket.id,
                fromId: user.id,
                name: user.name,
                type: isVideo ? 'video' : 'audio'
            });

            // Store target socket ID in call state
            setCall(prev => ({
                ...prev,
                target: targetSocket,
                isReceivingCall: false
            }));
        } catch (error) {
            console.error('Error starting call:', error);
            toast.error('Failed to access camera/microphone');
        }
    };

    const answerCall = async () => {
        try {
            const constraints = {
                video: call.type === 'video' ? { facingMode: "user" } : false,
                audio: true
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);

            createPeerConnection(stream, call.type === 'video');

            // Set remote description first
            await peerConnection.current.setRemoteDescription(
                new RTCSessionDescription(call.signal)
            );

            // Create and set local description
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);

            socket.emit("answerCall", {
                signal: answer,
                to: call.from
            });

            setIsCallActive(true);
            setCall(prev => ({ ...prev, isReceivingCall: false }));
        } catch (error) {
            console.error('Error answering call:', error);
            endCall();
        }
    };

    const endCall = () => {
        if (peerConnection.current) {
            peerConnection.current.ontrack = null;
            peerConnection.current.close();
            peerConnection.current = null;
        }

        // Stop all local tracks
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }

        // Stop all remote tracks
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
            setRemoteStream(null);
        }

        setIsCallActive(false);
        setCall(null);
        socket?.emit("endCall", { to: call?.from || call?.target });
    };


    return (
        <ChatContext.Provider value={{
            // Chat
            userChats,
            isUserChatsLoading,
            discoverChats,
            createChat,
            updateCurrentChat,
            messages,
            currentChat,
            isMessagesLoading,
            sendTextMessage,
            onlineUsers,
            notifications,
            allUsers,
            markAllNotificationsRead,
            markNotificationAsRead,
            markThisUserNotificationsAsRead,
            // WebRTC
            call,
            localStream,
            remoteStream,
            isCallActive,
            startCall,
            answerCall,
            endCall,
            setCall,
            toggleMute,
            toggleVideo,
            isMuted,
            isVideoEnabled,
            socket,
        }}>
            {children}
        </ChatContext.Provider>
    )
}
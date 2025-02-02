import axios from "axios";
import { toast } from "sonner";
import { baseUrl } from "../utils/services";
import { createContext, useCallback, useEffect, useState } from "react";
import { faBullseye } from "@fortawesome/free-solid-svg-icons";
import { io } from "socket.io-client"


export const ChatContext = createContext()

export const ChatProvider = ({ children, user }) => {
    const [userChats, setUserChats] = useState(null)
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false)

    const [discoverChats, setDiscoverChats] = useState([])
    const [currentChat, setCurrentChat] = useState(null)

    const [messages, setMessages] = useState([])
    const [isMessagesLoading, setIsMessagesLoading] = useState(false)

    const [newMessage, setNewMessage] = useState(null)

    const [socket, setSocket] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])

    // initializing socket
    useEffect(() => {
        if (!user?.id) return; // Ensure user.id is valid

        const newSocket = io('http://localhost:3000/');
        setSocket(newSocket);

        return () => {
            newSocket.disconnect(); // Cleanup socket on unmount
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


    //recieving message
    useEffect(() => {
        if (!socket) return;

        const handleMessage = (res) => {
            if (currentChat?._id !== res.chatId) return;
            setMessages((prev) => [...prev, res]);
        };

        socket.on('getMessage', handleMessage);

        // cleanup
        return () => {
            socket.off('getMessage', handleMessage);
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
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || "Something wensdsdsdt wrong!";
                toast.error(errorMessage);
            }
        }

        getUsers()
    }, [userChats])

    useEffect(() => {
        const getUserChats = async () => {
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
        };

        getUserChats();
    }, [user]);

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

            // Optimistically update messages state
            setMessages((prev) => (prev ? [...prev, outgoingMessage] : [outgoingMessage]));

            // **Trigger socket emission by updating newMessage**
            setNewMessage(outgoingMessage);

            try {
                // Send the message to the backend
                const response = await axios.post(`${baseUrl}/messages`, {
                    chatId: currentChatId,
                    senderId: sender.id,
                    text: textMessage,
                });

                const savedMessage = response.data.savedMessage;

                // Replace optimistic message with the saved message
                setMessages((prev) =>
                    prev.map((message) =>
                        message.createdAt === outgoingMessage.createdAt
                            ? { ...savedMessage, pending: false }
                            : message
                    )
                );

                // Clear the input field
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
            setUserChats((prev) => [...prev, response.data.chats]);

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Something went wrong!";
            toast.error(errorMessage);
        } finally {
            setIsUserChatsLoading(false);
        }
    }, [])

    return (
        <ChatContext.Provider value={{
            userChats,
            isUserChatsLoading,
            discoverChats,
            createChat,
            updateCurrentChat,
            messages,
            currentChat,
            isMessagesLoading,
            sendTextMessage,
            onlineUsers
        }}>
            {children}
        </ChatContext.Provider>
    )
}
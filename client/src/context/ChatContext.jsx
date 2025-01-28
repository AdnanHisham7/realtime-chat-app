import axios from "axios";
import { toast } from "sonner";
import { baseUrl } from "../utils/services";
import { createContext, useCallback, useEffect, useState } from "react";
import { faBullseye } from "@fortawesome/free-solid-svg-icons";

export const ChatContext = createContext()

export const ChatProvider = ({ children, user }) => {
    const [userChats, setUserChats] = useState(null)
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false)

    const [discoverChats, setDiscoverChats] = useState([])
    const [currentChat, setCurrentChat] = useState(null)

    const [messages, setMessages] = useState([])
    const [isMessagesLoading, setIsMessagesLoading] = useState(faBullseye)

    const [newMessage, setNewMessage] = useState(null)


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

    
    const sendTextMessage = useCallback(async (textMessage, sender, currentChatId, setTextMessage) => {
        if (!textMessage) return;
    
        // Ensure the message has all necessary properties before adding it optimistically
        const outgoingMessage = {
            chatId: currentChatId,
            senderId: sender.id, // Ensure senderId is set
            text: textMessage,
            createdAt: new Date().toISOString(),
            pending: true, // Mark as pending while waiting for the server response
        };
    
        // Optimistically update the state with the outgoing message
        setMessages((prev) => prev ? [...prev, outgoingMessage] : [outgoingMessage]); // Add message optimistically
    
        try {
            // Send the message to the backend
            const response = await axios.post(`${baseUrl}/messages`, {
                chatId: currentChatId,
                senderId: sender.id,
                text: textMessage,
            });
    
            // Extract the saved message from the response
            const savedMessage = response.data.savedMessage; // Assuming savedMessage contains the message
    
            // Replace the optimistic message with the actual one from the server
            setMessages((prev) => {
                if (!prev) return [savedMessage]; // If prev is null or undefined, initialize with savedMessage.
                return prev.map((message) =>
                    message.createdAt === outgoingMessage.createdAt
                        ? { ...savedMessage, pending: false } // Replace with the actual response message
                        : message
                );
            });
    
            // Clear the input field after sending the message
            setTextMessage("");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Something went wrong!";
            toast.error(errorMessage);
    
            // If there's an error, remove the optimistic message
            setMessages((prev) => prev.filter((message) => message.createdAt !== outgoingMessage.createdAt));
        }
    }, []);
    
    
    


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
            sendTextMessage
        }}>
            {children}
        </ChatContext.Provider>
    )
}





// ensuring a non memory leak
// import axios from "axios";
// import { toast } from "sonner";
// import { baseUrl } from "../utils/services";
// import { createContext, useEffect, useState } from "react";

// export const ChatContext = createContext();

// export const ChatProvider = ({ children, user }) => {
//     const [userChats, setUserChats] = useState(null);
//     const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);

//     useEffect(() => {
//         let isMounted = true; // Prevent memory leaks on unmount
//         const getUserChats = async () => {
//             try {
//                 if (user?._id) {
//                     setIsUserChatsLoading(true);
//                     const response = await axios.get(`${baseUrl}/chats/${user?._id}`);
//                     if (isMounted) {
//                         setUserChats(response.data);
//                     }
//                 }
//             } catch (error) {
//                 if (isMounted) {
//                     const errorMessage = error.response?.data?.message || "Something went wrong!";
//                     toast.error(errorMessage);
//                 }
//             } finally {
//                 if (isMounted) {
//                     setIsUserChatsLoading(false);
//                 }
//             }
//         };

//         getUserChats();

//         return () => {
//             isMounted = false;
//         };
//     }, [user]);

//     return (
//         <ChatContext.Provider
//             value={{
//                 userChats,
//                 isUserChatsLoading,
//             }}
//         >
//             {children}
//         </ChatContext.Provider>
//     );
// };

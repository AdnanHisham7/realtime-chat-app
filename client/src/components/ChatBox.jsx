import React, { useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { ChatContext } from '../context/ChatContext'
import { useFetchRecipientUser } from '../hooks/useFetchRecipient'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCircleUser, faEllipsisVertical, faMicrophone, faPaperclip, faPaperPlane, faPhone, faVideo } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment/moment'
import ReactInputEmoji from 'react-input-emoji';


const ChatBox = ({ handleBackToChats }) => {
    const { user } = useContext(AuthContext);
    const { currentChat, messages, isMessagesLoading, sendTextMessage } = useContext(ChatContext);
    const { recipientUser } = useFetchRecipientUser(currentChat, user);

    const [textMessage, setTextMessage] = useState("")

    const chatRef = useRef(null);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.style.scrollBehavior = 'smooth';
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);


    if (!recipientUser)
        return <p className="flex justify-center items-center h-full">No conversation selected yet.</p>;

    if (isMessagesLoading)
        return <p className="flex justify-center items-center h-full">Messages Loading...</p>;

    return (
        <div className="h-full lg:min-h-0 min-h-screen mb-10 lg:mb-0 flex flex-col bg-gray-100 rounded-lg border shadow-md">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        className="lg:hidden text-gray-600 mb-2 flex items-center"
                        onClick={handleBackToChats}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                    <div>
                        <h3 className="text-lg font-semibold">{recipientUser?.name || "Recipient"}</h3>
                        <p className="text-sm text-gray-500">online</p>
                    </div>
                </div>
                <div className="flex items-center gap-6 text-gray-600">
                    <FontAwesomeIcon icon={faVideo} className="text-xl cursor-pointer" />
                    <FontAwesomeIcon icon={faPhone} className="text-xl cursor-pointer" />
                    <FontAwesomeIcon icon={faEllipsisVertical} className="text-xl cursor-pointer" />
                </div>
            </div>

            {/* Chat Content */}
            <div ref={chatRef} className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-1">


                {/* End-to-End Encryption Message */}
                <div className="flex justify-center my-4">
                    <div className="px-4 py-2 text-xs text-gray-600 bg-gray-100 border border-gray-300 rounded-lg shadow-sm">
                        This chat is end-to-end encrypted. Messages and calls are private.
                    </div>
                </div>

                {messages && messages.map((message, index) => {
                    const isOutgoing = user.id === message.senderId;
                    const isFirstMessageOfGroup = index === 0 || messages[index - 1].senderId !== message.senderId;

                    // Get current and previous message dates
                    const currentMessageDate = moment(message.createdAt).startOf('day');
                    const previousMessageDate =
                        index > 0 ? moment(messages[index - 1].createdAt).startOf('day') : null;

                    // Determine if a date tag should be added
                    const shouldShowDateTag =
                        index === 0 || !currentMessageDate.isSame(previousMessageDate);

                    // Format date tag
                    const formattedDate =
                        currentMessageDate.isSame(moment(), 'day')
                            ? 'Today'
                            : currentMessageDate.isSame(moment().subtract(1, 'day'), 'day')
                                ? 'Yesterday'
                                : currentMessageDate.format('DD MMM YYYY');

                    return (
                        <React.Fragment key={index}>
                            {/* Date Tag */}
                            {shouldShowDateTag && (
                                <div className="flex justify-center my-4">
                                    <span className="px-4 py-1 text-xs text-gray-500 bg-gray-100 rounded-lg shadow-sm">
                                        {formattedDate}
                                    </span>
                                </div>
                            )}

                            {/* Message */}
                            <div
                                className={`flex ${isOutgoing ? 'items-end justify-end' : 'items-start'} ${!isFirstMessageOfGroup && isOutgoing && 'mr-6'
                                    } ${!isFirstMessageOfGroup && !isOutgoing && 'ml-6'}`}
                            >
                                {/* Avatar: Show only if it's the first message of the group (different sender) */}
                                {!isOutgoing && isFirstMessageOfGroup && (
                                    <FontAwesomeIcon
                                        icon={faCircleUser}
                                        className="w-5 h-5 mr-1 text-gray-400"
                                    ></FontAwesomeIcon>
                                )}

                                <div>
                                    {/* Text Messages */}
                                    <div
                                        className={`${isOutgoing ? 'bg-purple-500 text-white' : 'bg-gray-200'
                                            } ps-3 pr-14 py-2 rounded-lg max-w-xs relative`}
                                    >
                                        {/* Time (positioned in the corner) */}
                                        <span
                                            className={`absolute ${isOutgoing ? 'text-gray-300' : 'text-gray-500'
                                                } text-3xs bottom-1 right-2`}
                                        >
                                            {moment(message.createdAt).format('hh:mm A')}
                                        </span>

                                        {/* Message Text */}
                                        <p className="text-sm break-words">{message.text}</p>
                                    </div>

                                    {/* Image */}
                                    {message.image && (
                                        <img
                                            src={message.image}
                                            alt="Shared"
                                            className="mt-2 w-40 h-40 object-cover rounded-lg shadow-md"
                                        />
                                    )}

                                    {/* Audio Player */}
                                    {message.audio && (
                                        <div
                                            className={`${isOutgoing ? 'bg-purple-500' : 'bg-gray-200'
                                                } mt-2 rounded-lg p-2 max-w-xs w-full`}
                                        >
                                            <audio controls className="w-full">
                                                <source src={message.audio} type="audio/mp3" />
                                                Your browser does not support the audio element.
                                            </audio>
                                        </div>
                                    )}
                                </div>

                                {/* Avatar: Show only if it's the first outgoing message */}
                                {isOutgoing && isFirstMessageOfGroup && (
                                    <FontAwesomeIcon
                                        icon={faCircleUser}
                                        className="w-5 h-5 mb-8 ml-1 text-gray-400"
                                    ></FontAwesomeIcon>
                                )}
                            </div>
                        </React.Fragment>
                    );
                })}


            </div>

            {/* Input Field */}
            <div className="flex items-center gap-3 px-4 py-3 bg-white shadow-sm sticky bottom-10 lg:bottom-0 z-10">
                <FontAwesomeIcon icon={faPaperclip} className="text-2xl text-gray-600 cursor-pointer" />
                <FontAwesomeIcon icon={faMicrophone} className="text-2xl text-gray-600 cursor-pointer" />

                {/* Use ReactInputEmoji for the input field */}
                <ReactInputEmoji
                    value={textMessage}
                    onChange={setTextMessage}
                    placeholder="Type a message"
                    cleanOnEnter
                    theme='light'
                    onEnter={() => sendTextMessage(textMessage, user, currentChat._id, setTextMessage)}
                    className="flex-1 border rounded-full bg-transparent px-4 py-2 focus:outline-none"
                />

                {/* Send Button */}
                <button onClick={() => sendTextMessage(textMessage, user, currentChat._id, setTextMessage)} className="bg-purple-500 text-white p-3 rounded-full hover:bg-purple-600">
                    <FontAwesomeIcon icon={faPaperPlane} className="text-xl" />
                </button>
            </div>

        </div>
    );
};


export default ChatBox



import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { ChatContext } from '../context/ChatContext'
import { useFetchRecipientUser } from '../hooks/useFetchRecipient'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDown, faArrowLeft, faCircleUser, faEllipsisVertical, faMicrophone, faPaperclip, faPaperPlane, faPhone, faUserCircle, faVideo } from '@fortawesome/free-solid-svg-icons'
import { Toaster, toast } from 'sonner';
import moment from 'moment/moment'
import ReactInputEmoji from 'react-input-emoji';
import { Transition } from '@headlessui/react';
import { useTheme } from '../context/ThemeContext'
import { baseUrl } from '../utils/services'
import useFetchUserProfile from '../hooks/useFetchUserProfile'

const ChatBox = ({ handleBackToChats }) => {
  const { user } = useContext(AuthContext);
  const { darkMode } = useTheme();
  const {
    currentChat,
    messages,
    isMessagesLoading,
    sendTextMessage,
    onlineUsers,
    setCall,
    startCall
  } = useContext(ChatContext);
  const { recipientUser } = useFetchRecipientUser(currentChat, user);
  const { userProfile } = useFetchUserProfile();


  // Check if the recipient is online.
  const isOnline = onlineUsers?.some(
    (onlineUser) => onlineUser?.userId === recipientUser?._id
  );

  const [textMessage, setTextMessage] = useState("")

  const chatRef = useRef(null);
  const dummyRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (chatRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
        setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
      }
    };

    const chatContainer = chatRef.current;
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [messages]);

  // Trigger Video call
  const handleVideoCall = () => {
    const recipientSocket = onlineUsers.find(
      user => user.userId === recipientUser?._id
    )?.socketId;

    if (recipientSocket) {
      startCall(true, recipientSocket);
      setCall({
        isReceivingCall: false,
        target: recipientSocket,
        type: 'video',
        name: user.name, //(current user's)
        fromId: user.id,
        from: recipientSocket
      });
    } else {
      toast.warning(`${recipientUser?.name} is not online`)
    }
  };

  // Trigger Video call
  const handleVoiceCall = () => {
    const recipientSocket = onlineUsers.find(
      user => user.userId === recipientUser?._id
    )?.socketId;

    if (recipientSocket) {
      startCall(false, recipientSocket);
      setCall({
        isReceivingCall: false,
        target: recipientSocket,
        type: 'audio',
        name: user.name,
        fromId: user.id,
        from: recipientSocket
      });
    } else {
      toast.warning(`${recipientUser?.name} is not online`)
    }
  };

  useEffect(() => {
    if (dummyRef.current) {
      dummyRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!recipientUser)
    return <p className="flex justify-center items-center h-full">No conversation selected yet.</p>;

  if (isMessagesLoading)
    return <p className="flex justify-center items-center h-full">Messages Loading...</p>;

  return (
    <div className="h-full lg:min-h-0 min-h-screen flex flex-col bg-gray-100 dark:bg-midGray rounded-lg border dark:border-gray-800 shadow-md">

      <Toaster position='bottom-left' />

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-customGray shadow-sm sticky top-0 z-10 rounded-t-lg h-[70px]">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden text-gray-600 mb-2 flex items-center"
            onClick={handleBackToChats}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          </button>

          <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-300 dark:bg-customGray">
            {recipientUser?.profileImage && recipientUser.profileImage.trim() !== "" ? (
              <img
                src={`${baseUrl}${recipientUser.profileImage}`}
                alt={`${recipientUser.name} profile`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.style.display = "none"; // Hide broken image
                  e.target.nextSibling.style.display = "block"; // Show FontAwesome icon
                }}
              />
            ) : null}
            <FontAwesomeIcon
              icon={faUserCircle}
              className="w-full h-full object-cover text-gray-400 dark:text-gray-600"
              style={{ display: recipientUser?.profileImage && recipientUser.profileImage.trim() !== "" ? "none" : "block" }}
            />
          </div>


          <div>
            <h3
              className={`text-lg font-semibold dark:text-gray-200 transition-all duration-300`}
            >
              {recipientUser?.name || "Recipient"}
            </h3>
            <Transition
              show={isOnline}
              enter="transition-opacity duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <p className="text-sm text-gray-500">online</p>
            </Transition>
          </div>
        </div>
        <div className="flex items-center gap-6 text-gray-600 dark:text-gray-300">
          <FontAwesomeIcon
            icon={faVideo}
            className="text-xl cursor-pointer"
            onClick={handleVideoCall}
          />
          <FontAwesomeIcon
            icon={faPhone}
            className="text-xl cursor-pointer"
            onClick={handleVoiceCall}
          />
          <FontAwesomeIcon icon={faEllipsisVertical} className="text-xl cursor-pointer" />
        </div>
      </div>


      {/* Chat Content */}
      <div ref={chatRef} className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-1">


        {/* End-to-End Encryption Message */}
        <div className="flex justify-center my-4">
          <div className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-midGray border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm">
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
                  <span className="px-4 py-1 text-xs  text-gray-500 dark:text-gray-200 bg-gray-100 dark:bg-midGray rounded-lg shadow-sm">
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
                  <>
                    {recipientUser?.profileImage && recipientUser.profileImage.trim() !== "" ? (
                      <img
                        src={`${baseUrl}${recipientUser.profileImage}`}
                        alt={`${recipientUser.name} profile`}
                        className="w-5 h-5 ml-1 text-gray-400 rounded-full"
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.style.display = "none"; // Hide broken image
                          e.target.nextSibling.style.display = "inline-block"; // Show FontAwesome icon
                        }}
                      />
                    ) : null}
                    <FontAwesomeIcon
                      icon={faUserCircle}
                      className="w-5 h-5 ml-1 text-gray-400"
                      style={{ display: recipientUser?.profileImage && recipientUser.profileImage.trim() !== "" ? "none" : "inline-block" }}
                    />
                  </>
                )}



                <div>
                  {/* Text Messages */}
                  <div
                    className={`${isOutgoing ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-customGray dark:text-gray-300'
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
                      className={`${isOutgoing ? 'bg-primary' : 'bg-gray-200 dark:bg-customGray'
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
                  <>
                    {userProfile?.profileImage && userProfile.profileImage.trim() !== "" ? (
                      <img
                        src={`${baseUrl}${userProfile.profileImage}`}
                        alt={`${userProfile.name} profile`}
                        className="w-5 h-5 mb-8 ml-1 text-gray-400 rounded-full"
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.style.display = "none"; // Hide broken image
                          e.target.nextSibling.style.display = "inline-block"; // Show FontAwesome icon
                        }}
                      />
                    ) : null}
                    <FontAwesomeIcon
                      icon={faUserCircle}
                      className="w-5 h-5 ml-1 text-gray-400"
                      style={{ display: userProfile?.profileImage && userProfile.profileImage.trim() !== "" ? "none" : "inline-block" }}
                    />
                  </>
                )}
              </div>
            </React.Fragment>
          );
        })}
        <div ref={dummyRef}></div>
      </div>


      {/* Input Field */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-customGray shadow-sm sticky bottom-0 lg:bottom-0 z-10 rounded-b-lg">
        <div className='relative'>
          {!isAtBottom && (
            <div className="absolute bottom-12 left-2 transform -translate-x-1/3">
              <button
                onClick={() => dummyRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="w-8 h-8 bg-gray-300 rounded-full shadow-md hover:bg-gray-400 focus:outline-none"
              >
                <FontAwesomeIcon icon={faArrowDown} className="text-sm text-gray-700" />
              </button>
            </div>
          )}
        </div>
        <FontAwesomeIcon icon={faPaperclip} className="text-2xl text-gray-600 dark:text-gray-300 cursor-pointer" />
        <FontAwesomeIcon icon={faMicrophone} className="text-2xl text-gray-600 dark:text-gray-300 cursor-pointer" />

        {/* Use ReactInputEmoji for the input field */}
        <ReactInputEmoji
          value={textMessage}
          onChange={setTextMessage}
          placeholder="Type a message"
          cleanOnEnter
          theme={darkMode ? 'dark' : 'light'}
          onEnter={() => sendTextMessage(textMessage, user, currentChat._id, setTextMessage)}
          className="flex-1 border rounded-full bg-transparent px-4 py-2 focus:outline-none"
        />

        {/* Send Button */}
        <button onClick={() => sendTextMessage(textMessage, user, currentChat._id, setTextMessage)} className="bg-primary text-white p-3 rounded-full">
          <FontAwesomeIcon icon={faPaperPlane} className="text-xl" />
        </button>
      </div>

    </div>
  );
};


export default ChatBox



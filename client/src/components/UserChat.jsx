import React, { useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { useFetchRecipientUser } from '../hooks/useFetchRecipient'
import { ChatContext } from '../context/ChatContext';
import { unreadNotificationsFunc } from '../utils/unreadNotifications';
import { useFetchLatestMessage } from '../hooks/useFetchLatestMessage';
import moment from 'moment';

const UserChat = ({ chat, user }) => {
  const { recipientUser } = useFetchRecipientUser(chat, user);

  const { onlineUsers, notifications, markThisUserNotificationsAsRead } = useContext(ChatContext);
  const { latestMessage } = useFetchLatestMessage(chat)
  // Check if the recipient is online.
  const isOnline = onlineUsers?.some(
    (onlineUser) => onlineUser?.userId === recipientUser?._id
  );

  const unreadNotifications = unreadNotificationsFunc(notifications || []);
  const thisUserNotifications = unreadNotifications.filter(
    n => n?.senderId === recipientUser?._id
  );

  const truncateText = (text) =>{
    let shortText = text.substring(0,30)
    if(text.length > 30){
      shortText = shortText + "..."
    }
    return shortText
  }


  return (
    <div>
      <div
        key={recipientUser?._id}
        className="flex items-center justify-between py-3 px-4 bg-transparent border-b border-gray-200 hover:bg-gray-100 transition cursor-pointer"
        onClick={() => {
          if (thisUserNotifications?.length !== 0) {
            markThisUserNotificationsAsRead(thisUserNotifications)
          }
        }}
      >
        {/* Profile and Chat Info */}
        <div className="flex items-center space-x-3 w-full">
          {/* Profile Image */}
          <div className="relative w-10 h-10 bg-gray-300 rounded-full">

            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden shrink-0">
              {recipientUser?.profile ? (
                <img
                  src={recipientUser?.profile}
                  alt={`${recipientUser?.name} profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faUserCircle}
                  className="w-full h-full text-gray-400"
                />
              )}
            </div>
            <span
              className={`absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 w-3.5 h-3.5 rounded-full ${isOnline
                ? "bg-green-500"
                : "bg-gray-500"
                } border-2 border-white`}
            ></span>
          </div>

          {/* Name and Last Message */}
          <div className="flex-1 text-sm">
            <p className="font-medium text-gray-800 truncate">
              {recipientUser?.name}
            </p>
            <p className="text-gray-500 text-xs truncate">
              {latestMessage?.text ? truncateText(latestMessage?.text) : "No messages yet"}
            </p>
          </div>
        </div>

        {/* Activity and Unread Count */}
        <div className="text-right shrink-0">
          <p className="text-xxs text-gray-400">{moment(latestMessage?.createdAt).calendar()}</p>
          {thisUserNotifications?.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xxs font-semibold text-white bg-green-500 rounded-full">
              {thisUserNotifications.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserChat;

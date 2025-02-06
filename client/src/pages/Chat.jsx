import React, { useContext, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Toaster } from 'sonner'
import { ChatContext } from '../context/ChatContext'
import Sidebar from '../components/Sidebar'
import UserChat from '../components/UserChat'
import DiscoverChats from '../components/DiscoverChats'
import ChatBox from '../components/ChatBox'
import { faArrowLeft, faComments, faGear, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { useFetchAllUsers } from '../hooks/useFetchAllUsers'

const Chat = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const { userChats, isUserChatsLoading, updateCurrentChat } = useContext(ChatContext);

  const { allUsers, loading: allUsersLoading } = useFetchAllUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatBoxVisible, setChatBoxVisible] = useState(false);
  const [isDiscoverChatsVisible, setDiscoverChatsVisible] = useState(false); // New state

  const handleChatClick = (chat) => {
    updateCurrentChat(chat);
    setChatBoxVisible(true); // Show ChatBox on small screens
  };

  const handleBackToChats = () => {
    setChatBoxVisible(false); // Show ChatList again
  };

  const handleDiscoverToggle = () => {
    setDiscoverChatsVisible(!isDiscoverChatsVisible); // Toggle DiscoverChats visibility
  };

  const filteredChats = userChats?.filter(chat => {
    if (!user || allUsersLoading) return false;
    const recipientId = chat.members.find(id => id !== user.id);
    const recipient = allUsers.find(u => u._id === recipientId);
    return recipient?.name.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  console.log("filtered chats", filteredChats)

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Sidebar */}
      <Sidebar className="hidden lg:block" />

      <Toaster richColors position='top-center' />

      {/* Bottom Navigation for Small Screens */}
      <div className="lg:hidden fixed bottom-0 z-20 w-full bg-white border-t flex justify-around py-2 shadow-md">
        <button className="flex-1 text-center">
          <FontAwesomeIcon icon={faComments} className="text-gray-600" />
        </button>
        <button className="flex-1 text-center">
          <FontAwesomeIcon icon={faUserGroup} className="text-gray-600" />
        </button>
        <button className="flex-1 text-center">
          <FontAwesomeIcon icon={faGear} className="text-gray-600" />
        </button>
      </div>

      {/* Chats List Section */}
      <div
        className={`w-full lg:w-1/3 lg:my-8 lg:ml-10 lg:mr-4 min-w-[300px] flex flex-col transition-transform duration-300 ${isChatBoxVisible ? "hidden lg:flex" : ""
          }`}
      >
        <div className={`${isDiscoverChatsVisible ? "hidden" : ""} w-full mx-auto rounded-lg border dark:border-gray-800 bg-white min-h-screen lg:min-h-0 dark:bg-customGray h-full flex flex-col`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4">
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">Chats</h1>
            <button
              onClick={handleDiscoverToggle}
              className="px-2 py-1 text-xs font-medium text-gray-900 dark:text-gray-200 bg-transparent rounded-md hover:bg-gray-200 dark:hover:bg-midGray border border-gray-400 dark:border-gray-800"
            >
              + New
            </button>
          </div>


          {/* Search Bar */}
          <div className="p-4">
            <input
              type="text"
              placeholder="Chat search..."
              className="w-full p-3 border bg-transparent text-black dark:text-gray-200 border-gray-300 dark:border-gray-800 rounded-md text-xs focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Chat List */}
          <div className="overflow-y-auto flex-1 scrollbar-hide">
            {!allUsersLoading && filteredChats.length > 0 ? (
              filteredChats.map((chat, index) => (
                <div key={index} onClick={() => handleChatClick(chat)}>
                  <UserChat chat={chat} user={user} />
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-500">
                {allUsersLoading ? 'Loading...' : 'No chats found.'}
              </p>
            )}
          </div>
        </div>
        {/* Discover Chats Section */}
        {isDiscoverChatsVisible && (
          <DiscoverChats
            handleCancel={handleDiscoverToggle}
            onChatSelect={handleChatClick} // reuse the same function as chat list items
          />
        )}

      </div>


      {/* ChatBox Section */}
      <div
        className={`w-full lg:w-2/3 lg:my-8 lg:mx-4 lg:ml-0 min-w-[300px] flex flex-col transition-transform duration-300 ${isChatBoxVisible ? "flex" : "hidden lg:flex"
          }`}
      >
        <ChatBox handleBackToChats={handleBackToChats} />
      </div>
    </div>
  );
};




export default Chat

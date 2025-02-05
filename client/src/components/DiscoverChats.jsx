import React, { useContext, useState } from 'react'
import { ChatContext } from '../context/ChatContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { AuthContext } from '../context/AuthContext'

const DiscoverChats = ({ handleCancel, onChatSelect  }) => {
  const { user } = useContext(AuthContext)
  const { discoverChats, createChat, onlineUsers } = useContext(ChatContext)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter chats based on search query
  const filteredChats = discoverChats.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-full mx-auto rounded-lg border bg-white h-full flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <h1 className="text-lg font-bold text-gray-800">Discover People</h1>
        <button
          onClick={handleCancel}
          className="px-2 py-1 text-xs font-medium text-gray-900 bg-transparent rounded-md hover:bg-gray-200 border border-gray-400"
        >
          Cancel
        </button>
      </div>

      {/* Search bar */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Search people..."
          className="w-full p-3 border bg-transparent text-black border-gray-300 rounded-md text-xs focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Chat list */}
      <div className="overflow-y-auto flex-1 scrollbar-hide">
        {filteredChats.length > 0 ? (
          filteredChats.map((u) => (
            <div
              key={u._id}
              onClick={async () => {
                const newChat = await createChat(user.id, u._id);
                onChatSelect(newChat);             
                handleCancel();
                
              }}
              className="flex items-center justify-between py-4 px-5 bg-transparent border-b border-gray-100 hover:bg-gray-200 transition cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10 bg-gray-300 rounded-full">
                  <div className="w-full h-full overflow-hidden rounded-full">
                    {u?.profile ? (
                      <img
                        src={u?.profile}
                        alt={`${u?.name} profile`}  
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faUserCircle}
                        className="w-full h-full object-cover text-gray-400"
                      />
                    )}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 w-3.5 h-3.5 rounded-full ${onlineUsers?.some((user) => user?.userId === u?._id)
                      ? "bg-green-500"
                      : "bg-gray-500"
                      } border-2 border-white`}
                  ></span>
                </div>

                <div className="text-sm">
                  <p className="font-medium text-gray-800 truncate">{u?.name}</p>
                  <p className="text-gray-500 text-xs truncate">{"user.bio/about"}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-gray-500">No chats found.</p>
        )}
      </div>
    </div>
  )
}

export default DiscoverChats

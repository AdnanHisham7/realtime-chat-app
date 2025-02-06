import React, { useContext, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons'
import { ChatContext } from '../context/ChatContext'
import { AuthContext } from '../context/AuthContext'
import { unreadNotificationsFunc } from '../utils/unreadNotifications'
import moment from 'moment'



const Notification = () => {
    const [isOpen, setIsOpen] = useState(false)
    const { user } = useContext(AuthContext)
    const { notifications, userChats, allUsers, markAllNotificationsRead, markNotificationAsRead } = useContext(ChatContext)

    const unreadNotifications = unreadNotificationsFunc(notifications)

    const modifiedNotifications = notifications.map((n) => {
        const sender = allUsers.find(u => u?._id === n?.senderId)

        return {
            ...n,
            senderName: sender?.name
        }
    })

    return (
        <div className="relative">
            {/* Bell Icon with Notification Badge */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2"
            >
                <FontAwesomeIcon icon={faBell} className="text-xl" />
                {unreadNotifications.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {unreadNotifications.length}
                    </span>
                )}
            </button>

            {/* Dropdown Notification Panel */}
            {isOpen && (
                <div className="absolute left-12 top-0 w-80 bg-white dark:bg-customGray shadow-lg rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
                    {/* Header */}
                    <div className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
                        <button className="text-sm text-blue-500 hover:underline" onClick={() => {
                            markAllNotificationsRead(notifications)
                            setIsOpen(false)
                        }}>
                            Mark all as read
                        </button>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-64 overflow-y-auto scrollbar-hide">
                        {modifiedNotifications.length === 0 ? (
                            <div className="text-gray-500 text-sm text-center py-4">No notifications yet</div>
                        ) : (
                            modifiedNotifications.map((n, index) => (
                                <div
                                    key={index}
                                    className={`px-4 py-3 flex flex-col border-b dark:border-gray-800 ${n.isRead ? "bg-white dark:bg-midGray" : "bg-violet-100 dark:bg-violet-600"
                                        } hover:bg-gray-50 transition`}
                                    onClick={() => {
                                        markNotificationAsRead(n, userChats, user);
                                        setIsOpen(false);
                                    }}
                                >
                                    <span className="text-sm text-gray-800 dark:text-gray-300 font-medium">
                                        {n.senderName} sent you a new message
                                    </span>
                                    <span className={`text-xs ${n.isRead ? "text-gray-500" : "text-gray-500 dark:text-gray-300"} `}>
                                        {moment(n.date).calendar()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );

}

export default Notification

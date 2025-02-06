import React, { useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faUserGroup, faBoxArchive, faMoon, faGear, faArrowRightFromBracket, faSun, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { faCommentDots } from "@fortawesome/free-regular-svg-icons";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Notification from "./Notification";
import Settings from "./Settings";
import Profile from "./Profile";
import { toast } from "sonner";

const Sidebar = () => {
    const { toggleDarkMode, darkMode } = useTheme();
    const { logoutUser } = useContext(AuthContext);

    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [activeTab, setActiveTab] = useState('appearance');
    const [selectedColor, setSelectedColor] = useState(() => localStorage.getItem('primaryColor') || '#6366f1');

    const handleApplyColor = () => {
        document.documentElement.style.setProperty('--primary-color', selectedColor);
        localStorage.setItem('primaryColor', selectedColor);
        toast.info('Your theme has been updated successfully!')
        setShowSettingsModal(false);
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        logoutUser();
        setShowLogoutModal(false);
    };

    const topMenuItems = [
        { icon: <FontAwesomeIcon icon={faUserCircle} />, tooltip: "Profile", onClick: () => setShowProfileModal(true) },
        { icon: <FontAwesomeIcon icon={faCommentDots} />, tooltip: "Chats", onClick: () => window.location.reload() },
        { icon: <FontAwesomeIcon icon={faUserGroup} />, tooltip: "Contacts", onClick: () => console.log("Contacts clicked") },
        { icon: <Notification />, tooltip: "Notifications", onClick: () => console.log("Contacts clicked") },
    ];

    const bottomMenuItems = [
        { icon: <FontAwesomeIcon icon={faBoxArchive} />, tooltip: "Archived Messages", onClick: () => console.log("Archived clicked") },
        { icon: <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />, tooltip: "Switch Mode", onClick: toggleDarkMode },
        { icon: <FontAwesomeIcon icon={faGear} />, tooltip: "Settings", onClick: () => setShowSettingsModal(true) },
        { icon: <FontAwesomeIcon icon={faArrowRightFromBracket} />, tooltip: "Logout", onClick: handleLogout },
    ];

    return (
        <>
            <div className="lg:flex flex-col justify-between h-screen w-20 bg-white dark:bg-customGray text-gray-700 dark:text-gray-100 shadow-lg py-4 hidden">
                {/* Top Section */}
                <div className="flex flex-col items-center space-y-6">
                    {topMenuItems.map((item, index) => (
                        <div
                            key={index}
                            className="group relative flex justify-center items-center w-10 h-10 cursor-pointer bg-gray-100 dark:bg-lightGray hover:bg-gray-200 dark:hover:bg-midGray rounded-2xl transition-colors"
                            onClick={item.onClick}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {/* Tooltip */}
                            <span className="absolute left-12 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all z-10">
                                {item.tooltip}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Spacer for flexible gap */}
                <div className="flex-grow"></div>

                {/* Bottom Section */}
                <div className="flex flex-col items-center space-y-6">
                    {bottomMenuItems.map((item, index) => (
                        <div
                            key={index}
                            className="group relative flex justify-center items-center w-10 h-10 cursor-pointer bg-gray-100 dark:bg-lightGray hover:bg-gray-200 dark:hover:bg-midGray rounded-2xl transition-colors"
                            onClick={item.onClick}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {/* Tooltip */}
                            <span className="absolute left-12 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all z-10">
                                {item.tooltip}
                            </span>
                        </div>
                    ))}
                </div>

                <Profile
                    showModal={showProfileModal}
                    closeModal={() => setShowProfileModal(false)}
                />

                <Settings
                    showModal={showSettingsModal}
                    closeModal={() => setShowSettingsModal(false)}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    handleApplyColor={handleApplyColor}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white dark:bg-customGray rounded-lg p-6 shadow-lg text-center">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            Are you sure you want to logout?
                        </h2>
                        <div className="flex justify-end space-x-2 text-sm">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="px-4 py-2 bg-gray-300 dark:bg-lightGray text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Logout
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;

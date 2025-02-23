import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette, faCookieBite, faVolumeUp, faShieldAlt, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";
import { baseUrl } from "../utils/services";
import { toast } from "sonner";

const colorPalette = [
    { name: 'Violet', value: '#6366f1' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Indigo', value: '#6366f9' },
    { name: 'Gray', value: '#656565' },
    { name: 'Mauve', value: '#988488' },
    { name: 'Deep Teal', value: '#123434' },
    { name: 'Charcoal', value: '#212112' },
    { name: 'Warm Taupe', value: '#897867' },
];

const tabIcons = {
    appearance: faPalette,
    chats: faCookieBite,
    sounds: faVolumeUp,
    "privacy-policy": faShieldAlt,
};

const Settings = ({ showModal, closeModal, selectedColor, setSelectedColor, handleApplyColor, activeTab, setActiveTab }) => {
    const { toggleDarkMode, darkMode } = useTheme();
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [deleteType, setDeleteType] = useState(''); // 'messages' or 'chats'
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteConfirmation = (type) => {
        setDeleteType(type);
        setShowDeleteConfirmation(true);
    };

    const performDeletion = async () => {
        setIsDeleting(true);
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const endpoint = deleteType === 'messages' ? 'messages/delete-all' : 'chats/delete-all';
            
            const response = await axios.delete(`${baseUrl}/${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success(response.data.message);
            setTimeout(() => {
                window.location.reload()
            }, 1000)
        } catch (error) {
            toast.error(`Failed to delete ${deleteType}: ` + (error.response?.data?.message || error.message));
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirmation(false);
        }
    };


    return (
        showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

                {/* Delete Confirmation Modal */}
                {showDeleteConfirmation && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white dark:bg-customGray rounded-lg p-6 shadow-lg text-start">
                            <h2 className=" text-gray-800 dark:text-gray-200 mb-4">
                                Are you sure you want to delete all {deleteType}?
                                <br />
                                This cannot be undone!
                            </h2>
                            <div className="flex justify-end space-x-2 text-sm">
                                <button
                                    onClick={() => setShowDeleteConfirmation(false)}
                                    className="px-4 py-2 bg-gray-300 dark:bg-lightGray text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-400 transition"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={performDeletion}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-customGray rounded-lg p-6 w-[600px] h-[400px] flex relative">
                    {/* Close Button */}
                    <button
                        onClick={closeModal}
                        className="absolute top-2 right-2 text-gray-400 dark:text-gray-600 hover:text-primary transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>

                    {/* Left Tabs */}
                    <div className="flex flex-col w-1/3 border-r dark:border-gray-800 pr-4">
                        {["appearance", "chats", "sounds", "privacy-policy"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-3 text-left text-sm p-2 rounded mb-1 transition-colors duration-300 ${activeTab === tab ? "bg-primary text-white" : "hover:bg-gray-100 dark:hover:bg-midGray"}`}>
                                <FontAwesomeIcon icon={tabIcons[tab]} className={`${activeTab === tab ? "text-white" : ""} text-gray-500 dark:text-gray-300`} />
                                <span>{tab.split("-").join(" ").replace(/\b\w/g, (l) => l.toUpperCase())}</span>
                            </button>
                        ))}
                    </div>

                    {/* Right Content */}
                    <div className="w-2/3 pl-4">
                        {activeTab === 'appearance' && (
                            <div>
                                {/* Dark/Light Theme Toggle */}
                                <div className="flex items-center mb-6">
                                    <label className="text-sm text-gray-700 dark:text-gray-300 mr-4">Dark Mode</label>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={darkMode}
                                            onChange={toggleDarkMode}
                                            id="theme-toggle"
                                            className="toggle-checkbox hidden"
                                        />
                                        <label
                                            htmlFor="theme-toggle"
                                            className={`w-14 h-8 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 cursor-pointer transition-colors duration-300 ${darkMode ? 'bg-primary' : ''}`}
                                        >
                                            <span
                                                className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${darkMode ? 'translate-x-6' : ''}`}
                                            />
                                        </label>
                                    </div>
                                    <label className="text-sm text-gray-700 dark:text-gray-300 ml-4">Light Mode</label>
                                </div>


                                {/* Color Palette */}
                                <div className="mb-4">
                                    <h3 className="font-semibold mb-4">Choose Primary Color</h3>
                                    <div className="grid grid-cols-6 gap-2 w-[250px]">
                                        {colorPalette.map((color) => (
                                            <button
                                                key={color.name}
                                                onClick={() => setSelectedColor(color.value)}
                                                className={`h-8 w-8 rounded-sm ${selectedColor === color.value ? 'ring-2 ring-offset-2' : ''}`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleApplyColor}
                                        className="mt-6 bg-transparent border border-primary text-xs dark:text-white px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-950 transition-colors duration-200"
                                    >
                                        Apply Color
                                    </button>

                                </div>
                            </div>
                        )}

                        {/* Chat Settings Content */}
                        {activeTab === 'chats' && (
                            <div className="space-y-6">
                                <div>
                                    <button
                                        onClick={() => handleDeleteConfirmation('messages')}
                                        className="bg-red-600 text-sm text-white py-2 px-6 rounded hover:bg-red-700 transition-colors"
                                    >
                                        Delete all messages
                                    </button>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Delete all messages from all chats
                                    </p>
                                </div>
                                <div>
                                    <button
                                        onClick={() => handleDeleteConfirmation('chats')}
                                        className="bg-red-600 text-sm text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
                                    >
                                        Delete all chats
                                    </button>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Delete all messages and clear the chats from history
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'privacy-policy' && (
                            <div className="h-full overflow-y-auto scrollbar-hide pr-2">
                                <h2 className="text-lg font-semibold mb-4 dark:text-gray-200">Privacy Policy</h2>
                                <div className="text-xs space-y-4 dark:text-gray-300">
                                    <div>
                                        <h3 className="font-medium mb-2">1. Data Collection</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            We collect the following information to provide our services:
                                        </p>
                                        <ul className="list-disc pl-6 mt-1 space-y-1">
                                            <li>Account information (name, email, profile picture)</li>
                                            <li>Message content and chat history</li>
                                            <li>Device information for connection management</li>
                                            <li>User preferences (theme, color choices)</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-medium mb-2">2. Data Usage</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Your data is used to:
                                        </p>
                                        <ul className="list-disc pl-6 mt-1 space-y-1">
                                            <li>Enable real-time messaging through WebSocket connections</li>
                                            <li>Personalize appearance settings (dark mode, colors)</li>
                                            <li>Maintain chat history and synchronization across devices</li>
                                            <li>Provide account security and authentication</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-medium mb-2">3. Data Storage</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            All user data is:
                                        </p>
                                        <ul className="list-disc pl-6 mt-1 space-y-1">
                                            <li>Encrypted in transit using secure protocols</li>
                                            <li>Stored on secured servers with access controls</li>
                                            <li>Retained until account deletion via settings</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-medium mb-2">4. User Controls</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            You can:
                                        </p>
                                        <ul className="list-disc pl-6 mt-1 space-y-1">
                                            <li>Delete individual messages or entire chats</li>
                                            <li>Update profile information through account settings</li>
                                            <li>Export chat history (contact support)</li>
                                            <li>Manage notification preferences</li>
                                        </ul>
                                    </div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                                        Last updated: 24/2/2025
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    );

};

export default Settings;

import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { baseUrl } from '../utils/services';
import useFetchUserProfile from '../hooks/useFetchUserProfile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

const Profile = ({ showModal, closeModal }) => {
    const { user, setUser } = useContext(AuthContext);
    const { userProfile } = useFetchUserProfile();
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                currentPassword: '',
                newPassword: ''
            });
        }
    }, [user, setUser]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const token = storedUser?.token; // Ensure token exists

            if (!token) {
                return toast.error("User not authenticated. Please log in again.");
            }

            const res = await axios.put(`${baseUrl}/users/update`, {
                name: formData.name,
                email: formData.email
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            toast.success('Profile updated successfully!');
            setTimeout(() => {
                window.location.reload()
            }, 1000)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error updating profile');
        }
    };


    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            await axios.post(`${baseUrl}/users/change-password`, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` } // Removed extra closing brace
            });
            toast.success('Password changed successfully!');
            setFormData({ ...formData, currentPassword: '', newPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error changing password');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
    
        if (!file) {
            return toast.warning("Please select a file.");
        }
    
        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            return toast.warning("Only JPEG and PNG images are allowed.");
        }
    
        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        if (file.size > maxSize) {
            return toast.warning("File size exceeds 2MB. Please upload a smaller image.");
        }
    
        const formData = new FormData();
        formData.append("image", file);
    
        try {
            const token = JSON.parse(localStorage.getItem("user")).token;
            const res = await axios.post(`${baseUrl}/users/upload-image`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
    
            setUser((prev) => ({ ...prev, profileImage: res.data.profileImage }));
            toast.success("Profile image updated!");
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err) {
            toast.error(err.response?.data?.message || "Error uploading image");
        }
    };
    

    return (
        showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-customGray rounded-xl p-6 w-full max-w-2xl shadow-lg flex flex-col md:flex-row gap-6 relative">

                    {/* Close Button */}
                    <button
                        onClick={closeModal}
                        className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 text-2xl hover:text-gray-900 dark:hover:text-white transition"
                    >
                        &times;
                    </button>
                    {/* Left Section: Profile Image */}
                    <div className="flex flex-col items-center md:w-1/3">
                        <label className="cursor-pointer relative">
                            {userProfile?.profileImage && userProfile.profileImage.trim() !== "" ? (
                                <img
                                    src={`${baseUrl}${userProfile.profileImage}`}
                                    className="w-28 h-28 rounded-full object-cover border-2 border-gray-300 dark:border-midGray shadow-sm"
                                    alt="Profile"
                                    onError={(e) => {
                                        e.target.onerror = null; // Prevent infinite loop
                                        e.target.style.display = "none"; // Hide broken image
                                        e.target.nextSibling.style.display = "flex"; // Show fallback icon
                                    }}
                                />
                            ) : null}
                            <div
                                className="w-28 h-28 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center"
                                style={{ display: userProfile?.profileImage && userProfile.profileImage.trim() !== "" ? "none" : "flex" }}
                            >
                                <FontAwesomeIcon icon={faUserCircle} className="text-8xl text-gray-500 dark:text-gray-50" />
                            </div>

                            <input
                                type="file"
                                onChange={handleFileUpload}
                                className="hidden"
                                accept="image/*"
                            />
                        </label>

                        {/* Warning Message */}
                        <p className="text-xxs dark:font-thin text-gray-600 dark:text-gray-300 mt-5 px-4">
                            <span className="font-medium">Important:</span> Only images (JPEG, PNG) are allowed. The maximum file size should be 2MB.
                        </p>
                    </div>


                    {/* Right Section: Profile Forms */}
                    <div className="md:w-2/3">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                            Profile Settings
                        </h2>

                        {/* Profile Form */}
                        <form onSubmit={handleUpdateProfile} className="mb-6">
                            <div className="mb-4">
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full text-sm p-2 border border-gray-300 dark:border-midGray rounded-lg bg-gray-200 dark:bg-lightGray dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full text-sm p-2 border border-gray-300 dark:border-midGray rounded-lg bg-gray-200 dark:bg-lightGray dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-1/3 bg-primary text-sm text-white font-semibold p-2 rounded-lg transition-all"
                            >
                                Save Changes
                            </button>
                        </form>

                        <hr className="my-6 border-gray-300 dark:border-midGray" />

                        {/* Change Password Section */}
                        <button
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                            className="w-full text-left text-primary font-semibold text-sm hover:underline flex items-center"
                        >
                            {showPasswordForm ? "Hide Change Password" : "Change Password"}
                        </button>

                        {/* Change Password Form with Smooth Transition */}
                        <div
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${showPasswordForm ? "max-h-[500px] opacity-100 py-4" : "max-h-0 opacity-0"
                                }`}
                        >
                            <form onSubmit={handleChangePassword} className="p-4 border rounded-lg dark:border-midGray">
                                <div className="mb-4">
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        value={formData.currentPassword}
                                        placeholder='Enter current Password'
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                        className="w-full text-sm p-2 border border-gray-300 dark:border-midGray rounded-lg bg-gray-200 dark:bg-lightGray dark:text-white focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-gray-500"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={formData.newPassword}
                                        placeholder='Enter new Password'
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        className="w-full text-sm p-2 border border-gray-300 dark:border-midGray rounded-lg bg-gray-200 dark:bg-lightGray dark:text-white focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-gray-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-1/2 bg-primary text-sm text-white font-semibold p-2 rounded-lg transition-all"
                                >
                                    Change Password
                                </button>
                            </form>
                        </div>

                    </div>

                </div>
            </div>
        )
    );


};

export default Profile
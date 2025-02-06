import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { baseUrl } from '../utils/services';

const useFetchUserProfile = () => {
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const token = storedUser?.token;

                if (!token) {
                    throw new Error("User not authenticated. Please log in again.");
                }

                const response = await axios.get(`${baseUrl}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setUserProfile(response.data);
            } catch (err) {
                toast.error(err.message || 'Failed to fetch user profile');
            }
        };

        fetchUserProfile();
    }, [baseUrl]);

    return { userProfile };
};

export default useFetchUserProfile;

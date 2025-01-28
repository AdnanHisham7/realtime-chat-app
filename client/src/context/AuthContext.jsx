import axios from "axios";
import { toast } from "sonner";
import { createContext, useCallback, useEffect, useState } from "react";
import { baseUrl } from '../utils/services'
import { useNavigate } from "react-router-dom";


export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null);

    const [isRegisterLoading, setIsRegisterLoading] = useState(false);
    const [registerData, setRegisterData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });
    

    useEffect(() => {
        const user = localStorage.getItem("user")
        setUser(JSON.parse(user))
    }, [])

    const updateRegisterData = useCallback((data) => {
        setRegisterData((prevData) => ({
            ...prevData,
            ...data,
        }));
    }, []);

    const updateLoginData = useCallback((data) => {
        setLoginData((prevData) => ({
            ...prevData,
            ...data,
        }));
    }, []);
    

    const registerUser = useCallback(async (e) => {
        e.preventDefault();
        if (isRegisterLoading) return;

        try {
            setIsRegisterLoading(true);

            const response = await axios.post(`${baseUrl}/users/register`, registerData);
            localStorage.setItem("user", JSON.stringify(response.data));
            setUser(response.data);

            toast.success("Registration successful!");

            setIsRegisterLoading(false);
            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Something went wrong!";
            toast.error(errorMessage);
            setIsRegisterLoading(false);
        }
    }, [registerData, isRegisterLoading]);


    const loginUser = useCallback(
        async (e) => {
            e.preventDefault(); // Fix: Prevent form submission default behavior.
            if (isLoginLoading) return;
    
            try {
                setIsLoginLoading(true);
    
                const response = await axios.post(`${baseUrl}/users/login`, loginData); // Use loginData
                localStorage.setItem("user", JSON.stringify(response.data));
                setUser(response.data);
    
                toast.success("Logging In!");
    
                setIsLoginLoading(false);
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            } catch (error) {
                const errorMessage = error.response?.data?.message || "Something went wrong!";
                toast.error(errorMessage);
    
                setIsLoginLoading(false); // Fix: Correctly reset login loading state.
            }
        },
        [loginData, isLoginLoading]
    );
    

    const logoutUser = useCallback(() => {
        localStorage.removeItem("user")
        setUser(null)
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                registerData,
                updateRegisterData,
                isRegisterLoading,
                registerUser,
                logoutUser,
                loginUser,
                updateLoginData,
                loginData,
                isLoginLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

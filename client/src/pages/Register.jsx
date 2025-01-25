import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

import introImage from '../assets/intro_bg.webp';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import RegisterForm from '../components/RegisterForm';

const Register = () => {

  const { registerData, updateRegisterData }  = useContext(AuthContext)

    return (
        <div className="flex min-h-screen">
            {/* Left Section */}
            <div className="w-2/3 bg-white relative items-center justify-center hidden md:flex">
                {/* Illustration */}
                <img
                    src={introImage}
                    alt="Chat Illustration"
                    className="absolute inset-0 w-full h-full object-contain"
                />
            </div>

            {/* Right Section */}
            <div className="w-full md:w-1/2 flex items-center justify-center md:justify-start px-10 bg-white">
                <div className="w-full max-w-sm">
                    <FontAwesomeIcon icon={faUserCircle} className=" w-full text-8xl md:hidden pb-9 text-gray-400" />
                    <RegisterForm />
                </div>
            </div>
        </div>
    );
};

export default Register;

import React, { useContext, useEffect } from "react";
import { Toaster, toast } from 'sonner'
import { AuthContext } from "../context/AuthContext";

const RegisterForm = () => {
    const { registerData, updateRegisterData, registerUser, isRegisterLoading } = useContext(AuthContext)

    return (
        <div className="max-w-md mx-auto">

            <Toaster richColors position="top-center" />

            {/* Header */}
            <h2 className="text-2xl font-semibold text-black mb-2">Create your account</h2>
            <p className="text-sm text-gray-600 mb-6">
                Already have an account?{" "}
                <a href="/login" className="text-blue-500 font-medium hover:underline">
                    Sign In
                </a>
            </p>

            <form onSubmit={registerUser} className="space-y-6">
                {/* Name Field */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Fullname
                    </label>
                    <input
                        type="text"
                        id="name"
                        placeholder="Enter your fullname"
                        onChange={(e) => updateRegisterData({ name: e.target.value })}
                        className="mt-1 block w-full px-4 py-2 border bg-transparent border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                    />
                </div>

                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Enter your email address"
                        onChange={(e) => updateRegisterData({ email: e.target.value })}
                        className="mt-1 block w-full px-4 py-2 border bg-transparent border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                    />
                </div>

                {/* Password Field */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                        onChange={(e) => updateRegisterData({ password: e.target.value })}

                        className="mt-1 block w-full px-4 py-2 bg-transparent border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isRegisterLoading}
                    className={`w-full py-3 font-medium rounded-md transition-colors ${isRegisterLoading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-200 text-gray-900 hover:bg-green-300"
                        }`}
                >
                    {isRegisterLoading ? "Registering..." : "Register"}
                    
                </button>
            </form>
        </div>
    );
};

export default RegisterForm;



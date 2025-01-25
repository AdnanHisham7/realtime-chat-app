import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Toaster } from "sonner";

const LoginForm = () => {
    const { loginUser,
        updateLoginData,
        loginData,
        isLoginLoading } = useContext(AuthContext)

    return (
        <div className="max-w-md mx-auto">
            {/* Header */}
            <Toaster richColors position="top-center"/>
            <h2 className="text-2xl font-semibold text-black mb-2">Sign in to my account</h2>
            <p className="text-sm text-gray-600 mb-6">
                Didn’t have an account?{" "}
                <a href="/register" className="text-blue-500 font-medium hover:underline">
                    Register
                </a>
            </p>

            <form onSubmit={(e)=> loginUser(e)} className="space-y-6">
                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Enter your email address"
                        onChange={(e) => updateLoginData({ email: e.target.value })}
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
                        onChange={(e) => updateLoginData({ password: e.target.value })}
                        className="mt-1 block w-full px-4 py-2 bg-transparent border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoginLoading}
                    className={`w-full py-3 font-medium rounded-md transition-colors ${isLoginLoading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-200 text-gray-900 hover:bg-green-300"
                    }`}
                >
                    {isLoginLoading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default LoginForm;



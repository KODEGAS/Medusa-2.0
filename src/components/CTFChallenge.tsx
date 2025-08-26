import React, { useState } from 'react';

// No CSS import is needed when using Tailwind utility classes

interface CtfChallengeProps {
    onSuccess: () => void;
}

export function CtfChallenge({ onSuccess }: CtfChallengeProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setMessage('Submitting...');
        setIsSuccess(false);

        try {
            const response = await fetch('http://localhost:3001/api/solve-challenge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Success! Unlocking the registration form...');
                setIsSuccess(true);
                sessionStorage.setItem('ctf_token', data.success_token);
                // Delay allows the user to see the success message
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            } else {
                setMessage(data.message);
                setIsSuccess(false);
            }
        } catch (error) {
            setMessage('Connection Error: Could not reach the server.');
            setIsSuccess(false);
            console.error('Fetch error:', error);
        }
    };

    // Dynamic classes for the message box based on success/error state
    const messageClasses = `mt-6 p-3 rounded-md font-semibold text-center ${isSuccess
        ? 'bg-green-500/20 text-green-300' // Success: semi-transparent green bg, light green text
        : 'bg-red-500/20 text-red-300'     // Error: semi-transparent red bg, light red text
        }`;

    return (
        // Main container with dark theme, padding, and centered
        <div className="max-w-lg mx-auto my-16 p-8 bg-gray-900/50 border border-gray-700 rounded-xl shadow-2xl text-center text-gray-200">

            {/* Heading */}
            <h2 className="text-3xl font-bold mb-2 text-white">
                Solve the Challenge
            </h2>

            {/* Sub-heading */}
            <p className="mb-8 text-gray-400">
                An SQL Injection is required to proceed.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition-colors duration-300"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition-colors duration-300"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md
                               hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                               focus:ring-offset-gray-900 focus:ring-blue-500
                               transition-colors duration-300"
                >
                    Attempt Login
                </button>
            </form>

            {/* Message area for success or error feedback */}
            {message && (
                <p className={messageClasses}>
                    {message}
                </p>
            )}
        </div>
    );
}
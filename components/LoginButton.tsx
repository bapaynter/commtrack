"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login, logout } from "@/app/actions/authActions";
import { LogIn, LogOut, Loader2 } from "lucide-react";

interface LoginButtonProps {
  isAuthenticated: boolean;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  isAuthenticated,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await login(password);
      if (result.success) {
        setShowInput(false);
        setPassword("");
        router.refresh();
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
    router.refresh();
    setIsLoading(false);
  };

  if (isAuthenticated) {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
        Logout
      </button>
    );
  }

  if (showInput) {
    return (
      <form onSubmit={handleLogin} className="flex items-center gap-2">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-indigo-500 w-32"
          autoFocus
        />
        <button
          type="submit"
          disabled={isLoading}
          className="text-indigo-600 hover:text-indigo-700"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowInput(false);
            setError("");
          }}
          className="text-gray-400 hover:text-gray-600 text-xs"
        >
          Cancel
        </button>
        {error && (
          <span className="absolute top-full right-0 mt-1 text-xs text-red-500 bg-white p-1 rounded shadow-sm border border-red-100">
            {error}
          </span>
        )}
      </form>
    );
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
    >
      <LogIn className="w-4 h-4" />
      Login
    </button>
  );
};
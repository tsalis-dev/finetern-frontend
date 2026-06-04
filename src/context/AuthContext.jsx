import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            const { user: userData, token: userToken } = response.data;
            
            setUser(userData);
            setToken(userToken);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', userToken);
            
            return { success: true, role: userData.role };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Terjadi kesalahan saat login.' 
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/register', userData);
            const { user: newUserData, token: userToken } = response.data;
            
            setUser(newUserData);
            setToken(userToken);
            localStorage.setItem('user', JSON.stringify(newUserData));
            localStorage.setItem('token', userToken);
            
            return { success: true, role: newUserData.role };
        } catch (error) {
            console.error('Register error:', error);
            let message = 'Terjadi kesalahan saat mendaftar.';
            if (error.response?.data?.errors) {
                message = Object.values(error.response.data.errors).flat().join(', ');
            }
            return { success: false, message };
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await api.post('/logout');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

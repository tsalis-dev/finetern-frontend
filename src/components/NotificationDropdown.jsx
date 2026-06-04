import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    const fetchNotifications = async () => {
        try {
            const res = await axiosInstance.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Polling every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await axiosInstance.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error("Error marking notification as read", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axiosInstance.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Error marking all as read", error);
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="dropdown">
            <button 
                className="btn btn-light position-relative border-0" 
                type="button" 
                onClick={toggleDropdown}
                data-bs-toggle="dropdown" 
                aria-expanded={isOpen ? "true" : "false"}
            >
                <i className="fa-regular fa-bell fs-5 text-secondary"></i>
                {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
            <ul className={`dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 p-0 ${isOpen ? 'show' : ''}`} style={{width: '380px', maxHeight: '500px', overflowY: 'auto'}}>
                <li className="dropdown-header px-4 py-3 border-bottom d-flex justify-content-between align-items-center sticky-top bg-white z-1">
                    <span className="fw-bold text-dark">Notifikasi</span>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllAsRead} className="btn btn-sm btn-link text-success text-decoration-none p-0">Tandai semua dibaca</button>
                    )}
                </li>
                {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <li key={notif.id} className={notif.is_read ? 'opacity-75' : 'bg-light'}>
                            <div className="dropdown-item px-4 py-3 border-bottom text-wrap" style={{ cursor: 'pointer' }} onClick={() => handleMarkAsRead(notif.id)}>
                                <div className="d-flex gap-3">
                                    <div className="mt-1">
                                        {notif.type === 'application_status' ? (
                                            <i className="fa-solid fa-briefcase text-primary fs-5"></i>
                                        ) : notif.type === 'journal_update' ? (
                                            <i className="fa-solid fa-book text-success fs-5"></i>
                                        ) : (
                                            <i className="fa-solid fa-circle-info text-info fs-5"></i>
                                        )}
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                            <span className={`fw-bold small ${notif.is_read ? 'text-secondary' : 'text-dark'}`}>{notif.title}</span>
                                            {!notif.is_read && <span className="p-1 bg-danger border border-light rounded-circle ms-2 mt-1"></span>}
                                        </div>
                                        <p className="mb-1 small text-muted lh-sm">{notif.message}</p>
                                        <span className="extra-small text-muted">{new Date(notif.created_at).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))
                ) : (
                    <li>
                        <div className="dropdown-item px-4 py-5 text-center text-muted">
                            <i className="fa-regular fa-bell-slash fs-3 mb-2 opacity-50"></i>
                            <p className="mb-0 small">Belum ada notifikasi baru.</p>
                        </div>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default NotificationDropdown;

import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Check login status on page load
    useEffect(() => {
        const fetchUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (!data?.user) {
                navigate('/login'); // Redirect to login if not logged in
            } else {
                setUser(data.user);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div style={{ padding: '30px', textAlign: 'center' }}>
            <h1>🏨 Hotel Booking App</h1>
            {user && <p>Welcome, {user.email}</p>}

            <div style={{ marginTop: '40px' }}>
                <button onClick={() => navigate('/search')} style={btnStyle}>Book a Room</button>
                <button onClick={() => navigate('/bookings')} style={btnStyle}>My Bookings</button>
                <button onClick={handleLogout} style={btnStyle}>Logout</button>
            </div>
        </div>
    );
}

const btnStyle = {
    margin: '10px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer'
};

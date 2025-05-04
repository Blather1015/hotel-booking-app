import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const fetchBookings = async () => {
        const { data: session } = await supabase.auth.getUser();
        const userId = session?.user?.id;

        if (!userId) {
            setMessage('Please login first.');
            navigate('/login');
            return;
        }

        const { data, error } = await supabase
            .from('bookings')
            .select('id, room_id, date, rooms(number, room_type)')
            .eq('user_id', userId)
            .order('date', { ascending: true });

        if (error) {
            console.error('Error fetching bookings:', error);
            setMessage('Error loading your bookings.');
        } else {
            setBookings(data);
        }
    };

    const cancelBooking = async (bookingId, roomId, date) => {
        // Delete booking
        const { error: deleteError } = await supabase
            .from('bookings')
            .delete()
            .eq('id', bookingId);

        if (deleteError) {
            setMessage('Failed to cancel booking: ' + deleteError.message);
            return;
        }

        // Mark room as available
        await supabase
            .from('room_availability')
            .update({ is_booked: false })
            .eq('room_id', roomId)
            .eq('date', date);

        setMessage('Booking cancelled.');
        fetchBookings(); // Refresh list
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate('/home')} style={{ marginBottom: '20px' }}>
                ← Back to Home
            </button>

            <h2>📘 My Bookings</h2>
            <p>{message}</p>

            {bookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                <ul>
                    {bookings.map((b) => (
                        <li key={b.id} style={{ marginBottom: '10px' }}>
                            Room {b.rooms.number} ({b.rooms.room_type}) — {b.date}
                            <button
                                onClick={() => cancelBooking(b.id, b.room_id, b.date)}
                                style={{ marginLeft: '10px' }}
                            >
                                Cancel
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

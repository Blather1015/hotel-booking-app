import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function BookingPage() {
    const [date, setDate] = useState('');
    const [rooms, setRooms] = useState([]);
    const [availability, setAvailability] = useState({});
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRooms = async () => {
            const { data, error } = await supabase.from('rooms').select('*').order('id');
            if (error) {
                console.error('Error fetching rooms:', error);
                setMessage('Error loading rooms.');
            } else {
                setRooms(data);
            }
        };
        fetchRooms();
    }, []);

    const fetchAvailability = async () => {
        if (!date) {
            setMessage('Please select a date.');
            return;
        }

        const { data, error } = await supabase
            .from('room_availability')
            .select('room_id, is_booked')
            .eq('date', date);

        if (error) {
            console.error('Error checking availability:', error);
            setMessage('Error checking availability.');
        } else {
            const availMap = {};
            data.forEach((entry) => {
                availMap[entry.room_id] = !entry.is_booked;
            });
            setAvailability(availMap);
            setMessage(`Availability for ${date} loaded.`);
        }
    };

    const bookRoom = async (roomId) => {
        const { data: sessionData } = await supabase.auth.getUser();
        const userId = sessionData?.user?.id;

        if (!userId) {
            setMessage('You must be logged in to book.');
            return;
        }

        const { data: availData, error: findError } = await supabase
            .from('room_availability')
            .select('id')
            .eq('room_id', roomId)
            .eq('date', date)
            .single();

        if (findError || !availData) {
            setMessage('Room is not available on that date.');
            return;
        }

        const availabilityId = availData.id;

        const { error: bookingError } = await supabase.from('bookings').insert({
            user_id: userId,
            room_id: roomId,
            date,
        });

        if (bookingError) {
            setMessage('Booking failed: ' + bookingError.message);
        } else {
            await supabase
                .from('room_availability')
                .update({ is_booked: true })
                .eq('id', availabilityId);

            setMessage('✅ Booking successful!');
            fetchAvailability();
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate('/home')} style={{ marginBottom: '20px' }}>
                ← Back to Home
            </button>

            <h2>📅 Room Booking</h2>

            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ marginRight: '10px' }}
            />
            <button onClick={fetchAvailability}>Check Availability</button>

            <p style={{ color: 'green', marginTop: '15px' }}>{message}</p>

            <ul style={{ marginTop: '20px' }}>
                {rooms.map((room) => {
                    const isAvailable = availability[room.id];
                    return (
                        <li key={room.id} style={{ marginBottom: '10px' }}>
                            Room {room.number} ({room.room_type}) —{' '}
                            {date
                                ? isAvailable
                                    ? 'Available'
                                    : 'Unavailable'
                                : 'Select a date'}
                            <button
                                onClick={() => bookRoom(room.id)}
                                disabled={!isAvailable || !date}
                                style={{ marginLeft: '10px' }}
                            >
                                Book
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

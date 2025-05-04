// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './AuthPage';
import HomePage from './HomePage';
import BookingPage from './BookingPage';
import MyBookingsPage from './MyBookingsPage';
// You'll add more pages like SearchPage, BookingsPage later

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<AuthPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/search" element={<BookingPage />} />
                <Route path="/bookings" element={<MyBookingsPage />} />
                {/* Add more routes here */}
                <Route path="*" element={<p>404 - Page Not Found</p>} />
            </Routes>
        </BrowserRouter>
    );
}

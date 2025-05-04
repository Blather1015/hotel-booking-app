import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // ✅ Add this

    const handleAuth = async () => {
        setMessage('');
        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setMessage(error.message);
            } else {
                navigate('/home'); // ✅ Redirect to home page after login
            }
        } else {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) {
                setMessage(error.message);
            } else {
                const { user } = data;
                const insertResult = await supabase.from('users').insert([
                    {
                        id: user.id,
                        email: user.email,
                        hashed_password: password // if required by your users table
                    }
                ]);
                if (insertResult.error) {
                    setMessage('Signup ok, but failed to insert into users table: ' + insertResult.error.message);
                } else {
                    setMessage('Signup successful! You can log in now.');
                }
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            /><br />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            /><br />
            <button onClick={handleAuth}>{isLogin ? 'Login' : 'Sign Up'}</button>
            <p style={{ color: 'red' }}>{message}</p>
            <p>
                {isLogin ? 'No account?' : 'Already have an account?'}{' '}
                <button onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Sign Up' : 'Login'}
                </button>
            </p>
        </div>
    );
}

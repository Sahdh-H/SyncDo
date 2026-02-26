import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Mail, Lock, User as UserIcon, ArrowRight, Heart } from 'lucide-react';
import axios from 'axios';

const Login = ({ setToken }) => {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isSignup ? '/auth/signup' : '/auth/login';
            const payload = isSignup ? { email: email.trim(), password, name: name.trim() } : { email: email.trim(), password };

            const response = await axios.post(`http://localhost:8000${endpoint}`, payload);
            setToken(response.data.access_token);
        } catch (err) {
            setError(err.response?.data?.detail || 'Oops! Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="card"
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ background: '#eef2ff', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                        <Smile size={48} color="#6366f1" />
                    </div>
                    <h1 className="auth-title">SyncDo</h1>
                    <p className="auth-subtitle">
                        {isSignup ? 'Let\'s create your free account!' : 'Welcome back! Please sign in.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                        {isSignup && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="input-group"
                            >
                                <label className="input-label">What is your name?</label>
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="input-group">
                        <label className="input-label">Your Email or Username</label>
                        <input
                            type="text"
                            placeholder="e.g. john@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Choose a Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? 'Working...' : isSignup ? 'Create My Account' : 'Sign In Now'}
                        <ArrowRight size={20} />
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button
                        onClick={() => { setIsSignup(!isSignup); setError(''); }}
                        className="btn btn-ghost"
                        style={{ fontSize: '1rem', fontWeight: '600' }}
                    >
                        {isSignup ? "I already have an account" : "I don't have an account yet"}
                    </button>

                    {!isSignup && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                <strong>Quick Test Mode:</strong><br />
                                Use <span style={{ color: '#6366f1', fontWeight: '800' }}>admin</span> for both fields!
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>

            <p style={{ textAlign: 'center', marginTop: '2rem', color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                Made with <Heart size={14} color="#ef4444" fill="#ef4444" /> for you
            </p>
        </div>
    );
};

export default Login;

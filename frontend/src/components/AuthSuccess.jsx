import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthSuccess = ({ setToken }) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            setToken(token);
            navigate('/');
        } else {
            navigate('/login');
        }
    }, [location, setToken, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="pulsating text-primary-neon font-bold text-xl uppercase tracking-widest">
                Authenticating...
            </div>
        </div>
    );
};

export default AuthSuccess;

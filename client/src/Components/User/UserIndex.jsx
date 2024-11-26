import '../CSS/user.css';
import { useNavigate } from 'react-router-dom';
import UserLogout from '../../UserLogout';
import { useAuth } from '../../auth/AuthContext';
import { useEffect } from 'react';

const UserIndex = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else if (user && user.table !== 'user_details') {
            navigate('/login');
        }
    }, [isAuthenticated, user, navigate]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="index-responder-body">
            <UserLogout />

            <div className="index-tabs-reporter">
                <button 
                    className="report-btn" 
                    onClick={() => navigate('/user/photo')}
                ></button>
                <div className="text-container">
                    <p className="report-text">REPORT</p>
                    <p className="sub-text">IF THERE'S AN EMERGENCY, CLICK THE RED BUTTON</p>
                </div>
            </div>
        </div>
    );
}

export default UserIndex;
import React, { useState } from "react";
import "./Login.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import api from '../../config/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/checkAllTables', {
        username,
        password
      });
      
      if (response.data.message === "Login Successful") {
        // Get the user details after successful login
        const sessionResponse = await api.get('/checkSession');
        if (sessionResponse.data.isAuthenticated) {
          login(sessionResponse.data.user); // Pass the user data to context
          
          switch (response.data.table) {
            case 'admin_details':
              navigate("/admin/home");
              break;
            case 'user_details':
              navigate("/user/index");
              break;
            case 'police_details':
              navigate("/police/home");
              break;
            case 'responder_details':
              navigate("/responder/home");
              break;
            case 'unit_details':
              navigate("/unit/home");
              break;
            case 'barangay_details':
              navigate("/barangay/home");
              break;
            default:
              alert("Unknown table");
          }
        }
      } else {
        alert("Invalid Credentials");
      }
    } catch (error) {
      console.error(error);
      alert("Login failed. Please try again.");
    }
  }

  return (
    <div className="body-login">
      <div className="wrapper-login">
        <div className="formbox-login">
          <form onSubmit={handleSubmit}>
            <h1>Login</h1>
            <div className="inputbox-login">
              <input type="text" id="username" placeholder="Username" 
                onChange={e => setUsername(e.target.value)} required />
              <FontAwesomeIcon icon={faEnvelope} className="icon" />
            </div>
            <div className="inputbox-login">
              <input type="password" id="password" placeholder="Password" 
                onChange={e => setPassword(e.target.value)} required />
              <FontAwesomeIcon icon={faLock} className="icon" />
            </div>
            <div className="remember-forgot-login">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#">Forgot password?</a>
            </div>
            <button className="btn-login" type="submit">   
              Login
            </button>
            <div className="register-link-login">
              <p>Don't have an account? <Link to="/register">Create Account</Link></p>
            </div> 
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
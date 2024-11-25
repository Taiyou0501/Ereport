import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import '../CSS/Dashboard.css';
import logo from'../Assets/newbackground.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faFile, faUsers, faCircleUser, faRightToBracket, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Logout from '../../Logout';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch('http://localhost:8081/checkSession', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        if (data.isAuthenticated) {
          setUserDetails(data.user);
          setEditedDetails(data.user);
        } else {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleNavigation = (path) => {
    navigate(path, { replace: true });
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedDetails({ ...editedDetails, [name]: value });
  };

  const handleSaveClick = async () => {
    try {
      const response = await fetch('http://localhost:8081/updateAccount', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editedDetails),
      });
      const data = await response.json();
      if (response.ok) {
        setUserDetails(editedDetails);
        setIsEditing(false);
        setErrorMessage('');
      } else {
        setErrorMessage(data.message || 'Error updating account details');
      }
    } catch (error) {
      console.error('Error updating account details:', error);
      setErrorMessage('Error updating account details');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="body">
      <nav className="sidebar">
        <header className="header">
          <div className="image-text">
            <span className="image">
              <img src={logo} alt="logo" />
              <span className="title">Electronic</span>
              <span className="title">Response</span>
              <span className="title">Portal</span>
            </span>
          </div>
        </header>
        <div className="menu-bar">
          <div className="menu">
            <ul className="menu-links">
              <li className="nav-link">
                <a onClick={() => handleNavigation('/admin/home')}>
                  <FontAwesomeIcon icon={faHouse} className="icon" />
                  <span className="text nav-text">Home</span>
                </a>
              </li>
              <li className="nav-link">
                <a onClick={() => handleNavigation('/admin/reports')}>
                  <FontAwesomeIcon icon={faFile} className="icon" />
                  <span className="text nav-text">Reports</span>
                </a>
              </li>
              <li className="nav-link">
                <a onClick={() => handleNavigation('/admin/accounts')}>
                  <FontAwesomeIcon icon={faUsers} className="icon" />
                  <span className="text nav-text">Accounts</span>
                </a>
              </li>
              <li className="nav-link">
                <a onClick={() => handleNavigation('/admin/profile')}>
                  <FontAwesomeIcon icon={faCircleUser} className="icon" />
                  <span className="text nav-text">Profile</span>
                </a>
              </li>
            </ul>
          </div>
          <div className="bottom-content">
            <Logout />
          </div>
        </div>
      </nav>
      <section className="home">
        <div className="text">Dashboard</div>
        <div className="text">Welcome, Admin</div>
        <div className={`tabs-profile ${isEditing ? 'editing-mode' : ''}`}>
          <div className="new-wrapper">
            <form action="">
              <div className="profile-info">
                <h1>Profile</h1>
                {userDetails ? (
                  <div className={`two-forms ${isEditing ? 'landscape' : ''}`}>
                    <div className="form-group">
                      <div className="title">FirstName: </div>
                      <div className="subtext">
                        {isEditing ? (
                          <input
                            type="text"
                            name="firstname"
                            value={editedDetails.firstname}
                            onChange={handleInputChange}
                          />
                        ) : (
                          userDetails.firstname
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="title">Lastname: </div>
                      <div className="subtext">
                        {isEditing ? (
                          <input
                            type="text"
                            name="lastname"
                            value={editedDetails.lastname}
                            onChange={handleInputChange}
                          />
                        ) : (
                          userDetails.lastname
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="title">Username: </div>
                      <div className="subtext">
                        {isEditing ? (
                          <input
                            type="text"
                            name="username"
                            value={editedDetails.username}
                            onChange={handleInputChange}
                          />
                        ) : (
                          userDetails.username
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="title">Email: </div>
                      <div className="subtext">
                        {isEditing ? (
                          <input
                            type="text"
                            name="email"
                            value={editedDetails.email}
                            onChange={handleInputChange}
                          />
                        ) : (
                          userDetails.email
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="title">Password: </div>
                      <div className="subtext">
                        {isEditing ? (
                          <>
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={editedDetails.password}
                              onChange={handleInputChange}
                            />
                            <button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="password-toggle-btn"
                            >
                              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                          </>
                        ) : (
                          "********"
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      <div className="title">Role: </div>
                      <div className="subtext">{userDetails.role}</div>
                    </div>
                    <div className="form-group">
                      <div className="title">CP Number: </div>
                      <div className="subtext">
                        {isEditing ? (
                          <input
                            type="text"
                            name="cpnumber"
                            value={editedDetails.cpnumber}
                            onChange={handleInputChange}
                          />
                        ) : (
                          userDetails.cpnumber
                        )}
                      </div>
                    </div>
                    {isEditing ? (
                      <>
                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                        <button type="button" className='save' onClick={handleSaveClick}>
                          Save
                        </button>
                      </>
                    ) : (
                      <button type="button" className='save' onClick={handleEditClick}>
                        Edit Account
                      </button>
                    )}
                  </div>
                ) : (
                  <div>Loading...</div>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
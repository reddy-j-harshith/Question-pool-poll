import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../components/AuthContext';
import './Toolbar.css';

function Toolbar() {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login'); // Redirect to login page after logout
  };

  // Only render the toolbar if the user is logged in
  if (!user) {
    return null;
  }

  return (
    <nav className="toolbar">
      <ul className="toolbar-menu">
        <li>
          {/* Conditional link rendering based on user role */}
          <Link to={user && user.is_staff ? "/admin" : "/home"} className="toolbar-link">Home</Link>
        </li>
        {/* Conditionally render the Profile link based on user role */}
        {!user?.is_staff && (
          <li>
            <Link to="/profile" className="toolbar-link">Profile</Link>
          </li>
        )}
        {user?.is_staff && (
          <li>
            <Link to="/test" className="toolbar-link">Test</Link>
          </li>
        )}
        {user ? (
          <li>
            <button onClick={handleLogout} className="toolbar-link">Logout</button>
          </li>
        ) : (
          <></>
        )}
      </ul>
    </nav>
  );
}

export default Toolbar;

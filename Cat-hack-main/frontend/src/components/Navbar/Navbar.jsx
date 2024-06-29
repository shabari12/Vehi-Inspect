import React, { useState, useEffect } from "react";
import "./Navbar.css";
import logo from "../../assets/logo.png";
import arrow_icon from "../../assets/arrow_icon.png";
import { Link } from "react-router-dom";
import LoginPopup from "../LoginPop/LoginPop"; // Assuming LoginPopup is in the same directory
import { auth, signOut, refreshToken } from "../../context/firebase"; // Import refreshToken
import { onAuthStateChanged } from "firebase/auth"; // Import onAuthStateChanged from firebase/auth

const Navbar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null); // State to keep track of the logged-in user

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Optionally, you can force refresh the token periodically
        const intervalId = setInterval(() => {
          refreshToken();
        }, 3600000); // Refresh token every hour (adjust as needed)

        // Clear interval on component unmount
        return () => clearInterval(intervalId);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear user state on logout
    } catch (error) {
      console.error("Error during logout", error);
    }
  };

  const languageHandler = (language) => {
    // Implement language selection logic here
    console.log(`Switching to ${language} language`);
    // You can add logic to change language settings or store in state/context
  };

  return (
    <nav className="navbar">
      <Link to='/' className="logo">
        CatInspect
      </Link>
      <ul>
        <Link to='/'><li>Home</li></Link>
        <li>Documentation</li>
        <Link to='/inspect'><li>Inspection</li></Link>
        <Link to='./records'>Records</Link>
      </ul>
      <div className="nav-right">
        <select onChange={(e) => languageHandler(e.target.value)}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
        {user ? (
          <button onClick={handleLogout}>
            Logout <img src={arrow_icon} alt="arrow icon" />
          </button>
        ) : (
          <button onClick={() => setShowLogin(true)}>
            Sign up <img src={arrow_icon} alt="arrow icon" />
          </button>
        )}
      </div>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
    </nav>
  );
};

export default Navbar;

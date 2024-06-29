import React, { useState } from "react";
import "./LoginPop.css";
import cross_icon from '../../assets/cross_icon.png';
import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, doc, setDoc } from "../../context/firebase";

const LoginPopup = ({ setShowLogin }) => {
  const [isSignup, setIsSignup] = useState(false); // State to manage login/signup toggle
  const [formData, setFormData] = useState({
    username: "",
    catId: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, catId, email, password } = formData;

    try {
      if (isSignup) {
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Add user to Firestore
        await setDoc(doc(db, "users", user.uid), {
          username,
          catId,
          email
        });
      } else {
        // Log in
        await signInWithEmailAndPassword(auth, email, password);
      }

      setShowLogin(false); // Close the popup on successful login/signup
    } catch (error) {
      console.error("Error during authentication", error);
    }
  };

  const toggleForm = () => {
    setIsSignup(!isSignup); // Toggle between login and signup forms
  };

  return (
    <div className="login-popup">
      <form className="login-popup-container" onSubmit={handleSubmit}>
        <div className="login-popup-title">
          <h2>{isSignup ? "Sign Up" : "Login"}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={cross_icon}
            alt="Close"
          />
        </div>
        {isSignup && (
          <>
            <div className="login-popup-inp">
              <input
                name="username"
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <input
                name="catId"
                type="text"
                placeholder="CatId"
                value={formData.catId}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}
        <div className="login-popup-inp">
          <input
            name="email"
            type="email"
            placeholder="Your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {!isSignup && (
            <p>
              Create a new account?{" "}
              <span onClick={toggleForm}>Click Here</span>
            </p>
          )}
        </div>
        <button type="submit">{isSignup ? "Sign Up" : "Login"}</button>
        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use and privacy policy</p>
        </div>
        {isSignup && (
          <p>
            Already have an account?{" "}
            <span onClick={toggleForm}>Login Here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;

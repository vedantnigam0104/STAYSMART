// src/LoginPage.jsx

import React, { useContext, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../UserContext.jsx";
import { auth, googleProvider } from '../firebase-config'; // Import firebase-config
import { signInWithPopup } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const { setUser } = useContext(UserContext);

  async function handleLoginSubmit(ev) {
    ev.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:4000/api/login', { email, password });
      setUser(data);
      alert('Login successful');
      setRedirect(true);
    } catch (e) {
      alert('Login failed');
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      // Perform Google sign-in
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log(user);
  
      // Prepare user data
      const userData = {
        email: user.email,
        name: user.displayName,
        avatar: user.photoURL, // Include the Google profile picture URL
        isGoogleSignIn: true
      };
  
      // Send user info to your backend
      const { data } = await axios.post('http://localhost:4000/api/login', userData);
      
      // Set user data in context
      setUser(data);
      
      // Redirect or show success message
      alert('Google login successful');
      setRedirect(true);
  
    } catch (error) {
      console.error('Google sign-in error:', error);
      alert('Google login failed');
    }
  };
  

  if (redirect) {
    return <Navigate to={'/'} />;
  }

  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-64">
        <h1 className="text-4xl text-center mb-4">Login</h1>
        <form className="max-w-md mx-auto" onSubmit={handleLoginSubmit}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={ev => setEmail(ev.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={ev => setPassword(ev.target.value)}
          />
          <button className="primary">Login</button>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded mx-auto block"
          >
            Sign in with Google
          </button>
          <div className="text-center py-2 text-gray-500">
            Don't have an account yet? <Link className="underline text-black" to={'/register'}>Register now</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

import { Link, Navigate, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";

export default function Headers() {
  const navigate = useNavigate();
  const {userInfo, setUserInfo} = useContext(UserContext);

  useEffect(() => {
    fetch('http://localhost:4000/api/auth/profile', {
      credentials: 'include',
    }).then(response => {
      response.json().then(userInfo => setUserInfo(userInfo))
    });
  }, []);

  function logout() {
    fetch('http://localhost:4000/api/auth/logout', {
      credentials: 'include',
      method:'POST'
    });
    setUserInfo({});
    navigate('/');
  }

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">MyBlog</Link>

      {!username && 
        <nav>        
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>  </nav>}

      {username && 
        <nav>
          <Link to="/create">Create New Post</Link>
          <a onClick={logout}>Logout</a>  </nav>}
    </header>
  );
}
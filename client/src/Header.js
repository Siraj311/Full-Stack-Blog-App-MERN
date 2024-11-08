import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";

export default function Headers() {
  const {userInfo, setUserInfo} = useContext(UserContext);

  useEffect(() => {
    fetch('http://localhost:4000/profile', {
      credentials: 'include',
    }).then(response => {
      response.json().then(userInfo => setUserInfo(userInfo))
    });
  }, []);

  function logout() {
    fetch('http://localhost:4000/logout', {
      credentials: 'include',
      method:'POST'
    });
    setUserInfo(null);
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
import logo from './logo.svg';
import './App.css';
import Post from './Post';
import Header from './Header';
import {Routes, Route} from 'react-router-dom';
import Layout from './Layout.js';
import IndexPage from './pages/IndexPage.js';
import RegisterPage from './pages/RegisterPage.js';
import LoginPage from './pages/LoginPage.js';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<IndexPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
      </Route>
    </Routes>


  );
}

export default App;

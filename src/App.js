import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import './App.css';
import AllRoutes from './allRoute';
import { checkLogin } from './actions/checkLogin';
import { checkAdminLogin } from './actions/checkAdminLogin';
import { getCookie } from './helpers/cookie';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if user has valid cookie (token/userId) from previous login
    const userId = getCookie('userId');
    const fullName = getCookie('fullName');
    if (userId && fullName) {
      dispatch(checkLogin(true, userId));
    }

    // Check if admin is logged in
    const adminToken = getCookie('adminToken');
    if (adminToken) {
      dispatch(checkAdminLogin(true, adminToken));
    }
  }, [dispatch]);

  return (
    <AllRoutes />
  );
}

export default App;

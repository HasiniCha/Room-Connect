import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const Navbar = () => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          RoomConnect
        </Link>
        <div className="flex gap-4 items-center">
          <Link to="/" className="hover:text-blue-200">
            Properties
          </Link>
          {token ? (
            <>
              <Link to="/messages" className="hover:text-blue-200">
      💬 Messages
    </Link>
    {/* ... other links ... */}
              <Link to="/dashboard" className="hover:text-blue-200">
                Dashboard
              </Link>
              <Link to="/bookings" className="hover:text-blue-200">
                My Bookings
              </Link>
              <Link to="/maintenance" className="hover:text-blue-200">
                Maintenance
              </Link>
              {user?.role === 'landlord' && (
                <>
                <Link to="/properties/create" className="hover:text-blue-200">
                  Add Property
                </Link>
                <Link to="/landlord/bookings" className="hover:text-blue-200">
      Manage Bookings
    </Link>
    </>
              )}
              <span className="text-sm">
                {user?.firstName} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
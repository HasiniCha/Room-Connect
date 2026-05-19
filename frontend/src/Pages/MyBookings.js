import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMyBookings } from '../redux/slices/bookingsSlice';

const MyBookings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading, error } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === 'tenant') {
      dispatch(fetchMyBookings());
    }
  }, [dispatch, user]);

  // Landlords should use Manage Bookings instead
  if (user?.role === 'landlord') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Manage Your Properties</h2>
          <p className="text-gray-600 mb-6">
            As a landlord, you can view and manage bookings from tenants in the Manage Bookings section.
          </p>
          <button
            onClick={() => navigate('/landlord/bookings')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go to Manage Bookings
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      {list.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-4">No bookings yet.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{booking.title}</h3>
                  <p className="text-gray-600">{booking.address}, {booking.city}</p>
                </div>
                <span className={`px-4 py-2 rounded text-white ${
                  booking.status === 'confirmed' ? 'bg-green-500' :
                  booking.status === 'pending' ? 'bg-yellow-500' :
                  booking.status === 'active' ? 'bg-blue-500' : 'bg-gray-500'
                }`}>
                  {booking.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-600">Start Date</p>
                  <p className="font-semibold">{formatDate(booking.start_date)}</p>
                </div>
                <div>
                  <p className="text-gray-600">End Date</p>
                  <p className="font-semibold">{formatDate(booking.end_date)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Monthly Rent</p>
                  <p className="font-semibold text-blue-600">
                    Rs. {booking.monthly_rent?.toLocaleString()}
                  </p>
                </div>
              </div>
              {(booking.status === 'confirmed' || booking.status === 'active') && (
                <button
                  onClick={() => navigate(`/chat/booking-${booking.id}`, {
                    state: {
                      otherUser: { firstName: 'Landlord', lastName: '', role: 'landlord' },
                      propertyTitle: booking.title
                    }
                  })}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  💬 Chat with Landlord
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
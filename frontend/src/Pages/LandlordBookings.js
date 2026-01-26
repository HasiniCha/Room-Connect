import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchLandlordBookings, updateBookingStatus } from '../redux/slices/bookingsSlice'; // FIXED: Added 's'

const LandlordBookings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading, error } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === 'landlord') {
      dispatch(fetchLandlordBookings());
    }
  }, [dispatch, user]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await dispatch(updateBookingStatus({ bookingId, status: newStatus })).unwrap();
      alert(`Booking ${newStatus} successfully!`);
    } catch (error) {
      alert('Failed to update booking status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      active: 'bg-green-500',
      cancelled: 'bg-red-500',
      completed: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (user?.role !== 'landlord') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Only landlords can access this page
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading bookings: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Property Bookings</h1>
      
      {list.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{booking.title}</h3>
                  <p className="text-gray-600 mb-1">
                    {booking.address}, {booking.city}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    <strong>Tenant:</strong> {booking.first_name} {booking.last_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Email:</strong> {booking.email}
                  </p>
                  {booking.phone && (
                    <p className="text-sm text-gray-500">
                      <strong>Phone:</strong> {booking.phone}
                    </p>
                  )}
                </div>
                <span
                  className={`px-4 py-2 rounded text-white ${getStatusColor(booking.status)}`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
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

              {booking.status === 'pending' && (
                <div className="border-t pt-4 flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                  >
                    ✓ Confirm Booking
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                    className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                  >
                    ✗ Reject Booking
                  </button>
                </div>
              )}

              {booking.status === 'confirmed' && (
                <div className="border-t pt-4 flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate(booking.id, 'active')}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                    Mark as Active
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                    className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                  >
                    Cancel Booking
                  </button>
                  <button
                    onClick={() => navigate(`/chat/booking-${booking.id}`, {
                      state: {
                        otherUser: {
                          firstName: booking.first_name,
                          lastName: booking.last_name,
                          role: 'tenant'
                        },
                        propertyTitle: booking.title
                      }
                    })}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                  >
                    💬 Chat with Tenant
                  </button>
                </div>
              )}

              {booking.status === 'active' && (
                <div className="border-t pt-4 flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate(booking.id, 'completed')}
                    className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                  >
                    Mark as Completed
                  </button>
                  <button
                    onClick={() => navigate(`/chat/booking-${booking.id}`, {
                      state: {
                        otherUser: {
                          firstName: booking.first_name,
                          lastName: booking.last_name,
                          role: 'tenant'
                        },
                        propertyTitle: booking.title
                      }
                    })}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                  >
                    💬 Chat with Tenant
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandlordBookings;
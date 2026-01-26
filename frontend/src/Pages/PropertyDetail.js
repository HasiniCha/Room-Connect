import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createBooking } from '../redux/slices/bookingsSlice';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const property = useSelector((state) =>
    state.properties.list.find((p) => p.id === parseInt(id))
  );

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Property not found</div>
      </div>
    );
  }

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'tenant') {
      alert('Only tenants can book properties');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }

    try {
      setLoading(true);
      await dispatch(
        createBooking({
          propertyId: property.id,
          startDate,
          endDate,
        })
      ).unwrap();
      alert('Booking created successfully!');
      navigate('/bookings');
    } catch (error) {
      alert('Failed to create booking: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back to Properties
      </button>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-96 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-xl">Property Image</span>
        </div>
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600 mb-2">
                <strong>City:</strong> {property.city}
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Address:</strong> {property.address}
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Rooms:</strong> {property.rooms}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                Rs. {property.monthly_rent?.toLocaleString()}/month
              </p>
              <p className="text-gray-600">
                <strong>Deposit:</strong> Rs. {property.deposit_amount?.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-700">{property.description}</p>
          </div>

          {user?.role === 'tenant' && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-4">Book This Property</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <button
                onClick={handleBooking}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating Booking...' : 'Book Now'}
              </button>
            </div>
          )}

          {!user && (
            <div className="border-t pt-6">
              <p className="text-center mb-4">Please login to book this property</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
              >
                Login to Book
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
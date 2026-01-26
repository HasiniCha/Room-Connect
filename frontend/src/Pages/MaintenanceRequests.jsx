import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMaintenanceRequests,
  createMaintenanceRequest,
  updateRequestStatus,
} from '../redux/slices/maintenanceSlice';
import { fetchMyBookings } from '../redux/slices/bookingsSlice';

const MaintenanceRequests = () => {
  const dispatch = useDispatch();
  const { requests, loading } = useSelector((state) => state.maintenance);
  const { user } = useSelector((state) => state.auth);
  const { list: bookings } = useSelector((state) => state.bookings);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: '',
    title: '',
    description: '',
    priority: 'medium',
  });

  useEffect(() => {
    dispatch(fetchMaintenanceRequests());
    if (user?.role === 'tenant') {
      dispatch(fetchMyBookings());
    }
  }, [dispatch, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createMaintenanceRequest(formData)).unwrap();
      setFormData({ propertyId: '', title: '', description: '', priority: 'medium' });
      setShowForm(false);
    } catch (error) {
      alert('Failed to create request: ' + error);
    }
  };

  const handleStatusUpdate = (requestId, newStatus) => {
    dispatch(updateRequestStatus({ requestId, status: newStatus }));
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500',
    };
    return colors[priority] || 'bg-gray-500';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Maintenance Requests</h1>
        {user?.role === 'tenant' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'New Request'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Create Maintenance Request</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Property</label>
              <select
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a property</option>
                {bookings.map((booking) => (
                  <option key={booking.id} value={booking.property_id}>
                    {booking.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Submit Request
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No maintenance requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{request.title}</h3>
                  <p className="text-gray-600 mb-2">{request.property_title}</p>
                  {user?.role === 'landlord' && (
                    <p className="text-sm text-gray-500">
                      Tenant: {request.first_name} {request.last_name}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded text-white text-sm ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                  <span className={`px-3 py-1 rounded text-white text-sm ${
                    request.status === 'open' ? 'bg-blue-500' :
                    request.status === 'in_progress' ? 'bg-yellow-500' :
                    request.status === 'completed' ? 'bg-green-500' : 'bg-gray-500'
                  }`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{request.description}</p>
              {user?.role === 'landlord' && request.status !== 'completed' && (
                <div className="flex gap-2">
                  {request.status === 'open' && (
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'in_progress')}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    >
                      Mark In Progress
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusUpdate(request.id, 'completed')}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Mark Completed
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

export default MaintenanceRequests;
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Welcome, {user?.firstName} {user?.lastName}!
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/bookings"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">My Bookings</h3>
          <p className="text-gray-600">View and manage your property bookings</p>
        </Link>
        <Link
          to="/maintenance"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Maintenance Requests</h3>
          <p className="text-gray-600">
            {user?.role === 'landlord'
              ? 'Manage maintenance requests from tenants'
              : 'Submit and track maintenance requests'}
          </p>
        </Link>
        {user?.role === 'landlord' && (
          <>
    <Link
      to="/landlord/bookings"
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <h3 className="text-xl font-semibold mb-2">Manage Bookings</h3>
      <p className="text-gray-600">View and confirm tenant booking requests</p>
    </Link>
          <Link
            to="/properties/create"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">Add Property</h3>
            <p className="text-gray-600">List a new property for rent</p>
          </Link>
          </>
        )}
        <Link
          to="/"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Browse Properties</h3>
          <p className="text-gray-600">View all available properties</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
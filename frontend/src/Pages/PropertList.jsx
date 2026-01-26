import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../redux/slices/propertiesSlice';
import { useNavigate } from 'react-router-dom';

const PropertyList = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.properties);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchProperties({}));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading properties...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Properties</h1>
      {list.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-xl">No properties available at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Property Image</span>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                <p className="text-gray-600 mb-2">{property.city}</p>
                <p className="text-gray-700 mb-2 line-clamp-2">{property.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    Rs. {property.monthly_rent?.toLocaleString()}/month
                  </span>
                  <span className="text-sm text-gray-500">{property.rooms} rooms</span>
                </div>
                <button
                  onClick={() => navigate(`/properties/${property.id}`)}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyList;
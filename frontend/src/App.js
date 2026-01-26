import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './redux/store';
import Login from './Pages/Login';
import Register from './Pages/Register';
import PropertyList from './Pages/PropertList';
import PropertyDetail from './Pages/PropertyDetail';
import CreateProperty from './Pages/CreateProperty';
import MyBookings from './Pages/MyBookings';
import MaintenanceRequests from './Pages/MaintenanceRequests';
import ChatPage from './Pages/ChatPage';
import Dashboard from './Pages/Dashboard';
import Navbar from './componenets/NavBar';
import LandlordBookings from './Pages/LandlordBookings';
import ChatList from './Pages/ChatList';


const PrivateRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PropertyList />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
  path="/landlord/bookings"
  element={
    <PrivateRoute>
      <LandlordBookings />
    </PrivateRoute>
  }
/>
        <Route
          path="/properties/create"
          element={
            <PrivateRoute>
              <CreateProperty />
            </PrivateRoute>
          }
        />
        <Route
  path="/messages"
  element={
    <PrivateRoute>
      <ChatList />
    </PrivateRoute>
  }
/>
<Route
  path="/chat/:roomId"
  element={
    <PrivateRoute>
      <ChatPage />
    </PrivateRoute>
  }
/>

        <Route
          path="/bookings"
          element={
            <PrivateRoute>
              <MyBookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/maintenance"
          element={
            <PrivateRoute>
              <MaintenanceRequests />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat/:roomId"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}

export default App;
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import Profile from './pages/Profile';
import Users from './pages/Users';
import DeleteData from './pages/DeleteData';
import { useAuth } from './context/AuthContext';

function OnboardingGuard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && !user.username && location.pathname !== '/onboarding') {
      navigate('/onboarding', { replace: true });
    }
  }, [user, loading, location.pathname]);

  return null;
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <OnboardingGuard />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/create" element={<CreateListing />} />
          <Route path="/listings/:id/edit" element={<EditListing />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/users" element={<Users />} />
          <Route path="/deleteData" element={<DeleteData />} />
        </Routes>
      </main>
    </div>
  );
}

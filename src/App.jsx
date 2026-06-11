import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import Profile from './pages/Profile';
import DeleteData from './pages/DeleteData';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create" element={<CreateListing />} />
          <Route path="/listings/:id/edit" element={<EditListing />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/deleteData" element={<DeleteData />} />
        </Routes>
      </main>
    </div>
  );
}

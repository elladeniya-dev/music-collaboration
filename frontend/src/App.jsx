import { BrowserRouter, Routes, Route } from 'react-router-dom';
import JobBoard from './pages/JobBoard';
import PostJob from './pages/PostJob';
import JobDetails from './pages/JobDetails';
import CollabRequests from './pages/CollabRequests';
import CollabRoom from './pages/CollabRoom';
import ChatInterface from './pages/ChatInterface';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import MainLayout from './layout/MainLayout';
import EditJob from "./pages/EditJob";
import ServiceMarketplace from './pages/ServiceMarketplace';
import CreateServiceForm from './pages/CreateServiceForm';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';

function App() {
  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/job" element={<JobBoard />} />
            <Route path="/job/:id" element={<EditJob />} />
            <Route path="/post" element={<PostJob />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/requests" element={<CollabRequests />} />
            <Route path="/collab/room" element={<CollabRoom />} />
            <Route path="/chat" element={<ChatInterface />} />
            <Route path="/chat/:id" element={<ChatInterface />} />

            {/* Service Marketplace */}
            <Route path="/services" element={<ServiceMarketplace />} />
            <Route path="/services/create" element={<CreateServiceForm />} />

            {/* Profile */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

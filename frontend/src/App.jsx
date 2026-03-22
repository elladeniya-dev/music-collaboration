import { BrowserRouter, Routes, Route } from 'react-router-dom';
import JobBoard from './pages/JobBoard';
import PostJob from './pages/PostJob';
import JobDetails from './pages/JobDetails';
import CollabRequests from './pages/CollabRequests';
import ChatInterface from './pages/ChatInterface'; // ✅ merged component
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import MainLayout from './layout/MainLayout';
import EditJob from "./pages/EditJob"; // ✅ merged component
import ServiceMarketplace from './pages/ServiceMarketplace';
import CreateServiceForm from './pages/CreateServiceForm';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          <Route element={<MainLayout />}>
            <Route path="/job" element={<JobBoard />} />
            <Route path="/job/:id" element={<EditJob />} />
            <Route path="/post" element={<PostJob />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/requests" element={<CollabRequests />} />
            <Route path="/chat" element={<ChatInterface />} />
            <Route path="/chat/:id" element={<ChatInterface />} />

            {/* Service Marketplace (Phase 1) */}
            <Route path="/services" element={<ServiceMarketplace />} />
            <Route path="/services/create" element={<CreateServiceForm />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { authService } from '../services';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        navigate('/services', { replace: true });
      } catch (error) {
        console.error('Failed to fetch user after OAuth:', error);
        navigate('/', { replace: true });
      }
    };
    fetchUser();
  }, [navigate, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f0f1a] fade-in">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
        <p className="text-gray-300 text-base font-semibold">Completing login...</p>
        <p className="text-gray-500 text-sm mt-1">Setting up your workspace</p>
      </div>
    </div>
  );
};

export default OAuthCallback;

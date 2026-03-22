import axios from './axiosConfig';

export const getDashboardData = async () => {
  const response = await axios.get('/dashboard');
  return response.data.data;
};

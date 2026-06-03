import axiosInstance from './api/axiosConfig';

class GlobalSearchService {
  async searchGlobal(query) {
    try {
      const response = await axiosInstance.get(`/search/global?q=${encodeURIComponent(query)}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new GlobalSearchService();

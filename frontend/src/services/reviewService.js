import axios from './api/axiosConfig';

class ReviewService {
  async addReview(data) {
    const response = await axios.post('/reviews', data);
    return response.data.data;
  }

  async getSellerReviews(sellerId) {
    const response = await axios.get(`/reviews/seller/${sellerId}`);
    return response.data.data;
  }
}

export default new ReviewService();

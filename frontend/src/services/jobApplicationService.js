import axiosInstance from './api/axiosConfig';

class JobApplicationService {
  async applyToJob(jobId, applicationData) {
    try {
      const payload = {
        jobId,
        ...applicationData
      };
      const response = await axiosInstance.post('/job-applications', payload);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async getJobApplicants(jobId) {
    try {
      const response = await axiosInstance.get(`/job-applications/job/${jobId}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async acceptApplication(applicationId) {
    try {
      const response = await axiosInstance.post(`/job-applications/${applicationId}/accept`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new JobApplicationService();

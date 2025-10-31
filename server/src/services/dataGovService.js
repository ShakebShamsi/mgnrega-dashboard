import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class DataGovService {
  constructor() {
    this.baseURL = process.env.DATA_GOV_BASE_URL;
    this.apiKey = process.env.DATA_GOV_API_KEY;
    this.lastRequestTime = 0;
    this.minRequestInterval = 6000; // 6 seconds between requests (max 10/min)
  }

  async rateLimitedRequest() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  async fetchDistrictData(stateName, districtName, finYear = '2024-25') {
    try {
      await this.rateLimitedRequest();

      const response = await axios.get(this.baseURL, {
        params: {
          'api-key': this.apiKey,
          'format': 'json',
          'filters[state_name]': stateName,
          'filters[district_name]': districtName,
          'filters[fin_year]': finYear,
          'limit': 100,
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching from data.gov.in:', error.message);
      throw error;
    }
  }

  async fetchAllDistrictsForState(stateName, finYear = '2024-25') {
    try {
      await this.rateLimitedRequest();

      const response = await axios.get(this.baseURL, {
        params: {
          'api-key': this.apiKey,
          'format': 'json',
          'filters[state_name]': stateName,
          'filters[fin_year]': finYear,
          'limit': 1000,
        },
        timeout: 15000,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching state data:', error.message);
      throw error;
    }
  }
}

export default new DataGovService();
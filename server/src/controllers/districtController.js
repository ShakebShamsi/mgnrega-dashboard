import District from '../models/District.js';
import HistoricalData from '../models/HistoricalData.js';
import dataGovService from '../services/dataGovService.js';
import cacheService from '../services/cacheService.js';

export const getDistrictData = async (req, res) => {
  try {
    const { state, district, finYear = '2024-25' } = req.query;

    if (!state || !district) {
      return res.status(400).json({ 
        error: 'State and district are required' 
      });
    }

    // Check cache first
    const cacheKey = cacheService.generateKey(state, district, finYear);
    let cachedData = await cacheService.get(cacheKey);

    if (cachedData) {
      console.log('Cache hit for:', cacheKey);
      return res.json({
        success: true,
        data: cachedData,
        source: 'cache',
      });
    }

    // Check database
    let districtData = await District.findOne({
      stateName: state,
      districtName: district,
      finYear,
    });

    // If data is recent (< 24 hours), use it
    if (districtData && Date.now() - districtData.lastUpdated < 86400000) {
      await cacheService.set(cacheKey, districtData);
      return res.json({
        success: true,
        data: districtData,
        source: 'database',
      });
    }

    // Fetch fresh data from data.gov.in
    try {
      const freshData = await dataGovService.fetchDistrictData(
        state, 
        district, 
        finYear
      );

      // Process and save
      const processedData = {
        districtName: district,
        stateName: state,
        finYear,
        metrics: {
          totalWorkers: freshData.records?.[0]?.total_workers || 0,
          householdsBenefited: freshData.records?.[0]?.households || 0,
          personDays: freshData.records?.[0]?.person_days || 0,
          totalExpenditure: freshData.records?.[0]?.expenditure || 0,
          avgWagePerDay: freshData.records?.[0]?.avg_wage || 0,
          workCompletionRate: freshData.records?.[0]?.completion_rate || 0,
        },
        rawData: freshData,
        lastUpdated: new Date(),
      };

      districtData = await District.findOneAndUpdate(
        { stateName: state, districtName: district, finYear },
        processedData,
        { upsert: true, new: true }
      );

      // Cache it
      await cacheService.set(cacheKey, districtData);

      return res.json({
        success: true,
        data: districtData,
        source: 'fresh',
      });

    } catch (apiError) {
      // If API fails, return stale data if available
      if (districtData) {
        return res.json({
          success: true,
          data: districtData,
          source: 'database_fallback',
          warning: 'Using cached data due to API unavailability',
        });
      }
      throw apiError;
    }

  } catch (error) {
    console.error('Error in getDistrictData:', error);
    res.status(500).json({
      error: 'Failed to fetch district data',
      message: error.message,
    });
  }
};

export const getHistoricalData = async (req, res) => {
  try {
    const { state, district } = req.query;

    const districtDoc = await District.findOne({
      stateName: state,
      districtName: district,
    });

    if (!districtDoc) {
      return res.status(404).json({ error: 'District not found' });
    }

    const historicalData = await HistoricalData.find({
      districtId: districtDoc._id,
    }).sort({ year: -1, month: -1 }).limit(12);

    res.json({
      success: true,
      data: historicalData,
    });

  } catch (error) {
    console.error('Error in getHistoricalData:', error);
    res.status(500).json({
      error: 'Failed to fetch historical data',
    });
  }
};
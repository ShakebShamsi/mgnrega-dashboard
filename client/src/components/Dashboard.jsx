import { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Users, Briefcase, Calendar, IndianRupee, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatNumber } from '../utils/formatters';
import { statesData, translations } from '../utils/constants';
import MetricCard from './MetricCard';


const MGNREGADashboard = () => {
   const [selectedState, setSelectedState] = useState('');
   const [selectedDistrict, setSelectedDistrict] = useState('');
   const [loading, setLoading] = useState(false);
   const [districtData, setDistrictData] = useState(null);
   const [historicalData, setHistoricalData] = useState([]);
   const [userLocation, setUserLocation] = useState(null);
   const [error, setError] = useState(null);
   const [language, setLanguage] = useState('en');

   const t = translations[language];

   // Mock data generator (in production, this fetches from your backend)
   const generateMockData = (district, state) => {
      return {
         district_name: district,
         state_name: state,
         fin_year: '2024-25',
         total_workers: Math.floor(Math.random() * 50000) + 10000,
         households_benefited: Math.floor(Math.random() * 30000) + 5000,
         person_days: Math.floor(Math.random() * 1000000) + 500000,
         total_expenditure: Math.floor(Math.random() * 500) + 100,
         avg_wage_per_day: Math.floor(Math.random() * 100) + 200,
         work_completion_rate: Math.floor(Math.random() * 40) + 60,
         active_works: Math.floor(Math.random() * 500) + 100,
         completed_works: Math.floor(Math.random() * 800) + 200
      };
   };

   const generateHistoricalData = () => {
      const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
      return months.map(month => ({
         month,
         workers: Math.floor(Math.random() * 10000) + 5000,
         expenditure: Math.floor(Math.random() * 100) + 50,
         workDays: Math.floor(Math.random() * 200000) + 100000
      }));
   };

   // Detect user location
   useEffect(() => {
      if ('geolocation' in navigator) {
         navigator.geolocation.getCurrentPosition(
            (position) => {
               setUserLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
               });
            },
            (error) => {
               console.log(error, 'Location access denied');
            }
         );
      }
   }, []);

   const handleAutoDetect = async () => {
      if (!userLocation) {
         alert('Please enable location access in your browser');
         return;
      }

      setLoading(true);
      // In production, use reverse geocoding API to get district from coordinates
      // Mock implementation for demo
      setTimeout(() => {
         setSelectedState('BIHAR');
         setSelectedDistrict('Muzaffarpur');
         fetchDistrictData('Muzaffarpur', 'BIHAR');
      }, 1000);
   };

   const fetchDistrictData = async (district, state) => {
      setLoading(true);
      setError(null);

      try {
         // In production, this calls your backend API
         // Backend should cache data, handle rate limiting, and fetch from data.gov.in
         await new Promise(resolve => setTimeout(resolve, 1000));

         const data = generateMockData(district, state);
         const historical = generateHistoricalData();

         setDistrictData(data);
         setHistoricalData(historical);
      } catch (err) {
         setError('Failed to load data. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (selectedDistrict && selectedState) {
         fetchDistrictData(selectedDistrict, selectedState);
      }
   }, [selectedDistrict, selectedState]);



   if (!selectedState || !selectedDistrict) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white shadow-lg">
               <div className="max-w-7xl mx-auto px-4 py-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-3">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="w-12 h-12 bg-white rounded-full p-1" />
                        <div>
                           <h1 className="text-2xl md:text-3xl font-bold">{t.title}</h1>
                           <p className="text-orange-100 text-sm">{t.subtitle}</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button
                           onClick={() => setLanguage('en')}
                           className={`px-3 py-1 rounded ${language === 'en' ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'}`}
                        >
                           EN
                        </button>
                        <button
                           onClick={() => setLanguage('hi')}
                           className={`px-3 py-1 rounded ${language === 'hi' ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'}`}
                        >
                           हिं
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Selection Screen */}
            <div className="max-w-4xl mx-auto px-4 py-12">
               <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
                  <div className="text-center mb-8">
                     <MapPin className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                     <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {language === 'en' ? 'Welcome to MGNREGA Dashboard' : 'मनरेगा डैशबोर्ड में आपका स्वागत है'}
                     </h2>
                     <p className="text-gray-600">
                        {language === 'en'
                           ? 'See how your district is performing in providing employment'
                           : 'देखें कि आपका जिला रोजगार प्रदान करने में कैसा प्रदर्शन कर रहा है'}
                     </p>
                  </div>

                  <div className="space-y-6">
                     {/* State Selection */}
                     <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                           {t.selectState}
                        </label>
                        <select
                           value={selectedState}
                           onChange={(e) => {
                              setSelectedState(e.target.value);
                              setSelectedDistrict('');
                           }}
                           className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                           <option value="">{language === 'en' ? 'Choose State' : 'राज्य चुनें'}</option>
                           {Object.keys(statesData).map(state => (
                              <option key={state} value={state}>{state}</option>
                           ))}
                        </select>
                     </div>

                     {/* District Selection */}
                     {selectedState && (
                        <div>
                           <label className="block text-lg font-semibold text-gray-700 mb-3">
                              {t.selectDistrict}
                           </label>
                           <select
                              value={selectedDistrict}
                              onChange={(e) => setSelectedDistrict(e.target.value)}
                              className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                           >
                              <option value="">{language === 'en' ? 'Choose District' : 'जिला चुनें'}</option>
                              {statesData[selectedState].map(district => (
                                 <option key={district} value={district}>{district}</option>
                              ))}
                           </select>
                        </div>
                     )}

                     {/* Auto Detect */}
                     <div className="text-center">
                        <p className="text-gray-500 mb-4">{t.or}</p>
                        <button
                           onClick={handleAutoDetect}
                           className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center mx-auto space-x-2"
                        >
                           <MapPin className="w-5 h-5" />
                           <span>{t.detectLocation}</span>
                        </button>
                     </div>
                  </div>
               </div>

               {/* Info Cards */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-orange-100 rounded-xl p-6 text-center">
                     <Users className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                     <h3 className="font-bold text-gray-900 mb-2">
                        {language === 'en' ? '12.15 Cr Workers' : '12.15 करोड़ श्रमिक'}
                     </h3>
                     <p className="text-sm text-gray-600">
                        {language === 'en' ? 'Benefited in 2025' : '2025 में लाभान्वित'}
                     </p>
                  </div>
                  <div className="bg-green-100 rounded-xl p-6 text-center">
                     <Briefcase className="w-12 h-12 text-green-600 mx-auto mb-3" />
                     <h3 className="font-bold text-gray-900 mb-2">
                        {language === 'en' ? '100 Days Work' : '100 दिन का कार्य'}
                     </h3>
                     <p className="text-sm text-gray-600">
                        {language === 'en' ? 'Guaranteed per year' : 'प्रति वर्ष गारंटीकृत'}
                     </p>
                  </div>
                  <div className="bg-blue-100 rounded-xl p-6 text-center">
                     <IndianRupee className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                     <h3 className="font-bold text-gray-900 mb-2">
                        {language === 'en' ? 'Fair Wages' : 'उचित मजदूरी'}
                     </h3>
                     <p className="text-sm text-gray-600">
                        {language === 'en' ? 'Timely payment' : 'समय पर भुगतान'}
                     </p>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   // While loading OR if district data is not yet available, show loader.
   // This prevents a render crash when selectedState/selectedDistrict are set
   // but `districtData` is still null (effect runs after render).
   if (loading || !districtData) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
            <div className="text-center">
               <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
               <p className="text-xl font-semibold text-gray-700">{t.loading}</p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
         {/* Header */}
         <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="w-10 h-10 bg-white rounded-full p-1" />
                     <div>
                        <h1 className="text-xl md:text-2xl font-bold">{selectedDistrict}, {selectedState}</h1>
                        <p className="text-orange-100 text-xs">FY 2024-25</p>
                     </div>
                  </div>
                  <button
                     onClick={() => {
                        setSelectedState('');
                        setSelectedDistrict('');
                        setDistrictData(null);
                     }}
                     className="px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50"
                  >
                     {language === 'en' ? 'Change District' : 'जिला बदलें'}
                  </button>
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
               <MetricCard
                  icon={Users}
                  label={t.workers}
                  value={formatNumber(districtData?.total_workers ?? 0)}
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                  trend={12}
                  info="Number of workers who got employment"
               />
               <MetricCard
                  icon={Briefcase}
                  label={t.households}
                  value={formatNumber(districtData?.households_benefited ?? 0)}
                  color="bg-gradient-to-br from-purple-500 to-purple-600"
                  trend={8}
                  info="Families who benefited from MGNREGA"
               />
               <MetricCard
                  icon={Calendar}
                  label={t.workDays}
                  value={formatNumber(districtData?.person_days ?? 0)}
                  color="bg-gradient-to-br from-green-500 to-green-600"
                  trend={15}
                  info="Total work days provided"
               />
               <MetricCard
                  icon={IndianRupee}
                  label={t.expenditure}
                  value={`₹${formatNumber(districtData?.total_expenditure ?? 0)} Cr`}
                  color="bg-gradient-to-br from-orange-500 to-orange-600"
                  info="Total money spent on wages and works"
               />
               <MetricCard
                  icon={Clock}
                  label={t.avgWage}
                  value={districtData?.avg_wage_per_day ? `₹${districtData.avg_wage_per_day}` : '-'}
                  color="bg-gradient-to-br from-pink-500 to-pink-600"
                  info="Average daily wage paid to workers"
               />
               <MetricCard
                  icon={CheckCircle}
                  label={t.completion}
                  value={`${districtData?.work_completion_rate ?? 0}%`}
                  color="bg-gradient-to-br from-teal-500 to-teal-600"
                  info="Percentage of works completed on time"
               />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
               {/* Monthly Trend */}
               <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                     <TrendingUp className="w-6 h-6 mr-2 text-orange-500" />
                     {t.trend}
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                     <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="workers" stroke="#f97316" strokeWidth={3} name="Workers" />
                     </LineChart>
                  </ResponsiveContainer>
               </div>

               {/* Work Status */}
               <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                     <Briefcase className="w-6 h-6 mr-2 text-green-500" />
                     {t.performance}
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                     <BarChart data={[
                        { name: language === 'en' ? 'Active' : 'सक्रिय', value: districtData?.active_works ?? 0 },
                        { name: language === 'en' ? 'Completed' : 'पूर्ण', value: districtData?.completed_works ?? 0 }
                     ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#22c55e" />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Performance Indicators */}
            <div className="bg-white rounded-xl shadow-lg p-6">
               <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {language === 'en' ? 'Performance Indicators' : 'प्रदर्शन संकेतक'}
               </h3>
               <div className="space-y-4">
                  <div>
                     <div className="flex justify-between mb-2">
                        <span className="font-medium">{language === 'en' ? 'Work Completion' : 'कार्य पूर्णता'}</span>
                        <span className="font-bold">{districtData?.work_completion_rate ?? 0}%</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                           className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all"
                           style={{ width: `${districtData?.work_completion_rate ?? 0}%` }}
                        ></div>
                     </div>
                  </div>
                  <div>
                     <div className="flex justify-between mb-2">
                        <span className="font-medium">{language === 'en' ? 'Fund Utilization' : 'निधि उपयोग'}</span>
                        <span className="font-bold">87%</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-4">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-4 rounded-full" style={{ width: '87%' }}></div>
                     </div>
                  </div>
                  <div>
                     <div className="flex justify-between mb-2">
                        <span className="font-medium">{language === 'en' ? 'Timely Payment' : 'समय पर भुगतान'}</span>
                        <span className="font-bold">92%</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-4">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full" style={{ width: '92%' }}></div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Footer */}
         <div className="bg-gray-900 text-white py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 text-center">
               <p className="text-gray-400">
                  {language === 'en'
                     ? 'Data source: Government of India Open Data Platform'
                     : 'डेटा स्रोत: भारत सरकार ओपन डेटा प्लेटफॉर्म'}
               </p>
               <p className="text-gray-400 text-sm mt-2">
                  {language === 'en'
                     ? 'Last updated: October 2025'
                     : 'अंतिम अपडेट: अक्टूबर 2025'}
               </p>
            </div>
         </div>
      </div>
   );
};

export default MGNREGADashboard;

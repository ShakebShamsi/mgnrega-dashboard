import { useState, useEffect } from "react";
import {
   MapPin,
   TrendingUp,
   Users,
   Briefcase,
   Calendar,
   IndianRupee,
   Clock,
   CheckCircle,
   AlertCircle,
} from "lucide-react";
import {
   LineChart,
   Line,
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
} from "recharts";
import axios from "axios";

import { formatNumber } from "../utils/formatters";
import { fin_year, statesData, translations } from "../utils/constants";
import MetricCard from "./MetricCard";
import { useLanguage } from "../context/languageContext";

const num = (v) => Number(v) || 0;

const MGNREGADashboard = () => {
   const { language } = useLanguage();
   const t = translations[language];

   const [selectedState, setSelectedState] = useState("");
   const [selectedDistrict, setSelectedDistrict] = useState("");
   const [selectedFinYear, setSelectedFinYear] = useState("");
   const [districtData, setDistrictData] = useState(null);
   const [historicalData, setHistoricalData] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   /* ================= FETCH DATA ================= */
   useEffect(() => {
      if (!selectedState || !selectedDistrict || !selectedFinYear) return;

      const fetchData = async () => {
         try {
            setLoading(true);
            setError(null);

            const res = await axios.get(
               "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722",
               {
                  params: {
                     "api-key": import.meta.env.VITE_API_KEY,
                     format: "json",
                     limit: 1000,
                     "filters[state_name]": selectedState,
                     "filters[fin_year]": selectedFinYear,
                  },
               }
            );

            const records = res.data.records || [];

            const districtRecord = records.find(
               (r) =>
                  r.district_name?.toUpperCase() ===
                  selectedDistrict.toUpperCase()
            );

            if (!districtRecord) {
               setDistrictData(null);
               setError(t.noData || "No data found");
               return;
            }

            setDistrictData({
               total_workers: num(districtRecord.Total_No_of_Workers),
               households_benefited: num(districtRecord.Total_Households_Worked),
               person_days: num(
                  districtRecord.Average_days_of_employment_provided_per_Household
               ),
               total_expenditure: num(districtRecord.Total_Exp),
               avg_wage_per_day: num(
                  districtRecord.Average_Wage_rate_per_day_per_person
               ),
               work_completion_rate: Math.round(
                  (num(districtRecord.Number_of_Completed_Works) /
                     Math.max(
                        num(districtRecord.Total_No_of_Works_Takenup),
                        1
                     )) *
                  100
               ),
               active_works: num(districtRecord.Number_of_Ongoing_Works),
               completed_works: num(
                  districtRecord.Number_of_Completed_Works
               ),
            });

            setHistoricalData(
               records
                  .filter(
                     (r) =>
                        r.district_name?.toUpperCase() ===
                        selectedDistrict.toUpperCase()
                  )
                  .map((r) => ({
                     month: r.month,
                     workers: num(r.Total_Individuals_Worked),
                  }))
            );
         } catch (e) {
            console.error(e);
            setError(t.fetchError || "Failed to fetch data");
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, [selectedState, selectedDistrict, selectedFinYear, t]);

   /* ================= AUTO DETECT ================= */
   const handleAutoDetect = () => {
      setLoading(true);
      setError(null);

      if (!navigator.geolocation) {
         setError(t.locationError);
         setLoading(false);
         return;
      }

      navigator.geolocation.getCurrentPosition(
         async ({ coords }) => {
            const res = await fetch(
               `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
            );
            const data = await res.json();

            const state = data?.address?.state?.toUpperCase();
            const district =
               data?.address?.county ||
               data?.address?.city ||
               data?.address?.state_district;

            if (!state || !district) {
               setError(t.locationError);
            } else {
               setSelectedState(state);
               setSelectedDistrict(district.toUpperCase());
               setSelectedFinYear("2025-2026");
            }

            setLoading(false);
         },
         () => {
            setError(t.locationError);
            setLoading(false);
         }
      );
   };

   /* ================= SELECTION SCREEN ================= */
   if (!selectedState || !selectedDistrict || !selectedFinYear) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center px-4">
            <div className="bg-white p-10 rounded-2xl shadow-xl max-w-xl w-full">
               <div className="text-center mb-6">
                  <MapPin className="w-14 h-14 text-orange-500 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold">{t.welcome}</h2>
                  <p className="text-gray-600">{t.welcomeDesc}</p>
               </div>

               {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded text-red-700 flex gap-2">
                     <AlertCircle className="w-5 h-5" />
                     {error}
                  </div>
               )}

               <div className="space-y-4">
                  <select
                     className="w-full px-4 py-3 border rounded-xl"
                     value={selectedState}
                     onChange={(e) => {
                        setSelectedState(e.target.value);
                        setSelectedDistrict("");
                     }}
                  >
                     <option value="">{t.selectState}</option>
                     {Object.keys(statesData).map((s) => (
                        <option key={s} value={s}>
                           {s}
                        </option>
                     ))}
                  </select>

                  {selectedState && (
                     <select
                        className="w-full px-4 py-3 border rounded-xl"
                        value={selectedDistrict}
                        onChange={(e) =>
                           setSelectedDistrict(e.target.value)
                        }
                     >
                        <option value="">{t.selectDistrict}</option>
                        {statesData[selectedState].map((d) => (
                           <option key={d} value={d}>
                              {d}
                           </option>
                        ))}
                     </select>
                  )}

                  {selectedState && (
                     <select
                        className="w-full px-4 py-3 border rounded-xl"
                        value={selectedFinYear}
                        onChange={(e) =>
                           setSelectedFinYear(e.target.value)
                        }
                     >
                        <option value="">{t.selectFinYear}</option>
                        {fin_year.map((y) => (
                           <option key={y} value={y}>
                              {y}
                           </option>
                        ))}
                     </select>
                  )}

                  <button
                     onClick={handleAutoDetect}
                     disabled={loading}
                     className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-60"
                  >
                     {t.detectLocation}
                  </button>
               </div>
            </div>
         </div>
      );
   }

   /* ================= LOADING ================= */
   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="h-16 w-16 border-b-4 border-orange-500 rounded-full animate-spin" />
         </div>
      );
   }

   /* ================= DASHBOARD ================= */
   return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
         <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-orange-400 to-green-600 text-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
               <div>
                  <h1 className="text-xl font-bold">
                     {selectedDistrict}, {selectedState}
                  </h1>
                  <p className="text-sm text-orange-100">
                     FY: {selectedFinYear}
                  </p>
               </div>
               <button
                  onClick={() => {
                     setSelectedState("");
                     setSelectedDistrict("");
                     setDistrictData(null);
                  }}
                  className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold shadow hover:bg-orange-50 transition"
               >
                  {t.changeDistrict || (language === "en" ? "Change District" : "जिला बदलें")}
               </button>

            </div>
         </header>

         <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            {!districtData ? (
               <div className="text-center py-20 text-gray-500">
                  <AlertCircle className="w-14 h-14 mx-auto mb-3" />
                  <p className="text-lg font-semibold">{t.noData}</p>
               </div>
            ) : (
               <>
                  {/* METRICS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <MetricCard icon={Users} label={t.workers} value={formatNumber(districtData?.total_workers ?? 0)} />
                     <MetricCard icon={Briefcase} label={t.households} value={formatNumber(districtData?.households_benefited ?? 0)} />
                     <MetricCard icon={Calendar} label={t.workDays} value={formatNumber(districtData?.person_days ?? 0)} />
                     <MetricCard icon={IndianRupee} label={t.expenditure} value={`₹${formatNumber(districtData?.total_expenditure ?? 0)} Cr`} />
                     <MetricCard icon={Clock} label={t.avgWage} value={`₹${districtData?.avg_wage_per_day ?? 0}`} />
                     <MetricCard icon={CheckCircle} label={t.completion} value={`${districtData?.work_completion_rate ?? 0}%`} />
                  </div>

                  {/* CHARTS */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <div className="bg-white p-6 rounded-xl shadow">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                           <TrendingUp className="text-orange-500" /> {t.trend}
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                           <LineChart data={historicalData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Line
                                 dataKey="workers"
                                 stroke="#f97316"
                                 strokeWidth={3}
                                 isAnimationActive={false}
                              />
                           </LineChart>
                        </ResponsiveContainer>
                     </div>

                     <div className="bg-white p-6 rounded-xl shadow">
                        <h3 className="font-bold mb-4">{t.performance}</h3>
                        <ResponsiveContainer width="100%" height={300}>
                           <BarChart
                              data={[
                                 { name: t.active, value: districtData.active_works },
                                 { name: t.completed, value: districtData.completed_works },
                              ]}
                           >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value" fill="#22c55e" />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               </>
            )}
         </div>
      </div>
   );
};

export default MGNREGADashboard;

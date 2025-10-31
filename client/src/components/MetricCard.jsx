import { Info, TrendingUp } from "lucide-react";

const MetricCard = ({ icon: Icon, label, value, color, trend, info }) => (
   <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
         <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
         </div>
         {info && (
            <button className="text-gray-400 hover:text-gray-600" title={info}>
               <Info className="w-5 h-5" />
            </button>
         )}
      </div>
      <div className="space-y-2">
         <p className="text-gray-600 text-sm font-medium">{label}</p>
         <p className="text-3xl font-bold text-gray-900">{value}</p>
         {trend && (
            <div className="flex items-center text-sm">
               <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
               <span className="text-green-500">{trend}% vs last month</span>
            </div>
         )}
      </div>
   </div>
);
export default MetricCard;

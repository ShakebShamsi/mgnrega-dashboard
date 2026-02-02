import { Info, TrendingUp, TrendingDown } from "lucide-react";

const MetricCard = ({
  icon: Icon,
  label,
  value,
  color = "bg-gray-500",
  trend,
  info,
}) => {
  const isPositive = trend > 0;
  const isNegative = trend < 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 transition-all hover:-translate-y-0.5 hover:shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-lg ${color}`}
          aria-hidden="true"
        >
          <Icon className="w-6 h-6 text-white" />
        </div>

        {info && (
          <div className="group relative">
            <Info className="w-5 h-5 text-gray-400 cursor-pointer group-hover:text-gray-600" />

            {/* Tooltip */}
            <div className="absolute right-0 z-10 mt-2 w-52 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {info}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-600">
          {label}
        </p>

        <p className="text-3xl font-bold text-gray-900">
          {value}
        </p>

        {trend !== undefined && (
          <div className="flex items-center text-sm mt-1">
            {isPositive && (
              <>
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">
                  +{trend}% vs last period
                </span>
              </>
            )}

            {isNegative && (
              <>
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-red-600">
                  {trend}% vs last period
                </span>
              </>
            )}

            {trend === 0 && (
              <span className="text-gray-500">
                No change vs last period
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;

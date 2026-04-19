export default function InsightCard({ label, value, description, accent = "gray", icon: Icon }) {
  const accentColors = {
    green: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    gray:  "text-gray-900 bg-gray-50",
    blue:  "text-[#0353A4] bg-blue-50",
  };

  const textColors = {
    green: "text-emerald-600",
    amber: "text-amber-600",
    gray:  "text-gray-900",
    blue:  "text-[#0353A4]",
  };

  return (
    <div className="bg-white border hover:border-blue-200 border-gray-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between group h-full">
      <div className="mb-2">
        <div className="flex items-start justify-between mb-4">
          <div className="text-[12px] text-gray-500 uppercase tracking-widest font-bold mb-1">{label}</div>
          {Icon && (
            <div className={`p-2 rounded-xl ${accentColors[accent]} group-hover:scale-110 transition-transform shadow-inner`}>
              <Icon size={22} className={textColors[accent]} />
            </div>
          )}
        </div>
        <div className={`text-[32px] font-black tracking-tight mb-2 leading-none ${textColors[accent]}`}>{value}</div>
      </div>
      {description && <div className="text-[13px] text-gray-500 leading-relaxed font-semibold">{description}</div>}
    </div>
  );
}
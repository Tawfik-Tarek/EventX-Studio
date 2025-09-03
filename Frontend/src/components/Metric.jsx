export default function Metric({ icon, label, value, color }) {
  return (
    <div className="border rounded-xl p-3 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <img
          src={icon}
          alt={label}
          className="w-5 h-5"
        />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <span className={`text-base font-semibold ${color}`}>{value}</span>
    </div>
  );
}

export default function Metric({ icon, label, value, color }) {
  const isString = typeof icon === "string";
  return (
    <div className="border rounded-xl p-3 flex flex-col gap-1 bg-white shadow-sm">
      <div className="flex items-center gap-2">
        {isString ? (
          <img
            src={icon}
            alt={label}
            className="w-5 h-5"
          />
        ) : (
          <span
            className="w-5 h-5 flex items-center justify-center"
            aria-hidden
          >
            {icon}
          </span>
        )}
        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          {label}
        </span>
      </div>
      <span className={`text-base font-semibold ${color}`}>{value}</span>
    </div>
  );
}

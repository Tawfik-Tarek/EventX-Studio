export default function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}

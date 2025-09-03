export default function Field({ label, value, textarea, full }) {
  return (
    <div className={`${full ? "col-span-2" : ""}`}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {textarea ? (
        <div className="p-3 border rounded-md text-sm leading-snug max-h-40 overflow-y-auto whitespace-pre-line">
          {value}
        </div>
      ) : (
        <div className="px-3 py-2 border rounded-md text-sm font-medium bg-white">
          {value}
        </div>
      )}
    </div>
  );
}

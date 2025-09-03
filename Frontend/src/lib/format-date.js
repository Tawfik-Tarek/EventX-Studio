export default function formatDate(dateVal) {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    return d.toLocaleDateString();
  } catch (_) {
    return dateVal;
  }
}

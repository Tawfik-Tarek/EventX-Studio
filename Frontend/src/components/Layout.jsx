import Sidebar from "./sidebar";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100 border-[20px] border-black">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

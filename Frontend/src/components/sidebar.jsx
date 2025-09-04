import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  Users,
  BarChart3,
  Headphones,
  Bell,
  Settings,
  Megaphone,
  Layers,
  UserCog,
  LogOut,
  PlusCircle,
  ChevronDown,
} from "lucide-react";

import Logo from "../assets/logo.svg";
import EventFormModal from "./EventFormModal";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { unread } = useNotifications();
  const [openSections, setOpenSections] = useState({
    "Main Navigation": true,
    "Support & Management": true,
    "Additional Features": true,
    "Account Management": true,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const routes = {
    Dashboard: "/",
    "Manage Events": "/events",
    "Booking & Tickets": "/my-tickets",
    "Attendee Insights": "/attendees",
    "Analytics & Reports": "/analytics",
    "Contact Support": "/support",
    Notifications: "/notifications",
    "Admin Notifications": "/admin/notifications",
    Settings: "/settings",
    Marketing: "/marketing",
    "Event Categories": "/categories",
    "Manage Users": "/users",
  };

  const handleItemClick = (name) => {
    if (name === "Logout") {
      logout();
    } else {
      const path = routes[name];
      if (path) {
        navigate(path);
      }
    }
  };

  const isAdmin = user && user.role === "admin";

  const sections = [
    {
      title: "Main Navigation",
      items: [
        isAdmin && { name: "Dashboard", icon: <LayoutDashboard size={18} /> },
        { name: "Manage Events", icon: <Calendar size={18} /> },
        { name: "Booking & Tickets", icon: <Ticket size={18} /> },
        ...(isAdmin
          ? [{ name: "Attendee Insights", icon: <Users size={18} /> }]
          : []),
        ...(isAdmin
          ? [{ name: "Analytics & Reports", icon: <BarChart3 size={18} /> }]
          : []),
      ].filter(Boolean),
    },
    {
      title: "Support & Management",
      items: [
        { name: "Contact Support", icon: <Headphones size={18} /> },
        { name: "Notifications", icon: <Bell size={18} /> },
        ...(isAdmin
          ? [{ name: "Admin Notifications", icon: <Megaphone size={18} /> }]
          : []),
        { name: "Settings", icon: <Settings size={18} /> },
      ],
    },
    {
      title: "Additional Features",
      items: [
        ...(isAdmin
          ? [{ name: "Marketing", icon: <Megaphone size={18} /> }]
          : []),
        ...(isAdmin
          ? [{ name: "Event Categories", icon: <Layers size={18} /> }]
          : []),
      ].filter(Boolean),
    },
    {
      title: "Account Management",
      items: [
        ...(isAdmin
          ? [{ name: "Manage Users", icon: <UserCog size={18} /> }]
          : []),
        { name: "Logout", icon: <LogOut size={18} /> },
      ].filter(Boolean),
    },
  ].filter((section) => section.items.length > 0);

  return (
    <aside className="w-64 bg-black text-white min-h-screen flex flex-col">
      <div className="flex items-center gap-2 p-4">
        <img
          src={Logo}
          alt="logo"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h1 className="text-lg font-bold">EventX</h1>
          <p className="text-xs opacity-70">studio</p>
        </div>
      </div>

      {isAdmin && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#282828] text-white px-4 py-2 cursor-pointer rounded-md flex items-center gap-2.5 mx-4 my-2"
        >
          <PlusCircle
            size={36}
            className="bg-[#C1FF72]"
          />
          <div>
            <h3>Add Quick Event</h3>
            <p className="text-start">Events</p>
          </div>
        </button>
      )}

      <nav className="flex-1 overflow-y-auto px-2">
        {sections.map((section) => (
          <div
            key={section.title}
            className="mb-3"
          >
            <button
              onClick={() => toggleSection(section.title)}
              className="flex items-center justify-between w-full px-2 py-1 text-sm font-semibold text-gray-300 hover:text-white"
            >
              {section.title}
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  openSections[section.title] ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSections[section.title] && (
              <ul className="mt-1 pl-4 space-y-1">
                {section.items.map((item) => {
                  const content = (
                    <>
                      {item.icon} {item.name}
                      {item.name === "Notifications" && unread > 0 && (
                        <span className="ml-auto bg-red-500 text-[10px] px-1.5 py-0.5 rounded-full text-white">
                          {unread}
                        </span>
                      )}
                    </>
                  );
                  return (
                    <li
                      key={item.name}
                      onClick={() => handleItemClick(item.name)}
                      className="flex items-center gap-2 text-sm text-gray-300 hover:text-white cursor-pointer py-1"
                    >
                      {content}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>

      <EventFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        event={null}
        onSuccess={() => {
          setShowCreateModal(false);
          navigate("/events");
        }}
      />
    </aside>
  );
}

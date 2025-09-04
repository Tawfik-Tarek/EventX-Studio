import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import Layout from "./components/Layout";
import EventDetails from "@/pages/EventDetails";
import Events from "@/pages/Events";
import { PublicRoute, ProtectedLayout } from "@/components/RouteGuards";
import Dashboard from "@/pages/Dashboard";
import NotificationsPage from "@/pages/Notifications";
import AttendeeInsights from "@/pages/AttendeeInsights";
import MyTickets from "@/pages/MyTickets";
import AdminNotifications from "@/pages/AdminNotifications";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedLayout>
                    <Dashboard />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedLayout>
                    <Profile />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/attendees"
                element={
                  <ProtectedLayout>
                    <AttendeeInsights />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedLayout>
                    <NotificationsPage />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedLayout>
                    <AdminNotifications />
                  </ProtectedLayout>
                }
              />
              <Route
                path="/events/:id/attendees"
                element={
                  <ProtectedLayout>
                    <AttendeeInsights singleEvent />
                  </ProtectedLayout>
                }
              />

              <Route
                path="/events"
                element={
                  <Layout>
                    <Events />
                  </Layout>
                }
              />
              <Route
                path="/events/:id"
                element={
                  <Layout>
                    <EventDetails />
                  </Layout>
                }
              />

              <Route
                path="/my-tickets"
                element={
                  <ProtectedLayout>
                    <MyTickets />
                  </ProtectedLayout>
                }
              />

              <Route
                path="*"
                element={<NotFound />}
              />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
      <ToastContainer />
    </>
  );
}

export default App;

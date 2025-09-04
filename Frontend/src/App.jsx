import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import "./App.css";
import Layout from "./components/Layout";
import EventDetails from "@/pages/EventDetails";
import Events from "@/pages/Events";
import { PublicRoute, ProtectedLayout } from "@/components/RouteGuards";
import Dashboard from "@/pages/Dashboard";
import AttendeeInsights from "@/pages/AttendeeInsights";

function App() {
  return (
    <AuthProvider>
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
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

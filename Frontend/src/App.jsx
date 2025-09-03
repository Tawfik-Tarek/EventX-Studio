import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import "./App.css";
import Layout from "./components/Layout";
import { PageLoading } from "./components/LoadingSpinner";
import EventCard from "./components/EventCard";
import EventDetails from "@/pages/EventDetails";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoading text="Loading your profile..." />;
  return user ? children : <Navigate to="/login" />;
};

const ProtectedLayout = ({ children }) => {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
};

function App() {
  const event = {
    id: "1",
    title: "Colombo Music Festival 2025",
    price: "2500LKR",
    totalSeats: 1200,
    availableSeats: 523,
    venue: "Viharamahadevi Open Air Theater, Colombo",
    date: "April 12, 2025",
    time: "6.00PM - 10.30PM",
  };
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/register"
            element={<Register />}
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
            path="/"
            element={<Navigate to="/login" />}
          />
          <Route
            path="/sidebar"
            element={
              <Layout>
                <EventCard event={event} />
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

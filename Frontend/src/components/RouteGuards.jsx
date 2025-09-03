import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoading } from "@/components/LoadingSpinner";
import Layout from "@/components/Layout";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoading text="Loading your profile..." />;
  }

  return user ? (
    children
  ) : (
    <Navigate
      to="/login"
      replace
    />
  );
};

export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoading text="Loading..." />;
  }

  return user ? (
    <Navigate
      to="/events"
      replace
    />
  ) : (
    children
  );
};

export const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoading text="Loading..." />;
  }

  return user ? (
    <Navigate
      to="/events"
      replace
    />
  ) : (
    <Navigate
      to="/login"
      replace
    />
  );
};

export const ProtectedLayout = ({ children }) => {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
};

export const PublicLayout = ({ children }) => {
  return (
    <PublicRoute>
      <Layout>{children}</Layout>
    </PublicRoute>
  );
};

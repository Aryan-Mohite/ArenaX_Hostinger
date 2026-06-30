import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomCursor from "./components/CustomCursor";
import Loader from "./components/Loader";

import Home from "./pages/Home";
import Games from "./pages/Games";
import Tournament from "./pages/Tournament";
import TeamFinder from "./pages/TeamFinder";
import Communities from "./pages/Communities";
import Stream from "./pages/Stream";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import About from "./pages/About";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminArchiveDashboard from "./pages/admin/AdminArchiveDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Loader />
      <CustomCursor />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/games" element={<Layout><Games /></Layout>} />
        <Route path="/tournament" element={<Layout><Tournament /></Layout>} />
        <Route path="/tournament/:id" element={<Layout><Tournament /></Layout>} />
        <Route path="/teamfinder" element={<Layout><TeamFinder /></Layout>} />
        <Route path="/communities" element={<Layout><Communities /></Layout>} />
        <Route path="/stream" element={<Layout><Stream /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/terms" element={<Layout><TermsAndConditions /></Layout>} />
        <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
        <Route path="/users/:id" element={<Layout><UserProfile /></Layout>} />
        <Route
          path="/profile"
          element={
            <Layout>
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/admin"
          element={
            <Layout>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </Layout>
          }
        />
        <Route
          path="/admin/archives"
          element={
            <Layout>
              <AdminRoute>
                <AdminArchiveDashboard />
              </AdminRoute>
            </Layout>
          }
        />
        {/* No Layout here on purpose — 404 page renders full-bleed, no Navbar/Footer */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
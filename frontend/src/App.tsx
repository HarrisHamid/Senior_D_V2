import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import LogoutScreen from "./pages/LogoutScreen";
import VerifyEmail from "./pages/VerifyEmail";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import Marketplace from "./pages/Marketplace";
import Dashboard from "./pages/Dashboard";
import Group from "./pages/Group";
import BrowseGroups from "./pages/BrowseGroups";
import Profile from "./pages/Profile";
import CreateProject from "./pages/CreateProject";
import MyProjects from "./pages/MyProjects";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import PublicOnlyRoute from "@/components/routing/PublicOnlyRoute";
import RoleRoute from "@/components/routing/RoleRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Accessible regardless of auth state */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/logout" element={<LogoutScreen />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

          <Route element={<RoleRoute allowedRoles={["student"]} />}>
            <Route path="/group" element={<Group />} />
            <Route path="/browse-groups" element={<BrowseGroups />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["course coordinator"]} />}>
            <Route path="/project/add" element={<CreateProject />} />
            <Route path="/my-projects" element={<MyProjects />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;

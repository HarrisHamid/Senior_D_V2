import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LogoutScreen from "./pages/LogoutScreen";
import Home from "./pages/Home";
import Course from "./pages/Course";
import ProjectDetail from "./pages/ProjectDetail";
import Marketplace from "./pages/Marketplace";
import Dashboard from "./pages/Dashboard";
import Group from "./pages/Group";
import Profile from "./pages/Profile";
import CreateCourse from "./pages/CreateCourse";
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

        <Route element={<ProtectedRoute />}>
          <Route path="/logout" element={<LogoutScreen />} />
          <Route path="/course" element={<Course />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

          <Route element={<RoleRoute allowedRoles={["student"]} />}>
            <Route path="/group" element={<Group />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["course coordinator"]} />}>
            <Route path="/course/create" element={<CreateCourse />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;

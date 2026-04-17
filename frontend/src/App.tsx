import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StudentsPage } from "./pages/StudentsPage";
import { TeachersPage } from "./pages/TeachersPage";
import { TeacherDashboardPage } from "./pages/TeacherDashboardPage";
import { TeacherAttendancePage } from "./pages/TeacherAttendancePage";

export type RouteKey =
  | "login"
  | "dashboard"
  | "teacher-dashboard"
  | "attendance"
  | "teacher-reports"
  | "students"
  | "teachers"
  | "reports"
  | "settings";

const validRoutes: RouteKey[] = [
  "login",
  "dashboard",
  "teacher-dashboard",
  "attendance",
  "teacher-reports",
  "students",
  "teachers",
  "reports",
  "settings",
];

const getRouteFromHash = (): RouteKey => {
  const hash = window.location.hash.replace("#/", "").trim() as RouteKey;
  return validRoutes.includes(hash) ? hash : "login";
};

function App() {
  const [route, setRoute] = useState<RouteKey>(getRouteFromHash);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRouteFromHash());
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (nextRoute: RouteKey) => {
    window.location.hash = `/${nextRoute}`;
  };

  const page = useMemo(() => {
    switch (route) {
      case "login":
        return <LoginPage onLogin={navigate} />;
      case "students":
        return (
          <AppShell activeRoute={route} onNavigate={navigate}>
            <StudentsPage />
          </AppShell>
        );
      case "teachers":
        return (
          <AppShell activeRoute={route} onNavigate={navigate}>
            <TeachersPage />
          </AppShell>
        );
      case "reports":
        return (
          <AppShell activeRoute={route} onNavigate={navigate}>
            <ReportsPage />
          </AppShell>
        );
      case "settings":
        return (
          <AppShell activeRoute={route} onNavigate={navigate}>
            <SettingsPage />
          </AppShell>
        );
      case "teacher-dashboard":
        return (
          <AppShell activeRoute={route} onNavigate={navigate} variant="teacher">
            <TeacherDashboardPage />
          </AppShell>
        );
      case "attendance":
        return (
          <AppShell activeRoute={route} onNavigate={navigate} variant="teacher">
            <TeacherAttendancePage />
          </AppShell>
        );
      case "teacher-reports":
        return (
          <AppShell activeRoute={route} onNavigate={navigate} variant="teacher">
            <ReportsPage />
          </AppShell>
        );
      case "dashboard":
      default:
        return (
          <AppShell activeRoute="dashboard" onNavigate={navigate}>
            <DashboardPage />
          </AppShell>
        );
    }
  }, [route]);

  return page;
}

export default App;

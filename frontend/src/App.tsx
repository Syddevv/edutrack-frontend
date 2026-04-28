import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { getCurrentUser, login, logout, type AuthUser } from "./auth";
import { defaultAppSettings, getAppSettings, type AppSettings } from "./settings";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StudentsPage } from "./pages/StudentsPage";
import { TeachersPage } from "./pages/TeachersPage";
import { TeacherDashboardPage } from "./pages/TeacherDashboardPage";
import { TeacherAttendancePage } from "./pages/TeacherAttendancePage";
import { TeacherReportsPage } from "./pages/TeacherReportsPage";

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

function normalizeRole(role: string | null | undefined): "admin" | "teacher" {
  return typeof role === "string" && role.toLowerCase() === "teacher"
    ? "teacher"
    : "admin";
}

function defaultRouteForRole(role: string, settings: AppSettings): RouteKey {
  return normalizeRole(role) === "teacher"
    ? "teacher-dashboard"
    : settings.defaultLandingPage;
}

function isRouteAllowed(route: RouteKey, user: AuthUser | null): boolean {
  if (route === "login") {
    return user === null;
  }

  if (user === null) {
    return false;
  }

  if (normalizeRole(user.role) === "teacher") {
    return ["teacher-dashboard", "attendance", "teacher-reports"].includes(route);
  }

  return ["dashboard", "students", "teachers", "reports", "settings"].includes(route);
}

function App() {
  const [route, setRoute] = useState<RouteKey>(getRouteFromHash);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);
  const [isSettingsReady, setIsSettingsReady] = useState(false);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRouteFromHash());
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    getCurrentUser()
      .then(async (user) => {
        setAuthUser(user);

        try {
          const loadedSettings = await getAppSettings();
          setSettings(loadedSettings);
        } catch {
          setSettings(defaultAppSettings);
        } finally {
          setIsSettingsReady(true);
        }
      })
      .catch(() => {
        setAuthUser(null);
        setSettings(defaultAppSettings);
        setIsSettingsReady(true);
      })
      .finally(() => setIsAuthReady(true));
  }, []);

  const navigate = (nextRoute: RouteKey) => {
    window.location.hash = `/${nextRoute}`;
  };

  useEffect(() => {
    if (!isAuthReady || !isSettingsReady) {
      return;
    }

    if (!isRouteAllowed(route, authUser)) {
      navigate(authUser ? defaultRouteForRole(authUser.role, settings) : "login");
    }
  }, [authUser, isAuthReady, isSettingsReady, route, settings]);

  const handleLogin = async ({
    email,
    password,
    expectedRole,
    rememberMe,
  }: {
    email: string;
    password: string;
    expectedRole: "admin" | "teacher";
    rememberMe: boolean;
  }) => {
    try {
      const user = await login(email, password, rememberMe);
      const actualRole = normalizeRole(user.role);

      if (actualRole !== expectedRole) {
        return `This account is not allowed to log in as ${expectedRole}.`;
      }

      setAuthUser(user);
      try {
        const loadedSettings = await getAppSettings();
        setSettings(loadedSettings);
        navigate(defaultRouteForRole(user.role, loadedSettings));
      } catch {
        setSettings(defaultAppSettings);
        navigate(defaultRouteForRole(user.role, defaultAppSettings));
      }
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : "Unable to log in.";
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setAuthUser(null);
      navigate("login");
    }
  };

  if (!isAuthReady || !isSettingsReady) {
    return <div className="login-screen">Loading...</div>;
  }

  if (!isRouteAllowed(route, authUser)) {
    return <div className="login-screen">Loading...</div>;
  }

  switch (route) {
    case "login":
      return <LoginPage onLogin={handleLogin} />;
    case "students":
      return (
        <AppShell
          activeRoute={route}
          settings={settings}
          onNavigate={navigate}
          onLogout={handleLogout}
        >
          <StudentsPage />
        </AppShell>
      );
    case "teachers":
      return (
        <AppShell
          activeRoute={route}
          settings={settings}
          onNavigate={navigate}
          onLogout={handleLogout}
        >
          <TeachersPage />
        </AppShell>
      );
    case "reports":
      return (
        <AppShell
          activeRoute={route}
          settings={settings}
          onNavigate={navigate}
          onLogout={handleLogout}
        >
          <ReportsPage />
        </AppShell>
      );
    case "settings":
      return (
        <AppShell
          activeRoute={route}
          settings={settings}
          onNavigate={navigate}
          onLogout={handleLogout}
        >
          <SettingsPage settings={settings} onSettingsSaved={setSettings} />
        </AppShell>
      );
    case "teacher-dashboard":
      return (
        <AppShell
          activeRoute={route}
          settings={settings}
          onNavigate={navigate}
          onLogout={handleLogout}
          variant="teacher"
        >
          <TeacherDashboardPage teacherName={authUser?.name} />
        </AppShell>
      );
    case "attendance":
      return (
        <AppShell
          activeRoute={route}
          settings={settings}
          onNavigate={navigate}
          onLogout={handleLogout}
          variant="teacher"
        >
          <TeacherAttendancePage />
        </AppShell>
      );
    case "teacher-reports":
      return (
        <AppShell
          activeRoute={route}
          settings={settings}
          onNavigate={navigate}
          onLogout={handleLogout}
          variant="teacher"
        >
          <TeacherReportsPage />
        </AppShell>
      );
    case "dashboard":
    default:
      return (
        <AppShell
          activeRoute="dashboard"
          settings={settings}
          onNavigate={navigate}
          onLogout={handleLogout}
        >
          <DashboardPage />
        </AppShell>
      );
  }
}

export default App;


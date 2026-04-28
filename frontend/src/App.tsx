import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import {
  getCurrentUser,
  login,
  logout,
  type AuthUser,
  verifyLoginTwoFactor,
} from "./auth";
import {
  defaultAppSettings,
  getAppSettings,
  type AppSettings,
} from "./settings";
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

function normalizeRole(role: string): "admin" | "teacher" {
  return role.toLowerCase() === "teacher" ? "teacher" : "admin";
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
    return ["teacher-dashboard", "attendance", "teacher-reports"].includes(
      route,
    );
  }

  return ["dashboard", "students", "teachers", "reports", "settings"].includes(
    route,
  );
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
      navigate(
        authUser ? defaultRouteForRole(authUser.role, settings) : "login",
      );
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
      const response = await login(email, password, rememberMe);
      const resolvedRole =
        "role" in response ? normalizeRole(response.role) : "admin";

      if (resolvedRole !== expectedRole) {
        return {
          error: `This account is not allowed to log in as ${expectedRole}.`,
          challenge: null,
        };
      }

      if ("requiresTwoFactor" in response && response.requiresTwoFactor) {
        return {
          error: null,
          challenge: response,
        };
      }

      const user = response as AuthUser;
      const actualRole = normalizeRole(user.role);

      if (actualRole !== expectedRole) {
        return {
          error: `This account is not allowed to log in as ${expectedRole}.`,
          challenge: null,
        };
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
      return {
        error: null,
        challenge: null,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unable to log in.",
        challenge: null,
      };
    }
  };

  const handleLoginTwoFactorSuccess = async (code: string) => {
    try {
      const user = await verifyLoginTwoFactor(code);
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
      return error instanceof Error ? error.message : "Unable to verify 2FA.";
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
      return (
        <LoginPage
          onLogin={handleLogin}
          onVerifyLoginTwoFactor={handleLoginTwoFactorSuccess}
        />
      );
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
          <TeacherDashboardPage
            schoolName={settings.schoolName}
            teacherName={authUser?.name}
          />
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
          <DashboardPage schoolName={settings.schoolName} />
        </AppShell>
      );
  }
}

export default App;

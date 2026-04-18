import { useState, type ReactNode } from "react";
import type { RouteKey } from "../App";
import { ChatbotPanel } from "./ChatbotPanel";
import { ConfirmationDialog } from "./ConfirmationDialog";
import {
  CheckCircleIcon,
  ChartIcon,
  GraduationCapIcon,
  GridIcon,
  LogoutIcon,
  SettingsIcon,
  UsersIcon,
} from "./Icons";

type AppShellProps = {
  activeRoute: RouteKey;
  children: ReactNode;
  variant?: "admin" | "teacher";
  onNavigate: (route: RouteKey) => void;
  onLogout: () => Promise<void>;
};

type NavItem = {
  key: RouteKey;
  label: string;
  icon: ReactNode;
  route: RouteKey;
};

const navItems: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    route: "dashboard",
    icon: <GridIcon className="nav__icon" />,
  },
  {
    key: "students",
    label: "Students",
    route: "students",
    icon: <UsersIcon className="nav__icon" />,
  },
  {
    key: "teachers",
    label: "Teachers",
    route: "teachers",
    icon: <GraduationCapIcon className="nav__icon" />,
  },
  {
    key: "reports",
    label: "Reports",
    route: "reports",
    icon: <ChartIcon className="nav__icon" />,
  },
  {
    key: "settings",
    label: "Settings",
    route: "settings",
    icon: <SettingsIcon className="nav__icon" />,
  },
];

const teacherNavItems: NavItem[] = [
  {
    key: "teacher-dashboard",
    label: "Dashboard",
    route: "teacher-dashboard",
    icon: <GridIcon className="nav__icon" />,
  },
  {
    key: "attendance",
    label: "Attendance",
    route: "attendance",
    icon: <CheckCircleIcon className="nav__icon" />,
  },
  {
    key: "reports",
    label: "Reports",
    route: "teacher-reports",
    icon: <ChartIcon className="nav__icon" />,
  },
];

export function AppShell({
  activeRoute,
  children,
  variant = "admin",
  onNavigate,
  onLogout,
}: AppShellProps) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const sidebarItems = variant === "teacher" ? teacherNavItems : navItems;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="brand-mark">
            <GraduationCapIcon className="brand-mark__icon" />
          </div>
          <span className="brand-name">EduTrack</span>
        </div>

        <nav className="sidebar__nav" aria-label="Primary">
          {sidebarItems.map((item) => {
            const isActive = item.route === activeRoute;
            return (
              <button
                key={item.key}
                className={`nav__item${isActive ? " nav__item--active" : ""}`}
                type="button"
                onClick={() => onNavigate(item.route)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          className="sidebar__logout"
          type="button"
          onClick={() => setIsLogoutConfirmOpen(true)}
        >
          <LogoutIcon className="nav__icon" />
          <span>Logout</span>
        </button>
      </aside>

      <main className="app-shell__content">{children}</main>
      <ConfirmationDialog
        isOpen={isLogoutConfirmOpen}
        title="Log Out"
        message="Are you sure you want to log out of EduTrack?"
        confirmLabel={isLoggingOut ? "Logging Out..." : "Log Out"}
        tone="danger"
        onCancel={() => setIsLogoutConfirmOpen(false)}
        onConfirm={async () => {
          setIsLoggingOut(true);
          await onLogout();
          setIsLoggingOut(false);
          setIsLogoutConfirmOpen(false);
        }}
      />
      <ChatbotPanel
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onOpen={() => setIsChatbotOpen(true)}
      />
    </div>
  );
}

import { useState } from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
} from "../components/Icons";

const todayClassData = {
  name: "Math 101",
  time: "09:00 AM - 10:30 AM",
  status: "Active",
};

const statCards = [
  {
    icon: <ClockIcon className="stat-card__icon" />,
    title: "Today's Class",
    value: todayClassData.name,
    subtext: todayClassData.time,
    badge: { tone: "success", label: "Active" },
  },
  {
    icon: <UsersIcon className="stat-card__icon" />,
    title: "Total Students",
    value: "32",
    subtext: "Enrolled in this session",
  },
  {
    icon: <CheckCircleIcon className="stat-card__icon" />,
    title: "Present Count",
    value: "28",
    subtext: "87.5% attendance rate",
    badge: { tone: "success", label: "+2% vs last week" },
  },
  {
    icon: <XCircleIcon className="stat-card__icon" />,
    title: "Absent Count",
    value: "4",
    subtext: "Needs follow-up",
  },
];

const recentActivityRows = [
  { name: "Alice Johnson", status: "Present", class: "Math 101" },
  { name: "Bob Smith", status: "Absent", class: "Math 101" },
  { name: "Charlie Brown", status: "Present", class: "Math 101" },
  { name: "David Lee", status: "Late", class: "Math 101" },
  { name: "Eva Green", status: "Present", class: "Math 101" },
];

const nextClassData = {
  code: "11",
  name: "Physics 202",
  location: "Lab Room 3B",
  time: "11:00 AM",
  minutesRemaining: 45,
};

function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { bg: string; text: string }> = {
    Present: { bg: "#ebfbef", text: "#22c55e" },
    Absent: { bg: "#fff1f1", text: "#ef4444" },
    Late: { bg: "#fff7e8", text: "#f59e0b" },
  };
  const config = statusMap[status] || statusMap.Present;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        backgroundColor: config.bg,
        color: config.text,
        padding: "6px 10px",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: "500",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: config.text,
        }}
      />
      {status}
    </span>
  );
}

export function TeacherDashboardPage() {
  const [dismissedAlert, setDismissedAlert] = useState(false);

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}
    >
      {/* Main Content */}
      <div>
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 4px" }}
            >
              Dashboard
            </h1>
            <p style={{ color: "#8b8f97", margin: "0", fontSize: "16px" }}>
              Overview for Monday, October 24th
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                color: "#8b8f97",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ display: "flex", alignItems: "center" }}>
                <ClockIcon className="w-[18px] h-[18px]" />
              </span>
              Oct 24, 2023
            </div>
            <button
              style={{
                backgroundColor: "#171717",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 18px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Take Attendance
            </button>
          </div>
        </header>

        {/* Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {statCards.map((card, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ece7df",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#8b8f97",
                  }}
                >
                  {card.icon}
                </div>
                {card.badge && (
                  <span
                    style={{
                      backgroundColor:
                        card.badge.tone === "success" ? "#ebfbef" : "#fff7e8",
                      color:
                        card.badge.tone === "success" ? "#22c55e" : "#f59e0b",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {card.badge.label}
                  </span>
                )}
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#8b8f97",
                  margin: "0 0 6px",
                  fontWeight: "500",
                }}
              >
                {card.title}
              </p>
              <h3
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  margin: "0",
                  color: "#171717",
                }}
              >
                {card.value}
              </h3>
              {card.subtext && (
                <p
                  style={{
                    fontSize: "13px",
                    color: "#8b8f97",
                    margin: "6px 0 0",
                  }}
                >
                  {card.subtext}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "700",
                margin: "0",
              }}
            >
              Recent Activity
            </h2>
            <a
              href="#"
              style={{
                color: "#747b86",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              View All
            </a>
          </div>
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #ece7df",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#faf9f7",
                    borderBottom: "1px solid #ece7df",
                  }}
                >
                  <th
                    style={{
                      padding: "16px 20px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#8b8f97",
                      textTransform: "uppercase",
                    }}
                  >
                    Student Name
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#8b8f97",
                      textTransform: "uppercase",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#8b8f97",
                      textTransform: "uppercase",
                    }}
                  >
                    Class
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentActivityRows.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom:
                        idx < recentActivityRows.length - 1
                          ? "1px solid #ece7df"
                          : "none",
                    }}
                  >
                    <td
                      style={{
                        padding: "16px 20px",
                        fontSize: "14px",
                        color: "#171717",
                        fontWeight: "500",
                      }}
                    >
                      {row.name}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <StatusBadge status={row.status} />
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        fontSize: "14px",
                        color: "#171717",
                      }}
                    >
                      {row.class}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Right Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Next Class Card */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #ece7df",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                margin: "0",
                color: "#171717",
              }}
            >
              Next Class
            </h3>
            <svg
              style={{
                width: "18px",
                height: "18px",
                color: "#8b8f97",
                stroke: "currentColor",
              }}
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "8px",
                backgroundColor: "#171717",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "700",
              }}
            >
              {nextClassData.code}
            </div>
            <div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#171717",
                  margin: "0 0 4px",
                }}
              >
                {nextClassData.name}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#8b8f97",
                  margin: "0",
                }}
              >
                {nextClassData.location} • {nextClassData.time}
              </p>
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              paddingTop: "12px",
              borderTop: "1px solid #ece7df",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "#8b8f97",
                margin: "0",
              }}
            >
              {nextClassData.minutesRemaining} mins remaining until start
            </p>
          </div>
        </div>

        {/* AI Insight Card */}
        {!dismissedAlert && (
          <div
            style={{
              backgroundColor: "#171717",
              color: "#fff",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <svg
                style={{
                  width: "16px",
                  height: "16px",
                }}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  opacity: 0.8,
                }}
              >
                AI Insight
              </span>
            </div>
            <h4
              style={{
                fontSize: "16px",
                fontWeight: "600",
                margin: "0 0 12px",
              }}
            >
              Attendance Alert
            </h4>
            <p
              style={{
                fontSize: "13px",
                lineHeight: "1.6",
                margin: "0 0 16px",
                opacity: 0.9,
              }}
            >
              David Lee has been late 3 times this week. Would you like to
              schedule a quick check-in meeting?
            </p>
            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              <button
                style={{
                  flex: 1,
                  backgroundColor: "#fff",
                  color: "#171717",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Schedule
              </button>
              <button
                onClick={() => setDismissedAlert(true)}
                style={{
                  flex: 1,
                  backgroundColor: "transparent",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

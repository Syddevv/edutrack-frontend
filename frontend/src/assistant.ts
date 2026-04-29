import {
  getAdminAttendanceHistory,
  getTeacherAttendanceHistory,
} from "./attendanceHistory";
import { getDashboardOverview } from "./dashboard";
import { getReportsOverview } from "./reports";
import { getStudents } from "./students";
import { getTeacherDashboardOverview } from "./teacherDashboard";
import {
  getTeacherReports,
  type TeacherReportClassSelection,
} from "./teacherReports";
import Groq from "groq-sdk";

export type AssistantRole = "admin" | "teacher";

export type AssistantMessage = {
  role: "assistant" | "user";
  content: string;
};

const SYSTEM_PROMPT = `
You are the EduTrack AI Assistant for Bulacan Polytechnic College.
Use only the EduTrack data provided in the prompt.
Do not hallucinate or invent student records, attendance counts, names, courses, sections, or report values.
If data is missing or insufficient, say what is missing and where the user can check.
Keep answers concise and practical.
Treat "Late" as part of present unless the user explicitly asks for strictly on-time students only.
Do not treat a latest known status as today's attendance unless the context explicitly marks it as today's attendance.
When matchedStudents or matchedPerformance contains a student, treat that as a confirmed match and do not say the student was not found.
For teacher chats, only use the teacher's assigned class and section data.
`.trim();

/* -------------------- UTILITIES -------------------- */

function formatLocalDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, number>>((counts, item) => {
    const key = getKey(item).trim() || "Unassigned";
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function toContextJson(label: string, value: unknown) {
  return `${label}:\n${JSON.stringify(value)}`;
}

function formatTeacherClassName(assignment: TeacherReportClassSelection) {
  return [
    assignment.course,
    assignment.year,
    assignment.section,
    assignment.subject,
  ]
    .filter(Boolean)
    .join(" - ");
}

function uniqueTeacherAssignments(assignments: TeacherReportClassSelection[]) {
  const map = new Map<number, TeacherReportClassSelection>();
  assignments.forEach((a) => {
    if (!map.has(a.classId)) map.set(a.classId, a);
  });
  return Array.from(map.values());
}

function getLatestUserMessage(messages: AssistantMessage[]) {
  return [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
}

function normalizeForSearch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function getSearchTerms(input: string) {
  const normalized = normalizeForSearch(input);
  const parts = normalized
    .split(" ")
    .map((part) => part.trim())
    .filter((part) => part.length >= 2);

  return Array.from(new Set(parts)).slice(0, 8);
}

function matchesSearch(value: string, terms: string[]) {
  if (terms.length === 0) {
    return false;
  }

  const normalizedValue = normalizeForSearch(value);
  return terms.every((term) => normalizedValue.includes(term));
}

function matchesStudentQuery(
  searchTerms: string[],
  ...values: Array<string | undefined | null>
) {
  return matchesSearch(
    values.filter(Boolean).join(" "),
    searchTerms,
  );
}

/* -------------------- RETRY LOGIC -------------------- */

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const message = error?.message || "";

    if (retries > 0 && message.includes("rate_limit_exceeded")) {
      const waitMatch = message.match(/try again in ([\d.]+)s/);
      const waitTime = waitMatch ? parseFloat(waitMatch[1]) * 1000 : 2000;

      await new Promise((res) => setTimeout(res, waitTime));
      return withRetry(fn, retries - 1);
    }

    throw error;
  }
}

/* -------------------- CONTEXT BUILDERS -------------------- */

async function settle<T>(
  label: string,
  loader: () => Promise<T>,
): Promise<
  | { label: string; status: "available"; data: T }
  | { label: string; status: "unavailable"; reason: string }
> {
  try {
    return { label, status: "available", data: await loader() };
  } catch (error) {
    return {
      label,
      status: "unavailable",
      reason: error instanceof Error ? error.message : "Request failed.",
    };
  }
}

async function buildAdminContext(messages: AssistantMessage[]) {
  const [dashboard, reports, students, attendanceHistory] = await Promise.all([
    settle("dashboard", getDashboardOverview),
    settle("reports", getReportsOverview),
    settle("students", getStudents),
    settle("attendance history", () => getAdminAttendanceHistory()),
  ]);

  const latestUserMessage = getLatestUserMessage(messages);
  const searchTerms = getSearchTerms(latestUserMessage);
  const matchedStudents =
    students.status === "available"
      ? students.data.students
          .filter((student) =>
            matchesStudentQuery(
              searchTerms,
              student.fullName,
              student.studentId,
              student.course.code,
              student.course.name,
              student.yearLevel.name,
              student.section.name,
            ),
          )
          .slice(0, 12)
      : [];
  const matchedStudentNames = new Set(
    matchedStudents.map((student) => normalizeForSearch(student.fullName)),
  );
  const matchedTodayAttendance =
    dashboard.status === "available"
      ? dashboard.data.rows
          .filter((row) =>
            matchesStudentQuery(
              searchTerms,
              row.fullName,
              row.studentCode,
              row.course,
              row.yearSection,
            ),
          )
          .slice(0, 12)
      : [];
  const matchedPerformance =
    reports.status === "available"
      ? reports.data.absenceBreakdown
          .filter((row) => {
            return (
              matchesStudentQuery(
                searchTerms,
                row.fullName,
                row.studentCode,
                row.course,
              ) ||
              matchedStudentNames.has(normalizeForSearch(row.fullName))
            );
          })
          .slice(0, 12)
      : [];
  const matchedAttendanceHistory =
    attendanceHistory.status === "available"
      ? attendanceHistory.data.history
          .flatMap((entry) =>
            entry.attentionRows
              .filter((row) =>
                matchesStudentQuery(
                  searchTerms,
                  row.fullName,
                  row.studentCode,
                  row.course,
                  row.yearSection,
                ),
              )
              .map((row) => ({
                date: entry.date,
                dateLabel: entry.dateLabel,
                studentCode: row.studentCode,
                fullName: row.fullName,
                course: row.course,
                yearSection: row.yearSection,
                status: row.status,
              })),
          )
          .slice(0, 12)
      : [];

  return toContextJson("EduTrack admin context", {
    role: "admin",
    dashboard:
      dashboard.status === "available"
        ? {
            date: dashboard.data.dateLabel,
            summary: dashboard.data.summary,
            matchedTodayAttendance: matchedTodayAttendance.map((row) => ({
              studentCode: row.studentCode,
              fullName: row.fullName,
              course: row.course,
              yearSection: row.yearSection,
              latestAttendanceStatus: row.status,
              latestAttendanceRecordDate: row.date,
              isForCurrentDashboardDate:
                row.date === formatLocalDate(new Date()),
            })),
          }
        : undefined,
    reports:
      reports.status === "available"
        ? {
            summary: reports.data.reportsSummary,
            matchedPerformance: matchedPerformance.map((row) => ({
              studentCode: row.studentCode,
              fullName: row.fullName,
              course: row.course,
              absences: row.absences,
              attendanceRate: row.attendanceRate,
            })),
          }
        : undefined,
    students:
      students.status === "available"
        ? {
            total: students.data.students.length,
            byCourse: countBy(
              students.data.students,
              (s: any) => s.course.code || s.course.name,
            ),
            matchedStudents: matchedStudents.map((student) => ({
              studentId: student.studentId,
              fullName: student.fullName,
              email: student.email,
              course: student.course.code || student.course.name,
              year: student.yearLevel.name,
              section: student.section.name,
              latestKnownStatus: student.attendanceStatus,
              latestKnownStatusSource:
                "students table; this is not necessarily today's attendance",
            })),
          }
        : undefined,
    attendanceHistory:
      attendanceHistory.status === "available"
        ? {
            recentDates: attendanceHistory.data.history.slice(0, 2),
            matchedStudentHistory: matchedAttendanceHistory,
          }
        : undefined,
  });
}

async function buildTeacherContext(messages: AssistantMessage[]) {
  const today = formatLocalDate(new Date());

  const [dashboard, reports, attendanceHistory] = await Promise.all([
    settle("teacher dashboard", getTeacherDashboardOverview),
    settle("teacher reports", () => getTeacherReports()),
    settle("teacher attendance history", () => getTeacherAttendanceHistory()),
  ]);

  const assignments =
    reports.status === "available"
      ? uniqueTeacherAssignments(reports.data.assignments)
      : [];
  const fallbackClassId =
    dashboard.status === "available"
      ? dashboard.data.todayClass?.classId
      : reports.status === "available"
        ? (reports.data.selectedClassId ?? undefined)
        : undefined;
  const classIds =
    assignments.length > 0
      ? assignments.map((assignment) => assignment.classId)
      : fallbackClassId
        ? [fallbackClassId]
        : [];

  const classReports = await Promise.all(
    classIds.map((classId) =>
      settle(`teacher report for class ${classId}`, () =>
        getTeacherReports(classId),
      ),
    ),
  );

  const latestUserMessage = getLatestUserMessage(messages);
  const searchTerms = getSearchTerms(latestUserMessage);

  return toContextJson("EduTrack teacher context", {
    role: "teacher",
    dashboard:
      dashboard.status === "available"
        ? {
            teacherName: dashboard.data.teacherName,
            date: dashboard.data.dateLabel,
            attendanceDate: dashboard.data.attendanceDateLabel,
            todayClass: dashboard.data.todayClass,
            nextClass: dashboard.data.nextClass,
            summary: dashboard.data.summary,
          }
        : undefined,
    assignedClasses: assignments.map((assignment) => ({
      classId: assignment.classId,
      className: formatTeacherClassName(assignment),
      course: assignment.course,
      year: assignment.year,
      section: assignment.section,
      subject: assignment.subject,
      schedule: `${assignment.dayOfWeek ?? "Unscheduled"} ${assignment.startTime}-${assignment.endTime}`,
    })),
    classReports: classReports
      .filter((report) => report.status === "available")
      .map((report) => {
        const selectedClass =
          report.data.assignments.find(
            (assignment: TeacherReportClassSelection) =>
              assignment.classId === report.data.selectedClassId,
          ) ?? null;

        return {
          classId: report.data.selectedClassId,
          className: selectedClass ? formatTeacherClassName(selectedClass) : "",
          summary: report.data.summary,
          atRiskStudents: report.data.atRiskStudents
            .slice(0, 25)
            .map((student: (typeof report.data.atRiskStudents)[number]) => ({
              studentId: student.studentId,
              studentCode: student.studentCode,
              fullName: student.fullName,
              absences: student.absences,
              attendanceRate: student.attendanceRate,
            })),
          matchedStudents: report.data.atRiskStudents
            .filter((student: (typeof report.data.atRiskStudents)[number]) =>
              matchesStudentQuery(
                searchTerms,
                student.fullName,
                student.studentCode,
              ),
            )
            .slice(0, 12)
            .map((student: (typeof report.data.atRiskStudents)[number]) => ({
              studentId: student.studentId,
              studentCode: student.studentCode,
              fullName: student.fullName,
              absences: student.absences,
              attendanceRate: student.attendanceRate,
            })),
        };
      }),
    attendanceHistory:
      attendanceHistory.status === "available"
        ? attendanceHistory.data.history.slice(0, 3).map((entry: any) => ({
            date: entry.date,
            dateLabel: entry.dateLabel,
            summary: entry.summary,
          }))
        : undefined,
    date: today,
  });
}

async function buildAssistantContext(
  role: AssistantRole,
  messages: AssistantMessage[],
) {
  return role === "teacher"
    ? buildTeacherContext(messages)
    : buildAdminContext(messages);
}

function formatConversation(messages: AssistantMessage[]) {
  return messages
    .slice(-3)
    .map(
      (m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`,
    )
    .join("\n\n");
}

function getRoleAccessPolicy(role: AssistantRole) {
  if (role === "teacher") {
    return [
      "This is a teacher chat.",
      "Use only the teacher-scoped context included below.",
      "If the user names a class or section, match it against assignedClasses and classReports.",
      "When classReports includes atRiskStudents for that class, answer with those students.",
      "Do not provide school-wide student information.",
    ].join(" ");
  }

  return [
      "This is an admin chat.",
      "Use only the admin context provided below.",
      "When matchedStudents or matchedPerformance contains a student, use that data directly.",
      "Use matchedTodayAttendance only as attendance data for the specific record date provided there.",
      "Only call a status today's attendance when isForCurrentDashboardDate is true.",
      "Use latestKnownStatus only as a latest known record, not as today's attendance.",
    ].join(" ");
}

/* -------------------- MAIN FUNCTION -------------------- */

export async function askEduTrackAssistant(
  messages: AssistantMessage[],
  role: AssistantRole,
) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("Missing VITE_GROQ_API_KEY");
  }

  const groq = new Groq({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const context = await buildAssistantContext(role, messages);

  // 🔥 dynamic trimming
  let contextToSend = context;
  if (context.length > 6000) {
    contextToSend = context.slice(0, 6000);
  }

  let finalPrompt = `
${getRoleAccessPolicy(role)}

Current EduTrack data:
${contextToSend}

Conversation:
${formatConversation(messages)}

Answer the user's latest message.
`.trim();

  if (finalPrompt.length > 10000) {
    finalPrompt = finalPrompt.slice(0, 10000);
  }

  const completion = await withRetry(() =>
    groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.25,
      max_tokens: 400,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: finalPrompt },
      ],
    }),
  );

  return (
    completion.choices?.[0]?.message?.content?.trim() ||
    "No response generated."
  );
}

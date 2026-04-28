import { useEffect, useMemo, useState } from "react";
import { TeacherAddModal } from "../components/TeacherAddModal";
import { EditTeacherModal } from "../components/EditTeacherModal";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { StatusModal } from "../components/StatusModal";
import {
  FilterIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "../components/Icons";
import {
  createTeacher,
  deleteTeacher,
  getTeachers,
  type TeacherLookupData,
  type TeacherRecord,
  type TeacherSummary,
  updateTeacher,
} from "../teachers";

const emptySummary: TeacherSummary = {
  total: 0,
  active: 0,
  onLeave: 0,
  inactive: 0,
};

const emptyLookups: TeacherLookupData = {
  subjects: [],
  courses: [],
  yearLevels: [],
  sections: [],
  statuses: ["Active", "On Leave", "Inactive"],
};

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("");
}

function formatTime(time: string) {
  const [hourText = "0", minute = "00"] = time.split(":");
  const hour = Number(hourText);

  if (Number.isNaN(hour)) {
    return time;
  }

  const period = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;

  return `${normalizedHour}:${minute} ${period}`;
}

function formatAssignedClassItem(teacher: TeacherRecord, assignmentIndex: number) {
  const item = teacher.assignedClasses[assignmentIndex];

  if (!item) {
    return "No class assigned";
  }

  return `${item.subject} • ${item.course.code ?? item.course.name} ${item.yearLevel.name}-${item.section.name} • ${formatTime(item.startTime)}-${formatTime(item.endTime)}`;
}

function formatSummaryCards(summary: TeacherSummary) {
  return [
    {
      title: "Total Teachers",
      value: String(summary.total),
      hint: `${summary.total} records in the directory`,
      tone: "success" as const,
    },
    {
      title: "Active Now",
      value: String(summary.active),
      hint: "Available for active teaching loads",
    },
    {
      title: "On Leave",
      value: String(summary.onLeave),
      hint: `${summary.inactive} inactive account${summary.inactive === 1 ? "" : "s"}`,
    },
  ];
}

export function TeachersPage() {
  const [feedback, setFeedback] = useState<{
    message: string;
    title: string;
    tone: "success" | "error";
  } | null>(null);
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [summary, setSummary] = useState<TeacherSummary>(emptySummary);
  const [lookups, setLookups] = useState<TeacherLookupData>(emptyLookups);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddSubmitting, setIsAddSubmitting] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherRecord | null>(
    null,
  );
  const [teacherToEdit, setTeacherToEdit] = useState<TeacherRecord | null>(null);

  useEffect(() => {
    void loadTeachers();
  }, []);

  async function loadTeachers() {
    setIsLoading(true);
    setPageError("");

    try {
      const response = await getTeachers();
      setTeachers(response.teachers);
      setSummary(response.summary);
      setLookups(response.lookups);
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Failed to load teachers.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const filteredTeachers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (query === "") {
      return teachers;
    }

    return teachers.filter((teacher) => {
      const assignments = teacher.assignedClasses
        .map(
          (item) =>
            `${item.subject} ${item.course.code ?? item.course.name} ${item.yearLevel.name} ${item.section.name}`,
        )
        .join(" ")
        .toLowerCase();

      return [
        teacher.fullName,
        teacher.email,
        teacher.teacherId,
        teacher.status,
        assignments,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [searchTerm, teachers]);

  const summaryCards = useMemo(() => formatSummaryCards(summary), [summary]);

  async function handleCreateTeacher(
    input: Parameters<typeof createTeacher>[0],
  ) {
    setIsAddSubmitting(true);

    try {
      const teacher = await createTeacher(input);
      setTeachers((current) => [teacher, ...current]);
      await loadTeachers();
      setIsAddTeacherOpen(false);
      setFeedback({
        title: "Teacher Added",
        message: "The teacher account was created successfully.",
        tone: "success",
      });
    } finally {
      setIsAddSubmitting(false);
    }
  }

  async function handleEditTeacher(input: Parameters<typeof updateTeacher>[0]) {
    setIsEditSubmitting(true);

    try {
      const updatedTeacher = await updateTeacher(input);
      setTeachers((current) =>
        current.map((teacher) =>
          teacher.id === updatedTeacher.id ? updatedTeacher : teacher,
        ),
      );
      await loadTeachers();
      setTeacherToEdit(null);
      setFeedback({
        title: "Teacher Updated",
        message: "The teacher details were saved successfully.",
        tone: "success",
      });
    } finally {
      setIsEditSubmitting(false);
    }
  }

  async function handleDeleteTeacher() {
    if (!teacherToDelete) {
      return;
    }

    const currentTeacher = teacherToDelete;

    try {
      await deleteTeacher(currentTeacher.id);
      setTeachers((current) =>
        current.filter((teacher) => teacher.id !== currentTeacher.id),
      );
      setSummary((current) => ({
        total: Math.max(0, current.total - 1),
        active: Math.max(
          0,
          current.active - (currentTeacher.status === "Active" ? 1 : 0),
        ),
        onLeave: Math.max(
          0,
          current.onLeave - (currentTeacher.status === "On Leave" ? 1 : 0),
        ),
        inactive: Math.max(
          0,
          current.inactive - (currentTeacher.status === "Inactive" ? 1 : 0),
        ),
      }));
      setTeacherToDelete(null);
      setFeedback({
        title: "Teacher Deleted",
        message: "The teacher record was removed successfully.",
        tone: "success",
      });
    } catch (error) {
      setFeedback({
        title: "Delete Teacher Failed",
        message:
          error instanceof Error ? error.message : "Failed to delete teacher.",
        tone: "error",
      });
    }
  }

  return (
    <section className="page">
      <header className="page__topbar page__topbar--stack">
        <div>
          <h1 className="page-title heading-tight">Teachers</h1>
          <p className="page-subtitle">
            Manage and monitor teaching staff performance and details.
          </p>
        </div>
        <div className="page-actions">
          <button
            className="button button--primary"
            type="button"
            onClick={() => setIsAddTeacherOpen(true)}
          >
            <PlusIcon className="button__icon" />
            Add Teacher
          </button>
        </div>
      </header>

      <div className="stats-grid stats-grid--three">
        {summaryCards.map((card) => (
          <article className="stat-card stat-card--compact" key={card.title}>
            <p className="stat-card__label">{card.title}</p>
            <div className="stat-card__value">{card.value}</div>
            <p
              className={`stat-card__hint${card.tone ? ` stat-card__hint--${card.tone}` : ""}`}
            >
              {card.hint}
            </p>
          </article>
        ))}
      </div>

      <section className="panel">
        <div className="toolbar toolbar--tight">
          <label className="search-field search-field--medium">
            <SearchIcon className="search-field__icon" />
            <input
              type="text"
              placeholder="Search by name, email, subject, or ID"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <button className="icon-button" type="button" aria-label="Filter">
            <FilterIcon className="button__icon" />
          </button>
        </div>

        {pageError ? <p className="login-card__error">{pageError}</p> : null}

        {isLoading ? (
          <p className="page-subtitle">Loading teachers...</p>
        ) : filteredTeachers.length === 0 ? (
          <p className="page-subtitle">No teachers found.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Assigned Classes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>
                    <div className="person">
                      <div className="avatar avatar--photo">
                        {getInitials(teacher.fullName)}
                      </div>
                      <div>
                        <div className="person__name">{teacher.fullName}</div>
                        <div className="person__meta font-data">
                          ID: {teacher.teacherId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{teacher.email}</td>
                  <td>
                    {teacher.assignedClasses.length > 0 ? (
                      <details className="teacher-class-dropdown">
                        <summary className="teacher-class-dropdown__summary">
                          <span className="soft-badge soft-badge--wide teacher-class-dropdown__trigger">
                            {teacher.assignedClasses.length} assigned class
                            {teacher.assignedClasses.length === 1 ? "" : "es"}
                          </span>
                        </summary>
                        <div className="teacher-class-dropdown__menu">
                          {teacher.assignedClasses.map((item, index) => (
                            <span
                              className="soft-badge soft-badge--wide teacher-class-dropdown__item"
                              key={`${teacher.id}-${item.id}`}
                            >
                              {formatAssignedClassItem(teacher, index)}
                            </span>
                          ))}
                        </div>
                      </details>
                    ) : (
                      <span className="soft-badge soft-badge--wide">
                        No class assigned
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`status-dot status-dot--${teacher.status.toLowerCase().replace(" ", "-")}`}
                    >
                      {teacher.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="icon-button icon-button--ghost"
                        type="button"
                        aria-label="Edit"
                        onClick={() => setTeacherToEdit(teacher)}
                      >
                        <PencilIcon className="table-action-icon" />
                      </button>
                      <button
                        className="icon-button icon-button--ghost"
                        type="button"
                        aria-label="Delete"
                        onClick={() => setTeacherToDelete(teacher)}
                      >
                        <TrashIcon className="table-action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <TeacherAddModal
        isOpen={isAddTeacherOpen}
        isSubmitting={isAddSubmitting}
        lookups={lookups}
        onClose={() => setIsAddTeacherOpen(false)}
        onSubmit={handleCreateTeacher}
        onSubmitError={(message) =>
          setFeedback({
            title: "Add Teacher Failed",
            message,
            tone: "error",
          })
        }
      />
      <EditTeacherModal
        isOpen={teacherToEdit !== null}
        isSubmitting={isEditSubmitting}
        lookups={lookups}
        teacher={teacherToEdit}
        onClose={() => setTeacherToEdit(null)}
        onSubmit={handleEditTeacher}
        onSubmitError={(message) =>
          setFeedback({
            title: "Update Teacher Failed",
            message,
            tone: "error",
          })
        }
      />
      <ConfirmationDialog
        isOpen={teacherToDelete !== null}
        title="Delete Teacher"
        message={
          teacherToDelete
            ? `Are you sure you want to delete ${teacherToDelete.fullName}?`
            : ""
        }
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => setTeacherToDelete(null)}
        onConfirm={() => void handleDeleteTeacher()}
      />
      <StatusModal
        isOpen={feedback !== null}
        title={feedback?.title ?? ""}
        message={feedback?.message ?? ""}
        tone={feedback?.tone ?? "success"}
        onClose={() => setFeedback(null)}
      />
    </section>
  );
}

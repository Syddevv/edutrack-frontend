import { useEffect, useMemo, useState } from "react";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { LookupItemModal } from "../components/LookupItemModal";
import {
  PencilIcon,
  PlusIcon,
  RefreshIcon,
  SchoolIcon,
  SearchIcon,
  TrashIcon,
} from "../components/Icons";
import { StatusModal } from "../components/StatusModal";
import {
  createLookupItem,
  deleteLookupItem,
  getLookupManagementOverview,
  updateLookupItem,
  type LookupEntityType,
  type LookupManagementOverview,
} from "../subjectCourseManagement";

type ModalState =
  | {
      itemId?: number;
      type: LookupEntityType;
      value?: {
        code: string;
        name: string;
      };
      mode: "create" | "edit";
    }
  | null;

type DeleteState =
  | {
      id: number;
      label: string;
      type: LookupEntityType;
    }
  | null;

const LOOKUP_ITEMS_PER_PAGE = 10;

const emptyOverview: LookupManagementOverview = {
  subjects: [],
  courses: [],
  summary: {
    subjects: 0,
    courses: 0,
    classes: 0,
    students: 0,
  },
};

function formatDate(value: string | null) {
  if (!value) {
    return "Recently added";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export function SubjectCourseManagementPage() {
  const [overview, setOverview] = useState<LookupManagementOverview>(emptyOverview);
  const [activeType, setActiveType] = useState<LookupEntityType>("subjects");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageError, setPageError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    title: string;
    tone: "success" | "error";
  } | null>(null);

  useEffect(() => {
    void loadOverview();
  }, []);

  async function loadOverview() {
    setIsLoading(true);
    setPageError("");

    try {
      const response = await getLookupManagementOverview();
      setOverview(response);
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Failed to load subjects and courses.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const filteredSubjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return overview.subjects.filter((subject) =>
      [subject.name, subject.code].join(" ").toLowerCase().includes(query),
    );
  }, [overview.subjects, searchTerm]);

  const filteredCourses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return overview.courses.filter((course) =>
      [course.name, course.code].join(" ").toLowerCase().includes(query),
    );
  }, [overview.courses, searchTerm]);

  const visibleItems = activeType === "subjects" ? filteredSubjects : filteredCourses;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeType, searchTerm, filteredSubjects.length, filteredCourses.length]);

  const totalPages = Math.max(
    1,
    Math.ceil(visibleItems.length / LOOKUP_ITEMS_PER_PAGE),
  );

  const paginatedSubjects = useMemo(() => {
    const startIndex = (currentPage - 1) * LOOKUP_ITEMS_PER_PAGE;
    return filteredSubjects.slice(startIndex, startIndex + LOOKUP_ITEMS_PER_PAGE);
  }, [currentPage, filteredSubjects]);

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * LOOKUP_ITEMS_PER_PAGE;
    return filteredCourses.slice(startIndex, startIndex + LOOKUP_ITEMS_PER_PAGE);
  }, [currentPage, filteredCourses]);

  async function handleSave(input: { code: string; name: string }) {
    if (!modalState) {
      return;
    }

    setIsSaving(true);

    try {
      if (modalState.mode === "create") {
        await createLookupItem(modalState.type, input);
      } else if (modalState.itemId) {
        await updateLookupItem(modalState.type, modalState.itemId, input);
      }

      await loadOverview();
      setModalState(null);
      setFeedback({
        title: modalState.mode === "create" ? "Record Added" : "Record Updated",
        message: `${modalState.type === "subjects" ? "Subject" : "Course"} saved successfully.`,
        tone: "success",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteState) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteLookupItem(deleteState.type, deleteState.id);
      await loadOverview();
      setDeleteState(null);
      setFeedback({
        title: "Record Deleted",
        message: `${deleteState.label} was removed successfully.`,
        tone: "success",
      });
    } catch (error) {
      setFeedback({
        title: "Delete Failed",
        message:
          error instanceof Error ? error.message : "Unable to delete this record.",
        tone: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const summaryCards = [
    {
      title: "Total Subjects",
      value: String(overview.summary.subjects),
      hint: "Lookup records available for class assignments",
    },
    {
      title: "Total Courses",
      value: String(overview.summary.courses),
      hint: "Programs available across the system",
    },
    {
      title: "Active Classes",
      value: String(overview.summary.classes),
      hint: "Class records currently tied to course and subject data",
    },
    {
      title: "Enrolled Students",
      value: String(overview.summary.students),
      hint: "Student records assigned to courses",
    },
  ];

  return (
    <section className="page lookup-page">
      <header className="page__topbar page__topbar--stack">
        <div>
          <h1 className="page-title heading-tight">Subjects & Courses</h1>
          <p className="page-subtitle">
            Add, update, and remove academic lookup records used by classes, teachers,
            and students.
          </p>
        </div>
        <div className="page-actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={() =>
              setModalState({
                mode: "create",
                type: "subjects",
              })
            }
          >
            <PlusIcon className="button__icon" />
            Add Subject
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={() =>
              setModalState({
                mode: "create",
                type: "courses",
              })
            }
          >
            <PlusIcon className="button__icon" />
            Add Course
          </button>
        </div>
      </header>

      <div className="stats-grid stats-grid--four lookup-page__stats">
        {summaryCards.map((card) => (
          <article className="stat-card stat-card--compact" key={card.title}>
            <div className="stat-card__head">
              <div>
                <p className="stat-card__label">{card.title}</p>
                <div className="stat-card__value">{card.value}</div>
              </div>
              <div className="stat-card__icon-wrap">
                <SchoolIcon className="stat-card__icon" />
              </div>
            </div>
            <p className="stat-card__hint">{card.hint}</p>
          </article>
        ))}
      </div>

      <section className="panel lookup-page__panel">
        <div className="toolbar lookup-page__toolbar">
          <div className="lookup-tabs" role="tablist" aria-label="Lookup type">
            <button
              className={`lookup-tabs__item${activeType === "subjects" ? " lookup-tabs__item--active" : ""}`}
              type="button"
              role="tab"
              aria-selected={activeType === "subjects"}
              onClick={() => setActiveType("subjects")}
            >
              Subjects
              <span className="lookup-tabs__count">{overview.subjects.length}</span>
            </button>
            <button
              className={`lookup-tabs__item${activeType === "courses" ? " lookup-tabs__item--active" : ""}`}
              type="button"
              role="tab"
              aria-selected={activeType === "courses"}
              onClick={() => setActiveType("courses")}
            >
              Courses
              <span className="lookup-tabs__count">{overview.courses.length}</span>
            </button>
          </div>

          <div className="toolbar__actions">
            <label className="search-field search-field--medium">
              <SearchIcon className="search-field__icon" />
              <input
                type="text"
                placeholder={`Search ${activeType} by name or code`}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>
            <button
              className="icon-button"
              type="button"
              aria-label="Refresh lookup records"
              onClick={() => void loadOverview()}
            >
              <RefreshIcon className="button__icon" />
            </button>
          </div>
        </div>

        {pageError ? <p className="login-card__error lookup-page__error">{pageError}</p> : null}

        {isLoading ? (
          <p className="page-subtitle lookup-page__empty">Loading lookup records...</p>
        ) : visibleItems.length === 0 ? (
          <p className="page-subtitle lookup-page__empty">
            No {activeType === "subjects" ? "subjects" : "courses"} found.
          </p>
        ) : (
          <div className="lookup-page__table-scroll">
            {activeType === "subjects" ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject Name</th>
                    <th>Code</th>
                    <th>Used in Classes</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSubjects.map((subject) => (
                    <tr key={subject.id}>
                      <td>
                        <div className="table-stack">
                          <div className="person__name">{subject.name}</div>
                          <div className="person__meta">Academic subject record</div>
                        </div>
                      </td>
                      <td>
                        <span className="soft-badge font-data">
                          {subject.code || "No code"}
                        </span>
                      </td>
                      <td>
                        <span className="count-pill">{subject.classCount} class(es)</span>
                      </td>
                      <td>{formatDate(subject.createdAt)}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="icon-button icon-button--ghost"
                            type="button"
                            aria-label={`Edit ${subject.name}`}
                            onClick={() =>
                              setModalState({
                                itemId: subject.id,
                                mode: "edit",
                                type: "subjects",
                                value: {
                                  code: subject.code,
                                  name: subject.name,
                                },
                              })
                            }
                          >
                            <PencilIcon className="table-action-icon" />
                          </button>
                          <button
                            className="icon-button icon-button--ghost"
                            type="button"
                            aria-label={`Delete ${subject.name}`}
                            onClick={() =>
                              setDeleteState({
                                id: subject.id,
                                label: subject.name,
                                type: "subjects",
                              })
                            }
                          >
                            <TrashIcon className="table-action-icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course Name</th>
                    <th>Code</th>
                    <th>Students</th>
                    <th>Classes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCourses.map((course) => (
                    <tr key={course.id}>
                      <td>
                        <div className="table-stack">
                          <div className="person__name">{course.name}</div>
                          <div className="person__meta">Course lookup record</div>
                        </div>
                      </td>
                      <td>
                        <span className="soft-badge font-data">
                          {course.code || "No code"}
                        </span>
                      </td>
                      <td>
                        <span className="count-pill">{course.studentCount} student(s)</span>
                      </td>
                      <td>
                        <span className="count-pill">{course.classCount} class(es)</span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="icon-button icon-button--ghost"
                            type="button"
                            aria-label={`Edit ${course.name}`}
                            onClick={() =>
                              setModalState({
                                itemId: course.id,
                                mode: "edit",
                                type: "courses",
                                value: {
                                  code: course.code,
                                  name: course.name,
                                },
                              })
                            }
                          >
                            <PencilIcon className="table-action-icon" />
                          </button>
                          <button
                            className="icon-button icon-button--ghost"
                            type="button"
                            aria-label={`Delete ${course.name}`}
                            onClick={() =>
                              setDeleteState({
                                id: course.id,
                                label: course.name,
                                type: "courses",
                              })
                            }
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
          </div>
        )}
        {!isLoading && visibleItems.length > 0 ? (
          <div className="table-footer">
            <span>
              Showing {(currentPage - 1) * LOOKUP_ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * LOOKUP_ITEMS_PER_PAGE, visibleItems.length)} of{" "}
              {visibleItems.length}
            </span>
            <div className="pagination">
              <button
                className="button button--secondary button--small"
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="count-pill">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="button button--secondary button--small"
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <LookupItemModal
        isOpen={modalState !== null}
        isSubmitting={isSaving}
        itemLabel={modalState?.type === "courses" ? "Course" : "Subject"}
        mode={modalState?.mode ?? "create"}
        initialValue={modalState?.value ?? null}
        onClose={() => setModalState(null)}
        onSubmit={handleSave}
        onSubmitError={(message) =>
          setFeedback({
            title: "Save Failed",
            message,
            tone: "error",
          })
        }
      />

      <ConfirmationDialog
        isOpen={deleteState !== null}
        title={`Delete ${deleteState?.type === "courses" ? "Course" : "Subject"}`}
        message={
          deleteState
            ? `Are you sure you want to delete ${deleteState.label}?`
            : ""
        }
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        tone="danger"
        onCancel={() => setDeleteState(null)}
        onConfirm={() => void handleDelete()}
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

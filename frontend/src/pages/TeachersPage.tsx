import { useState } from "react";
import { TeacherAddModal } from "../components/TeacherAddModal";
import { EditTeacherModal, type EditTeacherData } from "../components/EditTeacherModal";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import {
  FilterIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "../components/Icons";

type SummaryCard = {
  title: string;
  value: string;
  hint: string;
  tone?: "success";
};

type TeacherRow = readonly [string, string, string, string, string];

const summaryCards = [
  {
    title: "Total Teachers",
    value: "42",
    hint: "+2 this month",
    tone: "success",
  },
  { title: "Active Now", value: "38", hint: "Currently on campus" },
  { title: "On Leave", value: "4", hint: "Requires substitute" },
] satisfies SummaryCard[];

const initialTeachers: ReadonlyArray<TeacherRow> = [
  ["Jane Doe", "TCH-001", "jane@school.edu", "BSIS - 1st Year - A", "Active"],
  [
    "John Williams",
    "TCH-002",
    "john@school.edu",
    "BSOM - 2nd Year - B",
    "Active",
  ],
  [
    "Sarah Connor",
    "TCH-003",
    "sarah@school.edu",
    "BSAIS - 3rd Year - A",
    "On Leave",
  ],
  ["Mike Ross", "TCH-004", "mike@school.edu", "ACT - 2nd Year - A", "Active"],
] as const;

export function TeachersPage() {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherRow | null>(null);
  const [teacherToEdit, setTeacherToEdit] = useState<EditTeacherData | null>(null);

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
            <input type="text" placeholder="Search by name, email, or ID" />
          </label>

          <button className="icon-button" type="button" aria-label="Filter">
            <FilterIcon className="button__icon" />
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Assigned Class</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher[1]}>
                <td>
                  <div className="person">
                    <div className="avatar avatar--photo">
                      {teacher[0]
                        .split(" ")
                        .map((name) => name[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="person__name">{teacher[0]}</div>
                      <div className="person__meta font-data">ID: {teacher[1]}</div>
                    </div>
                  </div>
                </td>
                <td>{teacher[2]}</td>
                <td>
                  <span className="soft-badge soft-badge--wide">{teacher[3]}</span>
                </td>
                <td>
                  <span
                    className={`status-dot status-dot--${teacher[4].toLowerCase().replace(" ", "-")}`}
                  >
                    {teacher[4]}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="icon-button icon-button--ghost"
                      type="button"
                      aria-label="Edit"
                      onClick={() =>
                        setTeacherToEdit({
                          assignedClass: teacher[3],
                          email: teacher[2],
                          id: teacher[1],
                          name: teacher[0],
                          status: teacher[4],
                        })
                      }
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
      </section>

      <TeacherAddModal
        isOpen={isAddTeacherOpen}
        onClose={() => setIsAddTeacherOpen(false)}
      />
      <EditTeacherModal
        isOpen={teacherToEdit !== null}
        teacher={teacherToEdit}
        onClose={() => setTeacherToEdit(null)}
      />
      <ConfirmationDialog
        isOpen={teacherToDelete !== null}
        title="Delete Teacher"
        message={
          teacherToDelete
            ? `Are you sure you want to delete ${teacherToDelete[0]}?`
            : ""
        }
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => setTeacherToDelete(null)}
        onConfirm={() => {
          if (teacherToDelete) {
            setTeachers((current) =>
              current.filter((teacher) => teacher[1] !== teacherToDelete[1]),
            );
          }
          setTeacherToDelete(null);
        }}
      />
    </section>
  );
}

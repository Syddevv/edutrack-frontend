import { useState } from 'react'
import { ConfirmationDialog } from '../components/ConfirmationDialog'
import {
  CheckCircleIcon,
  ClockIcon,
  DownloadIcon,
  FilterIcon,
  SearchIcon,
  UsersIcon,
  XCircleIcon,
} from '../components/Icons'

const overviewCards = [
  {
    icon: <UsersIcon className="stat-card__icon" />,
    title: 'Total Students',
    value: '1,240',
  },
  {
    icon: <CheckCircleIcon className="stat-card__icon" />,
    title: 'Present Today',
    value: '1,150',
    badge: { tone: 'success', label: '92%' },
  },
  {
    icon: <XCircleIcon className="stat-card__icon" />,
    title: 'Absent Today',
    value: '45',
    badge: { tone: 'danger', label: '+2%' },
  },
  {
    icon: <ClockIcon className="stat-card__icon" />,
    title: 'Late Today',
    value: '45',
    badge: { tone: 'neutral', label: '-5%' },
  },
]

const rows = [
  ['Alice Johnson', '#001', 'BSIS', '1st Year - A', 'Oct 24, 2023', 'Present', '08:00 AM'],
  ['Bob Smith', '#002', 'BSIS', '1st Year - A', 'Oct 24, 2023', 'Absent', '--:--'],
  ['Charlie Brown', '#003', 'BSOM', '2nd Year - B', 'Oct 24, 2023', 'Present', '08:00 AM'],
  ['David Lee', '#004', 'BSCA', '1st Year - A', 'Oct 24, 2023', 'Late', '08:45 AM'],
  ['Eva Green', '#005', 'BSAIS', '3rd Year - B', 'Oct 24, 2023', 'Present', '08:00 AM'],
  ['Frank Miller', '#006', 'ACT', '2nd Year - A', 'Oct 24, 2023', 'Present', '08:00 AM'],
] as const

export function DashboardPage() {
  const [isExportConfirmOpen, setIsExportConfirmOpen] = useState(false)

  return (
    <section className="page">
      <header className="page__topbar">
        <div>
          <h1 className="page-title heading-tight">Dashboard</h1>
        </div>
        <div className="page-date">October 24, 2023</div>
      </header>

      <div className="stats-grid stats-grid--four">
        {overviewCards.map((card) => (
          <article className="stat-card" key={card.title}>
            <div className="stat-card__head">
              <div className="stat-card__icon-wrap">{card.icon}</div>
              {card.badge ? (
                <span className={`pill pill--${card.badge.tone}`}>{card.badge.label}</span>
              ) : null}
            </div>
            <p className="stat-card__label">{card.title}</p>
            <div className="stat-card__value">{card.value}</div>
          </article>
        ))}
      </div>

      <section className="panel">
        <div className="toolbar">
          <label className="search-field">
            <SearchIcon className="search-field__icon" />
            <input type="text" placeholder="Search students by name or ID..." />
          </label>

          <div className="toolbar__actions">
            <button className="button button--secondary" type="button">
              <FilterIcon className="button__icon" />
              Filter
            </button>
            <button className="button button--primary" type="button" onClick={() => setIsExportConfirmOpen(true)}>
              <DownloadIcon className="button__icon" />
              Export CSV
            </button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>STUDENT NAME</th>
              <th>COURSE</th>
              <th>YEAR</th>
              <th>DATE</th>
              <th>STATUS</th>
              <th>TIME IN</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[1]}>
                <td>
                  <div>
                    <div className="person__name">{row[0]}</div>
                    <div className="person__meta font-data">ID: {row[1]}</div>
                  </div>
                </td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
                <td>{row[4]}</td>
                <td>
                  <span className={`status-chip status-chip--${row[5].toLowerCase()}`}>{row[5]}</span>
                </td>
                <td className="font-data">{row[6]}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="table-footer">
          <span>Showing 1 to 6 of 1,240 results</span>
          <div className="pagination">
            <button className="button button--secondary button--small" type="button">Previous</button>
            <button className="button button--secondary button--small" type="button">Next</button>
          </div>
        </div>
      </section>
      <ConfirmationDialog
        isOpen={isExportConfirmOpen}
        title="Export Attendance CSV"
        message="Export the current attendance overview as a CSV file?"
        confirmLabel="Export CSV"
        onCancel={() => setIsExportConfirmOpen(false)}
        onConfirm={() => setIsExportConfirmOpen(false)}
      />
    </section>
  )
}

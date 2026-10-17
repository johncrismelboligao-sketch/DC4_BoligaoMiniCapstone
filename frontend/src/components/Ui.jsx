import { ChevronLeft, ChevronRight } from 'lucide-react'

export function PageHeading({ eyebrow, title, subtitle, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{subtitle && <p className="page-subtitle">{subtitle}</p>}</div>{action && <div className="page-heading-action">{action}</div>}</div>
}

export function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{status?.replaceAll('_', ' ') || 'Unknown'}</span>
}

export function Pagination({ currentPage, lastPage, onPageChange }) {
  if (!lastPage || lastPage < 2) return null
  return <div className="pagination" aria-label="Pagination"><span>Page {currentPage} of {lastPage}</span><div className="pagination-controls"><button className="icon-button" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}><ChevronLeft size={16} /></button><button className="icon-button" aria-label="Next page" disabled={currentPage >= lastPage} onClick={() => onPageChange(currentPage + 1)}><ChevronRight size={16} /></button></div></div>
}

export function LoadingState({ label = 'Loading data...' }) {
  return <div className="inline-loading"><span className="loading-mark" />{label}</div>
}

export function ErrorBanner({ children, onRetry }) {
  return <div className="error-banner" role="alert"><span>{children}</span>{onRetry && <button className="text-button" onClick={onRetry}>Try again</button>}</div>
}

export function EmptyState({ title, detail }) {
  return <div className="empty-state"><span className="empty-kicker">Nothing on the touchline</span><strong>{title}</strong><span>{detail}</span></div>
}


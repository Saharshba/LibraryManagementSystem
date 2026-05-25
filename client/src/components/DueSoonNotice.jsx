export default function DueSoonNotice({ alerts, title = 'Due soon' }) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <aside className="due-toast" role="status" aria-live="polite">
      <div className="due-toast-head">
        <strong>{title}</strong>
        <span>{alerts.length} alert{alerts.length > 1 ? 's' : ''}</span>
      </div>
      <ul>
        {alerts.map((alert) => (
          <li key={`${alert.type}-${alert.message}`}>{alert.message}</li>
        ))}
      </ul>
    </aside>
  );
}
export default function BookAssignModal({ book, users, values, setValues, onClose, onSubmit, busy }) {
  if (!book) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="assign-book-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Assign book</p>
            <h2 id="assign-book-title">{book.title}</h2>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="stack-form" onSubmit={onSubmit}>
          <label>
            User
            <select value={values.userId} onChange={(event) => setValues((current) => ({ ...current, userId: event.target.value }))} required>
              <option value="">Choose a user</option>
              {users.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.fullName} ({member.username})
                </option>
              ))}
            </select>
          </label>
          <label>
              Assignment date
              <input type="date" value={values.assignmentDate} onChange={(event) => setValues((current) => ({ ...current, assignmentDate: event.target.value }))} required />
            </label>
            <label>
              Lending duration in days
              <input type="number" min="1" value={values.lendingDays} onChange={(event) => setValues((current) => ({ ...current, lendingDays: event.target.value }))} required />
          </label>
          <div className="row-actions modal-actions">
            <button className="primary-button" type="submit" disabled={busy}>
              {busy ? 'Saving...' : 'Save assignment'}
            </button>
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

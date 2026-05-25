import { useEffect, useState } from 'react';
import request from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/date';
import { collectDueAlerts } from '../../utils/dueAlerts';
import DueSoonNotice from '../../components/DueSoonNotice';
import AdminLayout from '../../components/AdminLayout';

const getDaysLeft = (dueDate) => {
  if (!dueDate) {
    return 'Unavailable';
  }

  const difference = new Date(dueDate).getTime() - Date.now();
  const daysLeft = Math.ceil(difference / (24 * 60 * 60 * 1000));

  if (daysLeft < 0) {
    return 'Overdue';
  }

  return `${daysLeft} days left`;
};

export default function AdminLentPage() {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');

  const dueAlerts = collectDueAlerts({ books });

  const loadBooks = async () => {
    try {
      const payload = await request('/books/lent', { token });
      setBooks(payload.books);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [token]);

  return (
    <AdminLayout title="Lent books" description="Review all currently assigned books and who each book was lent to.">
      <DueSoonNotice alerts={dueAlerts} title="Books due soon" />

      {error ? <div className="alert-box">{error}</div> : null}

      <section className="panel admin-single-column">
        <div className="panel-card wide-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>Lent to</th>
                  <th>Assigned on</th>
                  <th>Duration</th>
                  <th>Due date</th>
                  <th>Days left</th>
                </tr>
              </thead>
              <tbody>
                {books.length === 0 ? (
                  <tr>
                    <td colSpan={8}>No books are currently lent out.</td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr key={book._id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.genre?.name || 'Unassigned'}</td>
                      <td>{book.assignedTo ? `${book.assignedTo.fullName || book.assignedTo.username} (${book.assignedTo.username})` : 'Unassigned'}</td>
                      <td>{formatDate(book.assignmentDate)}</td>
                      <td>{book.lendingDays || 0} days</td>
                      <td>{formatDate(book.dueDate)}</td>
                      <td>{getDaysLeft(book.dueDate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}

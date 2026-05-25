import { useEffect, useMemo, useState } from 'react';
import request from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/date';
import { collectDueAlerts } from '../../utils/dueAlerts';
import DueSoonNotice from '../../components/DueSoonNotice';
import AdminLayout from '../../components/AdminLayout';
import BookAssignModal from '../../components/BookAssignModal';

const emptyBookForm = { title: '', author: '', genre: '' };
const emptyAssignment = { userId: '', assignmentDate: '', lendingDays: '' };

export default function AdminBooksPage() {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [bookForm, setBookForm] = useState(emptyBookForm);
  const [editingBookId, setEditingBookId] = useState('');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [assigningBook, setAssigningBook] = useState(null);
  const [assignment, setAssignment] = useState(emptyAssignment);
  const [assignBusy, setAssignBusy] = useState(false);

  const loadData = async () => {
    setError('');
    try {
      const [booksPayload, genresPayload, usersPayload] = await Promise.all([
        request('/books', { token }),
        request('/genres', { token }),
        request('/users', { token }),
      ]);

      setBooks(booksPayload.books);
      setGenres(genresPayload.genres);
      setUsers(usersPayload.users);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const editBook = (book) => {
    setEditingBookId(book._id);
    setBookForm({
      title: book.title,
      author: book.author,
      genre: book.genre?._id || '',
    });
  };

  const visibleBooks = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    return [...books]
      .filter((book) => !text || book.title.toLowerCase().includes(text) || book.author.toLowerCase().includes(text))
      .sort((left, right) => {
        if (sortBy === 'genre') {
          const leftGenre = left.genre?.name ?? '';
          const rightGenre = right.genre?.name ?? '';
          return leftGenre.localeCompare(rightGenre) || left.title.localeCompare(right.title);
        }

        if (sortBy === 'author') {
          return left.author.localeCompare(right.author) || left.title.localeCompare(right.title);
        }

        return left.title.localeCompare(right.title);
      });
  }, [books, searchText, sortBy]);

  const dueAlerts = useMemo(() => collectDueAlerts({ books }), [books]);

  const resetBookForm = () => {
    setBookForm(emptyBookForm);
    setEditingBookId('');
  };

  const saveBook = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (!bookForm.genre) {
        throw new Error('Select a genre before saving the book');
      }

      const payload = {
        title: bookForm.title.trim(),
        author: bookForm.author.trim(),
        genre: bookForm.genre,
      };

      if (editingBookId) {
        await request(`/books/${editingBookId}`, { method: 'PUT', body: payload, token });
      } else {
        await request('/books', { method: 'POST', body: payload, token });
      }

      resetBookForm();
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  const deleteBook = async (bookId) => {
    if (!window.confirm('Delete this book?')) {
      return;
    }

    try {
      await request(`/books/${bookId}`, { method: 'DELETE', token });
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const openAssignModal = (book) => {
    setAssigningBook(book);
    setAssignment({
      userId: book.assignedTo?._id || '',
      assignmentDate: book.assignmentDate ? book.assignmentDate.slice(0, 10) : '',
      lendingDays: book.lendingDays ? book.lendingDays.toString() : '',
    });
  };

  const closeAssignModal = () => {
    setAssigningBook(null);
    setAssignment(emptyAssignment);
  };

  const assignBook = async (event) => {
    event.preventDefault();
    if (!assigningBook) {
      return;
    }

    setAssignBusy(true);
    setError('');

    try {
      await request(`/books/${assigningBook._id}/assign`, {
        method: 'PATCH',
        body: assignment,
        token,
      });
      closeAssignModal();
      await loadData();
    } catch (assignError) {
      setError(assignError.message);
    } finally {
      setAssignBusy(false);
    }
  };

  const unassignBook = async (bookId) => {
    try {
      await request(`/books/${bookId}/unassign`, { method: 'PATCH', token });
      await loadData();
    } catch (unassignError) {
      setError(unassignError.message);
    }
  };

  return (
    <AdminLayout title="Book management" description="Add, edit, remove, and assign books from a dedicated page.">
      <DueSoonNotice alerts={dueAlerts} title="Books due soon" />

      {error ? <div className="alert-box">{error}</div> : null}

      <section className="panel admin-grid books-grid">
        <div className="panel-card">
          <p className="eyebrow">Book editor</p>
          <h2>{editingBookId ? 'Update book' : 'Add a book'}</h2>
          <form className="stack-form" onSubmit={saveBook}>
            <label>
              Title
              <input value={bookForm.title} onChange={(event) => setBookForm((current) => ({ ...current, title: event.target.value }))} required />
            </label>
            <label>
              Author
              <input value={bookForm.author} onChange={(event) => setBookForm((current) => ({ ...current, author: event.target.value }))} required />
            </label>
            <label>
              Genre
              <select value={bookForm.genre} onChange={(event) => setBookForm((current) => ({ ...current, genre: event.target.value }))} required>
                <option value="">Choose a genre</option>
                {genres.map((genre) => (
                  <option key={genre._id} value={genre._id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="row-actions">
              <button className="primary-button" type="submit">
                {editingBookId ? 'Save changes' : 'Add book'}
              </button>
              <button className="secondary-button" type="button" onClick={resetBookForm}>
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="panel-card wide-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Book list</p>
              <h2>Available inventory</h2>
            </div>
            <div className="mini-toolbar">
              <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search books" />
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="genre">Genre</option>
              </select>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>Status</th>
                  <th>Due date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleBooks.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No books match the current filters.</td>
                  </tr>
                ) : (
                  visibleBooks.map((book) => (
                    <tr key={book._id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.genre?.name || 'Unassigned'}</td>
                      <td>{book.assignedTo ? `Assigned to ${book.assignedTo.fullName || book.assignedTo.username}` : 'Available'}</td>
                      <td>{formatDate(book.dueDate)}</td>
                      <td>
                        <div className="row-actions">
                          <button type="button" onClick={() => editBook(book)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => openAssignModal(book)}>
                            Assign
                          </button>
                          <button type="button" onClick={() => unassignBook(book._id)}>
                            Unassign
                          </button>
                          <button type="button" onClick={() => deleteBook(book._id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <BookAssignModal
        book={assigningBook}
        users={users}
        values={assignment}
        setValues={setAssignment}
        onClose={closeAssignModal}
        onSubmit={assignBook}
        busy={assignBusy}
      />
    </AdminLayout>
  );
}

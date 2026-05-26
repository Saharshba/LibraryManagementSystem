import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/date';
import { collectDueAlerts } from '../utils/dueAlerts';
import DueSoonNotice from '../components/DueSoonNotice';
import { isActiveUserRequest } from '../utils/requestExpiry';

const emptyRequestState = {
  requests: [],
  busyBookId: '',
};

export default function UserBooksPage() {
  const { token, logout, user } = useAuth();
  const [books, setBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchMode, setSearchMode] = useState('all');
  const [genreFilter, setGenreFilter] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [error, setError] = useState('');
  const [requests, setRequests] = useState(emptyRequestState.requests);
  const [busyBookId, setBusyBookId] = useState(emptyRequestState.busyBookId);

  useEffect(() => {
    const load = async () => {
      try {
        const [booksPayload, genresPayload, myBooksPayload, requestsPayload] = await Promise.all([
          request('/books', { token }),
          request('/genres', { token }),
          request('/books/me', { token }),
          request('/book-requests/me', { token }),
        ]);

        setBooks(booksPayload.books);
        setGenres(genresPayload.genres);
        setMyBooks(myBooksPayload.books);
        setRequests(requestsPayload.requests);
      } catch (loadError) {
        setError(loadError.message);
      }
    };

    load();
  }, [token]);

  const visibleBooks = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    return [...books]
      .filter((book) => {
        const matchesGenre = !genreFilter || book.genre?._id === genreFilter;
        const matchesText = !text
          || (searchMode === 'author'
            ? book.author.toLowerCase().includes(text)
            : searchMode === 'book'
              ? book.title.toLowerCase().includes(text)
              : book.title.toLowerCase().includes(text) || book.author.toLowerCase().includes(text));

        return matchesGenre && matchesText;
      })
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
  }, [books, genreFilter, searchMode, searchText, sortBy]);

  const dueAlerts = useMemo(
    () => collectDueAlerts({ books: myBooks, memberships: user ? [user] : [] }),
    [myBooks, user]
  );

  const activeRequests = useMemo(() => requests.filter(isActiveUserRequest), [requests]);

  const requestMap = useMemo(() => {
    const map = new Map();
    activeRequests.forEach((entry) => {
      map.set(entry.book?._id, entry);
    });
    return map;
  }, [activeRequests]);

  const requestBook = async (bookId) => {
    setBusyBookId(bookId);
    setError('');

    try {
      await request(`/book-requests/${bookId}`, {
        method: 'POST',
        token,
      });

      const payload = await request('/book-requests/me', { token });
      setRequests(payload.requests);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyBookId('');
    }
  };

  const displayName = user?.fullName || user?.username || 'User';

  return (
    <main className="workspace-shell user-shell">
      <section className="workspace-header panel user-header">
        <div className="user-header-copy">
          <div className="brand-lockup">
            <img src="/logo.png" alt="Bhaskar Books Corner" className="brand-logo" />
            <p className="eyebrow brand-title">Bhaskar Books Corner</p>
          </div>
          <p className="user-session-meta">
            Logged in as <strong>{displayName}</strong>
          </p>
        </div>
        <button className="ghost-button" type="button" onClick={logout}>
          Logout
        </button>
      </section>

      <DueSoonNotice alerts={dueAlerts} title="Upcoming dues" />

      {error ? <div className="alert-box">{error}</div> : null}

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Library catalog</p>
            <h2>All books</h2>
          </div>
        </div>

        <div className="filter-grid">
          <label>
            Search
            <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Title or author" />
          </label>
          <label>
            Search type
            <select value={searchMode} onChange={(event) => setSearchMode(event.target.value)}>
              <option value="all">Title and author</option>
              <option value="book">Book title only</option>
              <option value="author">Author only</option>
            </select>
          </label>
          <label>
            Genre filter
            <select value={genreFilter} onChange={(event) => setGenreFilter(event.target.value)}>
              <option value="">All genres</option>
              {genres.map((genre) => (
                <option key={genre._id} value={genre._id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sort by
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="genre">Genre</option>
            </select>
          </label>
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
                <th>Request</th>
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
                    <td>{book.assignedTo ? 'Not available' : 'Available'}</td>
                    <td>{formatDate(book.dueDate)}</td>
                    <td>
                      {requestMap.get(book._id) ? (
                        <span className="mini-badge request-status">{requestMap.get(book._id).status}</span>
                      ) : (
                        <button type="button" className="secondary-button" onClick={() => requestBook(book._id)} disabled={busyBookId === book._id}>
                          {busyBookId === book._id ? 'Requesting...' : 'Request book'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">My requests</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2>Requested books</h2>
          <Link to="/requests" className="ghost-button">View all requests</Link>
        </div>
        <div className="table-wrap compact-table">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Status</th>
                <th>Requested at</th>
                <th>Admin note</th>
              </tr>
            </thead>
            <tbody>
              {activeRequests.length === 0 ? (
                <tr>
                  <td colSpan={4}>You have not requested any books yet.</td>
                </tr>
              ) : (
                activeRequests.map((entry) => (
                  <tr key={entry._id}>
                    <td>{entry.book?.title}</td>
                    <td>{entry.status}</td>
                    <td>{formatDate(entry.requestedAt)}</td>
                    <td>{entry.adminNote || 'No note yet'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">My loans</p>
        <h2>Books assigned to me</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>Due date</th>
              </tr>
            </thead>
            <tbody>
              {myBooks.length === 0 ? (
                <tr>
                  <td colSpan={4}>You do not have any assigned books yet.</td>
                </tr>
              ) : (
                myBooks.map((book) => (
                  <tr key={book._id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.genre?.name || 'Unassigned'}</td>
                    <td>{formatDate(book.dueDate)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Membership</p>
        <h2>Your subscription details</h2>
        <div className="membership-summary">
          <article className="user-card">
            <strong>Next due date</strong>
            <span>{formatDate(user?.membership?.nextDueDate)}</span>
          </article>
          <article className="user-card">
            <strong>Membership fee</strong>
            <span>{user?.membership?.membershipFee ?? 0}</span>
          </article>
        </div>

        <div className="table-wrap compact-table">
          <table>
            <thead>
              <tr>
                <th>Paid on</th>
                <th>Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {(user?.membership?.paymentHistory || []).length === 0 ? (
                <tr>
                  <td colSpan={3}>No payment history yet.</td>
                </tr>
              ) : (
                user.membership.paymentHistory.map((payment, index) => (
                  <tr key={`${payment.paidOn}-${index}`}>
                    <td>{formatDate(payment.paidOn)}</td>
                    <td>{payment.amount}</td>
                    <td>{payment.note || 'Membership payment recorded by admin'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

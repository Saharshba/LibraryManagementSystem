import { useEffect, useMemo, useState } from 'react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';

const emptyBookForm = { title: '', author: '', genre: '' };
const emptyAssignment = { bookId: '', userId: '', dueDate: '' };
const emptyUserForm = { username: '', password: '' };

const formatDate = (value) => {
  if (!value) {
    return 'Unavailable';
  }

  return new Date(value).toLocaleDateString();
};

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [users, setUsers] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [lentBooks, setLentBooks] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [bookForm, setBookForm] = useState(emptyBookForm);
  const [editingBookId, setEditingBookId] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [assignment, setAssignment] = useState(emptyAssignment);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [searchText, setSearchText] = useState('');
  const [searchMode, setSearchMode] = useState('all');
  const [genreFilter, setGenreFilter] = useState('');
  const [sortBy, setSortBy] = useState('title');

  const isAdmin = user?.role === 'admin';

  const loadData = async () => {
    setError('');
    setBusy(true);

    try {
      const [booksPayload, genresPayload, myBooksPayload, lentBooksPayload, usersPayload] = await Promise.all([
        request('/books', { token }),
        request('/genres', { token }),
        request('/books/me', { token }),
        isAdmin ? request('/books/lent', { token }) : Promise.resolve({ books: [] }),
        isAdmin ? request('/users', { token }) : Promise.resolve({ users: [] }),
      ]);

      setBooks(booksPayload.books);
      setGenres(genresPayload.genres);
      setMyBooks(myBooksPayload.books);
      setLentBooks(lentBooksPayload.books);
      setUsers(usersPayload.users);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, isAdmin]);

  const visibleBooks = useMemo(() => {
    const text = searchText.trim().toLowerCase();

    let filtered = books.filter((book) => {
      const matchesGenre = !genreFilter || book.genre?._id === genreFilter;
      const matchesText = !text
        || (searchMode === 'author'
          ? book.author.toLowerCase().includes(text)
          : searchMode === 'book'
            ? book.title.toLowerCase().includes(text)
            : book.title.toLowerCase().includes(text) || book.author.toLowerCase().includes(text));

      return matchesGenre && matchesText;
    });

    filtered = [...filtered].sort((left, right) => {
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

    return filtered;
  }, [books, genreFilter, searchMode, searchText, sortBy]);

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

  const editBook = (book) => {
    setEditingBookId(book._id);
    setBookForm({
      title: book.title,
      author: book.author,
      genre: book.genre?._id || '',
    });
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

  const saveGenre = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await request('/genres', {
        method: 'POST',
        body: { name: newGenre.trim() },
        token,
      });
      setNewGenre('');
      await loadData();
    } catch (genreError) {
      setError(genreError.message);
    }
  };

  const createUser = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await request('/users', {
        method: 'POST',
        body: {
          username: userForm.username.trim(),
          password: userForm.password,
        },
        token,
      });
      setUserForm(emptyUserForm);
      await loadData();
    } catch (createError) {
      setError(createError.message);
    }
  };

  const assignBook = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await request(`/books/${assignment.bookId}/assign`, {
        method: 'PATCH',
        body: {
          userId: assignment.userId,
          dueDate: assignment.dueDate,
        },
        token,
      });
      setAssignment(emptyAssignment);
      await loadData();
    } catch (assignError) {
      setError(assignError.message);
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
    <main className="dashboard-shell">
      <header className="topbar panel topbar-panel">
        <div className="brand-lockup">
          <img src="/logo.png" alt="Bhaskar Books Corner" className="brand-logo" />
          <div>
            <p className="eyebrow">Bhaskar Books Corner</p>
            <h1>{user?.username}</h1>
            <p className="subtle-text">{isAdmin ? 'Administrator' : 'Library member'}</p>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </header>

      {error ? <div className="alert-box">{error}</div> : null}
      {busy ? <div className="loading-banner">Refreshing library data...</div> : null}

      <section className="panel hero-panel">
        <div className="hero-header">
          <div>
            <p className="eyebrow">Library catalog</p>
            <h2>Search, sort, and track books from one screen.</h2>
          </div>
          <div className="hero-pulse">
            <span />
            Live library status
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
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Book list</p>
            <h2>All books in the library</h2>
          </div>
          <button
            className="secondary-button"
            onClick={() => {
              setSearchText('');
              setSearchMode('all');
              setGenreFilter('');
              setSortBy('title');
            }}
            type="button"
          >
            Reset filters
          </button>
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
                {isAdmin ? <th>Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {visibleBooks.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5}>No books match the current filters.</td>
                </tr>
              ) : (
                visibleBooks.map((book) => (
                  <tr key={book._id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.genre?.name || 'Unassigned'}</td>
                    <td>{book.assignedTo ? `Assigned to ${book.assignedTo.username}` : 'Available'}</td>
                    <td>{formatDate(book.dueDate)}</td>
                    {isAdmin ? (
                      <td>
                        <div className="row-actions">
                          <button type="button" onClick={() => editBook(book)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => deleteBook(book._id)}>
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setAssignment({ bookId: book._id, userId: book.assignedTo?._id || '', dueDate: book.dueDate ? book.dueDate.slice(0, 10) : '' })}
                          >
                            Assign
                          </button>
                          <button type="button" onClick={() => unassignBook(book._id)}>
                            Unassign
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isAdmin ? (
        <section className="admin-grid">
          <section className="panel">
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
                <button className="secondary-button" onClick={resetBookForm} type="button">
                  Clear
                </button>
              </div>
            </form>
          </section>

          <section className="panel">
            <p className="eyebrow">Genre manager</p>
            <h2>Create genres</h2>
            <form className="stack-form" onSubmit={saveGenre}>
              <label>
                Genre name
                <input value={newGenre} onChange={(event) => setNewGenre(event.target.value)} placeholder="e.g. Science Fiction" required />
              </label>
              <button className="primary-button" type="submit">
                Add genre
              </button>
            </form>
            <div className="tag-list">
              {genres.map((genre) => (
                <span key={genre._id} className="tag-pill">
                  {genre.name}
                </span>
              ))}
            </div>
          </section>

            <section className="panel">
              <p className="eyebrow">User manager</p>
              <h2>Create library users</h2>
              <form className="stack-form" onSubmit={createUser}>
                <label>
                  Username
                  <input
                    value={userForm.username}
                    onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))}
                    placeholder="e.g. student01"
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="at least 6 characters"
                    required
                  />
                </label>
                <button className="primary-button" type="submit">
                  Create user
                </button>
              </form>
            </section>

          <section className="panel">
            <p className="eyebrow">Assignment board</p>
            <h2>Assign a book with a due date</h2>
            <form className="stack-form" onSubmit={assignBook}>
              <label>
                Book
                <select value={assignment.bookId} onChange={(event) => setAssignment((current) => ({ ...current, bookId: event.target.value }))} required>
                  <option value="">Choose a book</option>
                  {books.map((book) => (
                    <option key={book._id} value={book._id}>
                      {book.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                User
                <select value={assignment.userId} onChange={(event) => setAssignment((current) => ({ ...current, userId: event.target.value }))} required>
                  <option value="">Choose a user</option>
                  {users.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.username}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Due date
                <input type="date" value={assignment.dueDate} onChange={(event) => setAssignment((current) => ({ ...current, dueDate: event.target.value }))} required />
              </label>
              <button className="primary-button" type="submit">
                Save assignment
              </button>
            </form>
          </section>
        </section>
      ) : null}

      <section className="panel">
        <p className="eyebrow">Your books</p>
        <h2>{isAdmin ? 'All lent books' : 'Books assigned to you'}</h2>
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
              {(isAdmin ? lentBooks : myBooks).length === 0 ? (
                <tr>
                  <td colSpan={4}>No lent books found.</td>
                </tr>
              ) : (
                (isAdmin ? lentBooks : myBooks).map((book) => (
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

      {isAdmin ? (
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">User directory</p>
              <h2>Library members</h2>
            </div>
            <span className="mini-badge">{users.length} users</span>
          </div>
          <div className="user-grid">
            {users.length === 0 ? (
              <p className="empty-state">No users found.</p>
            ) : (
              users.map((member) => (
                <article key={member._id} className="user-card">
                  <strong>{member.username}</strong>
                  <span>Normal user</span>
                </article>
              ))
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}

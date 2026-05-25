import { useEffect, useState } from 'react';
import request from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';

export default function AdminGenresPage() {
  const { token } = useAuth();
  const [genres, setGenres] = useState([]);
  const [name, setName] = useState('');
  const [editingGenreId, setEditingGenreId] = useState('');
  const [error, setError] = useState('');

  const loadGenres = async () => {
    try {
      const payload = await request('/genres', { token });
      setGenres(payload.genres);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadGenres();
  }, [token]);

  const saveGenre = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const payload = { name: name.trim() };
      if (editingGenreId) {
        await request(`/genres/${editingGenreId}`, { method: 'PUT', body: payload, token });
      } else {
        await request('/genres', { method: 'POST', body: payload, token });
      }
      setName('');
      setEditingGenreId('');
      await loadGenres();
    } catch (genreError) {
      setError(genreError.message);
    }
  };

  const editGenre = (genre) => {
    setEditingGenreId(genre._id);
    setName(genre.name);
  };

  const deleteGenre = async (genreId) => {
    if (!window.confirm('Delete this genre?')) {
      return;
    }

    try {
      await request(`/genres/${genreId}`, { method: 'DELETE', token });
      await loadGenres();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <AdminLayout title="Genre management" description="Create, update, and delete genres from one dedicated page.">
      {error ? <div className="alert-box">{error}</div> : null}

      <section className="panel admin-single-column">
        <div className="panel-card">
          <p className="eyebrow">Genre editor</p>
          <h2>{editingGenreId ? 'Update genre' : 'Create genre'}</h2>
          <form className="stack-form" onSubmit={saveGenre}>
            <label>
              Genre name
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Science Fiction" required />
            </label>
            <div className="row-actions">
              <button className="primary-button" type="submit">
                {editingGenreId ? 'Save changes' : 'Add genre'}
              </button>
              <button className="secondary-button" type="button" onClick={() => { setName(''); setEditingGenreId(''); }}>
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="panel-card">
          <p className="eyebrow">Current genres</p>
          <div className="tag-list stacked">
            {genres.map((genre) => (
              <div key={genre._id} className="genre-chip">
                <span>{genre.name}</span>
                <div className="row-actions compact-actions">
                  <button type="button" onClick={() => editGenre(genre)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteGenre(genre._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}

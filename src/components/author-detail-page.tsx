'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { apiRequest } from '@/lib/api-client'

type Book = {
  id: string
  title: string
  description?: string | null
  genre?: string | null
  pages?: number | null
  publishedYear?: number | null
}

type Author = {
  id: string
  name: string
  email: string
  bio?: string | null
  nationality?: string | null
  birthYear?: number | null
  books: Book[]
  _count: {
    books: number
  }
}

type AuthorStats = {
  authorId: string
  authorName: string
  totalBooks: number
  firstBook: {
    title: string
    year: number | null
  } | null
  latestBook: {
    title: string
    year: number | null
  } | null
  averagePages: number | null
  genres: string[]
  longestBook: {
    title: string
    pages: number | null
  } | null
  shortestBook: {
    title: string
    pages: number | null
  } | null
}

const emptyBook = {
  title: '',
  description: '',
  isbn: '',
  publishedYear: '',
  genre: '',
  pages: '',
}

export default function AuthorDetailPage({ authorId }: { authorId: string }) {
  const [author, setAuthor] = useState<Author | null>(null)
  const [stats, setStats] = useState<AuthorStats | null>(null)
  const [authorForm, setAuthorForm] = useState({
    name: '',
    email: '',
    bio: '',
    nationality: '',
    birthYear: '',
  })
  const [bookForm, setBookForm] = useState(emptyBook)
  const [loading, setLoading] = useState(true)
  const [savingAuthor, setSavingAuthor] = useState(false)
  const [savingBook, setSavingBook] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadAuthorData()
  }, [authorId])

  async function loadAuthorData() {
    try {
      setLoading(true)
      const [authorData, statsData] = await Promise.all([
        apiRequest<Author>(`/api/authors/${authorId}`),
        apiRequest<AuthorStats>(`/api/authors/${authorId}/stats`),
      ])
      setAuthor(authorData)
      setStats(statsData)
      setAuthorForm({
        name: authorData.name ?? '',
        email: authorData.email ?? '',
        bio: authorData.bio ?? '',
        nationality: authorData.nationality ?? '',
        birthYear: authorData.birthYear ? String(authorData.birthYear) : '',
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cargar el autor')
    } finally {
      setLoading(false)
    }
  }

  async function updateAuthor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setSavingAuthor(true)
      await apiRequest(`/api/authors/${authorId}`, {
        method: 'PUT',
        body: JSON.stringify(authorForm),
      })
      setMessage('Autor actualizado correctamente')
      await loadAuthorData()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo actualizar el autor')
    } finally {
      setSavingAuthor(false)
    }
  }

  async function addBook(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setSavingBook(true)
      await apiRequest('/api/books', {
        method: 'POST',
        body: JSON.stringify({
          ...bookForm,
          authorId,
        }),
      })
      setBookForm(emptyBook)
      setMessage('Libro agregado correctamente')
      await loadAuthorData()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo agregar el libro')
    } finally {
      setSavingBook(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-300">Cargando información del autor...</p>
  }

  if (!author || !stats) {
    return <p className="text-sm text-slate-300">No se encontró información para este autor.</p>
  }

  const totalPages = author.books.reduce((sum, book) => sum + (book.pages ?? 0), 0)

  return (
    <div className="space-y-8">
      <section className="hero hero-grid">
        <div className="space-y-4">
          <p className="eyebrow">Autor</p>
          <h1 className="hero-title text-4xl">{author.name}</h1>
          <p className="mt-2 text-slate-300">{author.email}</p>
          <div className="hero-actions">
            <Link className="btn-secondary" href="/">
              Dashboard
            </Link>
            <Link className="btn-secondary" href="/books">
              Catálogo
            </Link>
          </div>
        </div>
        <div className="hero-aside">
          <div className="metric-tile">
            <span className="metric-label">Ficha del autor</span>
            <strong className="metric-value">{stats.totalBooks} libro(s) publicados</strong>
            <p className="metric-copy">
              {author.nationality || 'Nacionalidad sin registrar'}
              {author.birthYear ? ` · nacido en ${author.birthYear}` : ''}
            </p>
          </div>
        </div>
      </section>

      {message ? <Notice message={message} /> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Libros publicados" value={stats.totalBooks} />
        <StatCard label="Promedio de páginas" value={stats.averagePages ?? 0} />
        <StatCard label="Géneros" value={stats.genres.length} />
        <StatCard label="Total de páginas" value={totalPages} />
      </section>

      <section className="dashboard-grid detail-grid">
        <article className="card card-sticky space-y-5">
          <div className="space-y-2">
            <p className="eyebrow">Perfil</p>
            <h2 className="section-title">Editar autor</h2>
          </div>

          <form className="space-y-4" onSubmit={updateAuthor}>
            <div className="form-grid">
            <Field
              label="Nombre"
              value={authorForm.name}
              onChange={(value) => setAuthorForm((current) => ({ ...current, name: value }))}
            />
            <Field
              label="Email"
              type="email"
              value={authorForm.email}
              onChange={(value) => setAuthorForm((current) => ({ ...current, email: value }))}
            />
            <Field
              label="Nacionalidad"
              value={authorForm.nationality}
              onChange={(value) => setAuthorForm((current) => ({ ...current, nationality: value }))}
            />
            <Field
              label="Año de nacimiento"
              type="number"
              value={authorForm.birthYear}
              onChange={(value) => setAuthorForm((current) => ({ ...current, birthYear: value }))}
            />
            </div>
            <label className="label">
              Bio
              <textarea
                className="textarea"
                rows={4}
                value={authorForm.bio}
                onChange={(event) =>
                  setAuthorForm((current) => ({ ...current, bio: event.target.value }))
                }
              />
            </label>
            <button className="btn-primary" disabled={savingAuthor} type="submit">
              {savingAuthor ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </article>

        <div className="space-y-6">
          <article className="card space-y-5">
            <div className="space-y-2">
              <p className="eyebrow">Estadísticas</p>
              <h2 className="section-title">Resumen del autor</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <StatDetail label="Primer libro" value={formatBookYear(stats.firstBook)} />
              <StatDetail label="Último libro" value={formatBookYear(stats.latestBook)} />
              <StatDetail label="Libro más largo" value={formatBookPages(stats.longestBook)} />
              <StatDetail label="Libro más corto" value={formatBookPages(stats.shortestBook)} />
            </div>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Géneros</p>
              <div className="flex flex-wrap gap-2">
                {stats.genres.length ? (
                  stats.genres.map((genre) => (
                    <span className="pill" key={genre}>
                      {genre}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-300">Sin géneros registrados</span>
                )}
              </div>
            </div>
          </article>

          <article className="card space-y-5">
            <div className="space-y-2">
              <p className="eyebrow">Agregar libro</p>
              <h2 className="section-title">Nuevo libro para {author.name}</h2>
            </div>
            <form className="space-y-4" onSubmit={addBook}>
              <Field
                label="Título"
                value={bookForm.title}
                onChange={(value) => setBookForm((current) => ({ ...current, title: value }))}
              />
              <label className="label">
                Descripción
                <textarea
                  className="textarea"
                  rows={4}
                  value={bookForm.description}
                  onChange={(event) =>
                    setBookForm((current) => ({ ...current, description: event.target.value }))
                  }
                />
              </label>
              <div className="form-grid">
                <Field
                  label="ISBN"
                  value={bookForm.isbn}
                  onChange={(value) => setBookForm((current) => ({ ...current, isbn: value }))}
                />
                <Field
                  label="Año"
                  type="number"
                  value={bookForm.publishedYear}
                  onChange={(value) =>
                    setBookForm((current) => ({ ...current, publishedYear: value }))
                  }
                />
                <Field
                  label="Género"
                  value={bookForm.genre}
                  onChange={(value) => setBookForm((current) => ({ ...current, genre: value }))}
                />
                <Field
                  label="Páginas"
                  type="number"
                  value={bookForm.pages}
                  onChange={(value) => setBookForm((current) => ({ ...current, pages: value }))}
                />
              </div>
              <button className="btn-primary" disabled={savingBook} type="submit">
                {savingBook ? 'Guardando...' : 'Agregar libro'}
              </button>
            </form>
          </article>
        </div>
      </section>

      <section className="card space-y-5">
        <div className="space-y-2">
          <p className="eyebrow">Bibliografía</p>
          <h2 className="section-title">Libros del autor</h2>
        </div>
        {author.books.length === 0 ? (
          <p className="text-sm text-slate-300">Este autor todavía no tiene libros registrados.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {author.books.map((book) => (
              <article className="panel space-y-3" key={book.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">{book.title}</h3>
                  {book.genre ? <span className="pill">{book.genre}</span> : null}
                </div>
                <p className="text-sm text-slate-300">
                  {book.publishedYear ? `${book.publishedYear}` : 'Sin año'}
                  {book.pages ? ` · ${book.pages} páginas` : ''}
                </p>
                {book.description ? (
                  <p className="text-sm leading-6 text-slate-300">{book.description}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Field({
  label,
  onChange,
  type = 'text',
  value,
}: {
  label: string
  onChange: (value: string) => void
  type?: string
  value: string
}) {
  return (
    <label className="label">
      {label}
      <input
        className="input"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function Notice({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-amber-300/30 bg-amber-200/10 px-4 py-3 text-sm text-amber-100">
      {message}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="stat-card stat-emerald">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-300">{label}</p>
      <p className="text-4xl font-semibold text-white">{value}</p>
    </article>
  )
}

function StatDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-base text-white">{value}</p>
    </div>
  )
}

function formatBookYear(
  book: {
    title: string
    year: number | null
  } | null
) {
  if (!book) {
    return 'Sin datos'
  }

  return `${book.title} (${book.year ?? 's/a'})`
}

function formatBookPages(
  book: {
    title: string
    pages: number | null
  } | null
) {
  if (!book) {
    return 'Sin datos'
  }

  return `${book.title} (${book.pages ?? 0} páginas)`
}

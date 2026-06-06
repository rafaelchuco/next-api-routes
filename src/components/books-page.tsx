'use client'

import Link from 'next/link'
import { startTransition, useDeferredValue, useEffect, useState } from 'react'
import { apiRequest } from '@/lib/api-client'

type AuthorOption = {
  id: string
  name: string
  email: string
}

type Book = {
  id: string
  title: string
  description?: string | null
  isbn?: string | null
  publishedYear?: number | null
  genre?: string | null
  pages?: number | null
  authorId: string
  createdAt: string
  author: AuthorOption
}

type SearchResponse = {
  data: Book[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

const emptyBook = {
  title: '',
  description: '',
  isbn: '',
  publishedYear: '',
  genre: '',
  pages: '',
  authorId: '',
}

export default function BooksPage() {
  const [authors, setAuthors] = useState<AuthorOption[]>([])
  const [genres, setGenres] = useState<string[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  })
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState('desc')
  const [limit, setLimit] = useState(10)
  const [form, setForm] = useState(emptyBook)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const deferredSearch = useDeferredValue(search)

  useEffect(() => {
    loadOptions()
  }, [])

  useEffect(() => {
    loadBooks(1)
  }, [deferredSearch, genre, authorId, sortBy, order, limit])

  async function loadOptions() {
    try {
      const [authorsData, booksData] = await Promise.all([
        apiRequest<AuthorOption[]>('/api/authors'),
        apiRequest<Book[]>('/api/books'),
      ])

      setAuthors(authorsData)
      setGenres([
        ...new Set(
          booksData
            .map((book) => book.genre)
            .filter((value): value is string => Boolean(value))
        ),
      ].sort((a, b) => a.localeCompare(b)))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudieron cargar los filtros')
    }
  }

  async function loadBooks(nextPage = pagination.page) {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(limit),
        sortBy,
        order,
      })

      if (deferredSearch) params.set('search', deferredSearch)
      if (genre) params.set('genre', genre)
      if (authorId) params.set('authorName', authors.find((author) => author.id === authorId)?.name ?? '')

      const result = await apiRequest<SearchResponse>(`/api/books/search?${params.toString()}`)
      setBooks(result.data)
      setPagination(result.pagination)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudieron cargar los libros')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(field: string, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setSaving(true)
      setMessage('')
      if (editingId) {
        await apiRequest(`/api/books/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        })
        setMessage('Libro actualizado correctamente')
      } else {
        await apiRequest('/api/books', {
          method: 'POST',
          body: JSON.stringify(form),
        })
        setMessage('Libro creado correctamente')
      }

      setEditingId(null)
      setForm(emptyBook)
      await Promise.all([loadOptions(), loadBooks(editingId ? pagination.page : 1)])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar el libro')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(book: Book) {
    setEditingId(book.id)
    setForm({
      title: book.title ?? '',
      description: book.description ?? '',
      isbn: book.isbn ?? '',
      publishedYear: book.publishedYear ? String(book.publishedYear) : '',
      genre: book.genre ?? '',
      pages: book.pages ? String(book.pages) : '',
      authorId: book.authorId,
    })
    setMessage('')
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Deseas eliminar este libro?')) {
      return
    }

    try {
      await apiRequest(`/api/books/${id}`, { method: 'DELETE' })
      setMessage('Libro eliminado correctamente')
      if (editingId === id) {
        setEditingId(null)
        setForm(emptyBook)
      }
      await Promise.all([loadOptions(), loadBooks(pagination.page)])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo eliminar el libro')
    }
  }

  return (
    <div className="space-y-8">
      <section className="dashboard-grid">
        <article className="card card-sticky space-y-5">
          <div className="space-y-2">
            <p className="eyebrow">Catálogo</p>
            <h2 className="section-title">
              {editingId ? 'Editar libro' : 'Crear libro'}
            </h2>
          </div>

          {message ? <Notice message={message} /> : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Título" value={form.title} onChange={(value) => handleChange('title', value)} />
            <label className="label">
              Descripción
              <textarea
                className="textarea"
                rows={4}
                value={form.description}
                onChange={(event) => handleChange('description', event.target.value)}
              />
            </label>
            <div className="form-grid">
              <Field label="ISBN" value={form.isbn} onChange={(value) => handleChange('isbn', value)} />
              <Field
                label="Año de publicación"
                type="number"
                value={form.publishedYear}
                onChange={(value) => handleChange('publishedYear', value)}
              />
              <Field label="Género" value={form.genre} onChange={(value) => handleChange('genre', value)} />
              <Field
                label="Páginas"
                type="number"
                value={form.pages}
                onChange={(value) => handleChange('pages', value)}
              />
            </div>
            <label className="label">
              Autor
              <select
                className="input"
                value={form.authorId}
                onChange={(event) => handleChange('authorId', event.target.value)}
              >
                <option value="">Selecciona un autor</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="action-row">
              <button className="btn-primary" disabled={saving} type="submit">
                {saving ? 'Guardando...' : editingId ? 'Actualizar libro' : 'Crear libro'}
              </button>
              {editingId ? (
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setForm(emptyBook)
                  }}
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </article>

        <article className="card space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Búsqueda avanzada</p>
              <h2 className="section-title">Explorar libros</h2>
            </div>
            <Link className="btn-secondary" href="/">
              Volver al dashboard
            </Link>
          </div>

          <div className="toolbar-grid">
            <Field
              label="Buscar por título"
              value={search}
              onChange={(value) => {
                startTransition(() => {
                  setSearch(value)
                })
              }}
            />
            <label className="label">
              Género
              <select
                className="input"
                value={genre}
                onChange={(event) => {
                  startTransition(() => {
                    setGenre(event.target.value)
                  })
                }}
              >
                <option value="">Todos</option>
                {genres.map((genreOption) => (
                  <option key={genreOption} value={genreOption}>
                    {genreOption}
                  </option>
                ))}
              </select>
            </label>
            <label className="label">
              Autor
              <select
                className="input"
                value={authorId}
                onChange={(event) => {
                  startTransition(() => {
                    setAuthorId(event.target.value)
                  })
                }}
              >
                <option value="">Todos</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="label">
              Orden
              <select
                className="input"
                value={`${sortBy}:${order}`}
                onChange={(event) => {
                  const [nextSortBy, nextOrder] = event.target.value.split(':')
                  startTransition(() => {
                    setSortBy(nextSortBy)
                    setOrder(nextOrder)
                  })
                }}
              >
                <option value="createdAt:desc">Más recientes</option>
                <option value="title:asc">Título A-Z</option>
                <option value="title:desc">Título Z-A</option>
                <option value="publishedYear:desc">Año descendente</option>
                <option value="publishedYear:asc">Año ascendente</option>
              </select>
            </label>
          </div>

          <div className="results-toolbar">
            <label className="label max-w-[140px]">
              Resultados
              <select
                className="input"
                value={limit}
                onChange={(event) => {
                  startTransition(() => {
                    setLimit(Number(event.target.value))
                  })
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </label>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => {
                startTransition(() => {
                  setSearch('')
                  setGenre('')
                  setAuthorId('')
                  setSortBy('createdAt')
                  setOrder('desc')
                  setLimit(10)
                })
              }}
            >
              Limpiar filtros
            </button>
            <p className="text-sm text-slate-300">
              {loading ? 'Buscando...' : `${pagination.total} resultado(s) encontrados`}
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-slate-300">Cargando resultados...</p>
          ) : books.length === 0 ? (
            <p className="text-sm text-slate-300">No hay libros para los filtros seleccionados.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                {books.map((book) => (
                  <article className="panel space-y-4" key={book.id}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{book.title}</h3>
                          {book.genre ? <span className="pill">{book.genre}</span> : null}
                        </div>
                        <p className="text-sm text-slate-300">
                          {book.author.name}
                          {book.publishedYear ? ` · ${book.publishedYear}` : ''}
                          {book.pages ? ` · ${book.pages} páginas` : ''}
                        </p>
                        {book.description ? (
                          <p className="text-sm leading-6 text-slate-300">{book.description}</p>
                        ) : null}
                      </div>
                      <div className="action-row compact">
                        <button className="btn-secondary" onClick={() => startEdit(book)} type="button">
                          Editar
                        </button>
                        <button className="btn-danger" onClick={() => handleDelete(book.id)} type="button">
                          Eliminar
                        </button>
                        <Link className="btn-secondary" href={`/authors/${book.author.id}`}>
                          Ver autor
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="pagination-bar">
                <p className="text-sm text-slate-300">
                  Página {pagination.page} de {pagination.totalPages}
                </p>
                <div className="flex flex-1 justify-end gap-3 sm:flex-none">
                  <button
                    className="btn-secondary"
                    disabled={!pagination.hasPrev}
                    type="button"
                    onClick={() => loadBooks(pagination.page - 1)}
                  >
                    Anterior
                  </button>
                  <button
                    className="btn-secondary"
                    disabled={!pagination.hasNext}
                    type="button"
                    onClick={() => loadBooks(pagination.page + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </article>
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

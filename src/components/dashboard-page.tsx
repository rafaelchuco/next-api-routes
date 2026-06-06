'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { apiRequest } from '@/lib/api-client'

type Author = {
  id: string
  name: string
  email: string
  bio?: string | null
  nationality?: string | null
  birthYear?: number | null
  _count?: {
    books: number
  }
}

type Book = {
  id: string
  genre?: string | null
}

const emptyAuthor = {
  name: '',
  email: '',
  bio: '',
  nationality: '',
  birthYear: '',
}

export default function DashboardPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [form, setForm] = useState(emptyAuthor)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [authorsData, booksData] = await Promise.all([
        apiRequest<Author[]>('/api/authors'),
        apiRequest<Book[]>('/api/books'),
      ])
      setAuthors(authorsData)
      setBooks(booksData)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cargar el dashboard')
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
        await apiRequest(`/api/authors/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        })
        setMessage('Autor actualizado correctamente')
      } else {
        await apiRequest('/api/authors', {
          method: 'POST',
          body: JSON.stringify(form),
        })
        setMessage('Autor creado correctamente')
      }

      setForm(emptyAuthor)
      setEditingId(null)
      await loadData()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar el autor')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(author: Author) {
    setEditingId(author.id)
    setForm({
      name: author.name ?? '',
      email: author.email ?? '',
      bio: author.bio ?? '',
      nationality: author.nationality ?? '',
      birthYear: author.birthYear ? String(author.birthYear) : '',
    })
    setMessage('')
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Deseas eliminar este autor?')) {
      return
    }

    try {
      await apiRequest(`/api/authors/${id}`, { method: 'DELETE' })
      setMessage('Autor eliminado correctamente')
      if (editingId === id) {
        setEditingId(null)
        setForm(emptyAuthor)
      }
      await loadData()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo eliminar el autor')
    }
  }

  const totalAuthors = authors.length
  const totalBooks = books.length
  const authorsWithBooks = authors.filter((author) => (author._count?.books ?? 0) > 0).length
  const uniqueGenres = [...new Set(books.map((book) => book.genre).filter(Boolean))].length

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Autores" value={totalAuthors} tone="amber" />
        <StatCard label="Libros" value={totalBooks} tone="emerald" />
        <StatCard label="Autores con libros" value={authorsWithBooks} tone="cyan" />
        <StatCard label="Géneros únicos" value={uniqueGenres} tone="rose" />
      </section>

      <section className="dashboard-grid">
        <article className="card card-sticky space-y-5">
          <div className="space-y-2">
            <p className="eyebrow">Panel de autores</p>
            <h2 className="section-title">
              {editingId ? 'Editar autor' : 'Crear autor'}
            </h2>
          </div>

          {message ? <Notice message={message} /> : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="form-grid">
            <Field
              label="Nombre"
              value={form.name}
              onChange={(value) => handleChange('name', value)}
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => handleChange('email', value)}
            />
            <Field
              label="Nacionalidad"
              value={form.nationality}
              onChange={(value) => handleChange('nationality', value)}
            />
            <Field
              label="Año de nacimiento"
              type="number"
              value={form.birthYear}
              onChange={(value) => handleChange('birthYear', value)}
            />
            </div>
            <label className="label">
              Bio
              <textarea
                className="textarea"
                rows={4}
                value={form.bio}
                onChange={(event) => handleChange('bio', event.target.value)}
              />
            </label>
            <div className="action-row">
              <button className="btn-primary" disabled={saving} type="submit">
                {saving ? 'Guardando...' : editingId ? 'Actualizar autor' : 'Crear autor'}
              </button>
              {editingId ? (
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setForm(emptyAuthor)
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
              <p className="eyebrow">Biblioteca</p>
              <h2 className="section-title">Autores registrados</h2>
            </div>
            <Link className="btn-secondary" href="/books">
              Ir a libros
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-slate-300">Cargando autores...</p>
          ) : authors.length === 0 ? (
            <p className="text-sm text-slate-300">Todavía no hay autores registrados.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {authors.map((author) => (
                <article className="panel author-panel space-y-4" key={author.id}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{author.name}</h3>
                        <p className="text-sm text-slate-300">{author.email}</p>
                      </div>
                      <span className="pill">
                        {author._count?.books ?? 0} libro(s)
                      </span>
                    </div>
                    {author.nationality ? (
                      <p className="text-sm text-slate-400">{author.nationality}</p>
                    ) : null}
                    {author.bio ? (
                      <p className="text-sm leading-6 text-slate-300">{author.bio}</p>
                    ) : null}
                  </div>
                  <div className="action-row compact">
                    <button className="btn-secondary" onClick={() => startEdit(author)} type="button">
                      Editar
                    </button>
                    <button className="btn-danger" onClick={() => handleDelete(author.id)} type="button">
                      Eliminar
                    </button>
                    <Link className="btn-secondary" href={`/authors/${author.id}`}>
                      Ver libros
                    </Link>
                  </div>
                </article>
              ))}
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

function StatCard({
  label,
  tone,
  value,
}: {
  label: string
  tone: 'amber' | 'emerald' | 'cyan' | 'rose'
  value: number
}) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <p className="text-sm uppercase tracking-[0.2em] text-slate-300">{label}</p>
      <p className="text-4xl font-semibold text-white">{value}</p>
    </article>
  )
}

function Notice({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-amber-300/30 bg-amber-200/10 px-4 py-3 text-sm text-amber-100">
      {message}
    </div>
  )
}

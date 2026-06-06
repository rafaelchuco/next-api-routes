import Link from 'next/link'
import BooksPage from '@/components/books-page'

export default function BooksRoutePage() {
  return (
    <main className="shell page-stack">
      <section className="hero hero-grid">
        <div className="space-y-5">
          <p className="eyebrow">Catálogo avanzado</p>
          <h1 className="hero-title">Búsqueda, filtros y paginación para tus libros</h1>
          <p className="hero-copy">
            Crea libros, ajusta el orden, filtra por género o autor y revisa resultados paginados
            en tiempo real.
          </p>
          <div className="hero-actions">
            <Link className="btn-primary" href="/">
              Volver al dashboard
            </Link>
          </div>
        </div>
        <div className="hero-aside">
          <div className="metric-tile">
            <span className="metric-label">Modo catálogo</span>
            <strong className="metric-value">Exploración avanzada</strong>
            <p className="metric-copy">Filtros, ordenamiento y paginación diseñados para consultar la biblioteca sin perder contexto.</p>
          </div>
        </div>
      </section>
      <BooksPage />
    </main>
  )
}

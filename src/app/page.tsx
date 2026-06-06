import Link from 'next/link'
import DashboardPage from '@/components/dashboard-page'

export default function HomePage() {
  return (
    <main className="shell page-stack">
      <section className="hero hero-grid">
        <div className="space-y-5">
          <p className="eyebrow">Sistema de biblioteca</p>
          <h1 className="hero-title">Autores, libros y estadísticas en un solo panel</h1>
          <p className="hero-copy">
            Gestiona la biblioteca desde el dashboard, explora el catálogo con filtros avanzados y
            navega al detalle de cada autor usando las API Routes del App Router.
          </p>
          <div className="hero-actions">
            <Link className="btn-primary" href="/books">
              Explorar catálogo
            </Link>
            <a className="btn-secondary" href="#dashboard">
              Ir al panel
            </a>
          </div>
        </div>
        <div className="hero-aside">
          <div className="metric-tile">
            <span className="metric-label">Vista rápida</span>
            <strong className="metric-value">Dashboard operativo</strong>
            <p className="metric-copy">Autores, libros y estadísticas con un flujo pensado para escritorio y móvil.</p>
          </div>
          <div className="metric-row">
            <div className="mini-tile">
              <span className="mini-label">Rutas</span>
              <span className="mini-value">API + páginas</span>
            </div>
            <div className="mini-tile">
              <span className="mini-label">Búsqueda</span>
              <span className="mini-value">Paginada</span>
            </div>
          </div>
        </div>
      </section>
      <div id="dashboard">
        <DashboardPage />
      </div>
    </main>
  )
}

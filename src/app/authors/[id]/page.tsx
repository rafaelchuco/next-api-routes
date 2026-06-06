import AuthorDetailPage from '@/components/author-detail-page'

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <main className="shell page-stack">
      <AuthorDetailPage authorId={id} />
    </main>
  )
}

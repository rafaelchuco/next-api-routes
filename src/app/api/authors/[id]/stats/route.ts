import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const author = await prisma.author.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    })

    if (!author) {
      return NextResponse.json(
        { error: 'Autor no encontrado' },
        { status: 404 }
      )
    }

    const books = await prisma.book.findMany({
      where: { authorId: id },
      select: {
        title: true,
        publishedYear: true,
        pages: true,
        genre: true,
      },
    })

    const booksWithYear = books
      .filter((book) => book.publishedYear !== null)
      .sort((a, b) => (a.publishedYear ?? 0) - (b.publishedYear ?? 0))

    const booksWithPages = books
      .filter((book) => book.pages !== null)
      .sort((a, b) => (a.pages ?? 0) - (b.pages ?? 0))

    const genres = [...new Set(books.map((book) => book.genre).filter(Boolean))]
    const totalPages = booksWithPages.reduce((sum, book) => sum + (book.pages ?? 0), 0)
    const averagePages = booksWithPages.length
      ? Math.round(totalPages / booksWithPages.length)
      : null

    const firstBook = booksWithYear[0]
      ? {
          title: booksWithYear[0].title,
          year: booksWithYear[0].publishedYear,
        }
      : null

    const latestBook = booksWithYear[booksWithYear.length - 1]
      ? {
          title: booksWithYear[booksWithYear.length - 1].title,
          year: booksWithYear[booksWithYear.length - 1].publishedYear,
        }
      : null

    const shortestBook = booksWithPages[0]
      ? {
          title: booksWithPages[0].title,
          pages: booksWithPages[0].pages,
        }
      : null

    const longestBook = booksWithPages[booksWithPages.length - 1]
      ? {
          title: booksWithPages[booksWithPages.length - 1].title,
          pages: booksWithPages[booksWithPages.length - 1].pages,
        }
      : null

    return NextResponse.json({
      authorId: author.id,
      authorName: author.name,
      totalBooks: books.length,
      firstBook,
      latestBook,
      averagePages,
      genres,
      longestBook,
      shortestBook,
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas del autor' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SORT_FIELDS = ['title', 'publishedYear', 'createdAt'] as const
const SORT_ORDERS = ['asc', 'desc'] as const

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim() ?? ''
    const genre = searchParams.get('genre')?.trim() ?? ''
    const authorName = searchParams.get('authorName')?.trim() ?? ''
    const pageParam = parseInt(searchParams.get('page') ?? '1', 10)
    const limitParam = parseInt(searchParams.get('limit') ?? '10', 10)
    const sortByParam = searchParams.get('sortBy') ?? 'createdAt'
    const orderParam = searchParams.get('order') ?? 'desc'

    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
    const limit = Number.isNaN(limitParam)
      ? 10
      : Math.min(Math.max(limitParam, 1), 50)
    const sortBy = SORT_FIELDS.includes(sortByParam as (typeof SORT_FIELDS)[number])
      ? sortByParam
      : 'createdAt'
    const order = SORT_ORDERS.includes(orderParam as (typeof SORT_ORDERS)[number])
      ? orderParam
      : 'desc'

    const where = {
      ...(search && {
        title: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),
      ...(genre && { genre }),
      ...(authorName && {
        author: {
          name: {
            contains: authorName,
            mode: 'insensitive' as const,
          },
        },
      }),
    }

    const total = await prisma.book.count({ where })
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const safePage = Math.min(page, totalPages)

    const data = await prisma.book.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        [sortBy]: order,
      },
      skip: (safePage - 1) * limit,
      take: limit,
    })

    return NextResponse.json({
      data,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1,
      },
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Error al buscar libros' },
      { status: 500 }
    )
  }
}

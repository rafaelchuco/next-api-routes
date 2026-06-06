# Sistema de Biblioteca

Practica de API Routes con Next.js App Router, Prisma ORM 7 y PostgreSQL en
Supabase.

## Configuracion

1. En Supabase abre **Connect** y copia la cadena **Session pooler**.
2. Reemplaza `DATABASE_URL` en `.env` con esa cadena.
3. Aplica el esquema y genera Prisma Client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. Inicia el proyecto:

```bash
npm run dev
```

Visita [http://localhost:3000](http://localhost:3000).

## API Routes

| Metodo | Ruta | Accion |
| --- | --- | --- |
| GET, POST | `/api/authors` | Listar y crear autores |
| GET, PUT, DELETE | `/api/authors/:id` | Consultar, editar y eliminar un autor |
| GET, POST | `/api/books` | Listar y crear libros |
| GET, PUT, DELETE | `/api/books/:id` | Consultar, editar y eliminar un libro |

Ejemplo para crear un autor:

```bash
curl -X POST http://localhost:3000/api/authors \
  -H "Content-Type: application/json" \
  -d '{"name":"Mario Vargas Llosa","email":"mario@biblioteca.com"}'
```

Ejemplo para crear un libro:

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"La ciudad y los perros","isbn":"978-8420471839","authorId":1}'
```

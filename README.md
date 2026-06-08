# WordPress Developer Portfolio

A modern freelancer portfolio website built with Next.js App Router, TypeScript, Tailwind CSS, Motion, Prisma ORM, and PostgreSQL.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and add your PostgreSQL connection string:

```bash
cp .env.example .env
```

3. Generate Prisma Client and run the migration:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

4. Optional: seed starter projects, posts, and reviews:

```bash
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Database

The Prisma schema includes:

- `Project`
- `BlogPost`
- `Review`
- `ContactMessage`
- `Category`
- `Tag`

Public listing pages render starter fallback content if the database is not connected. Contact form submissions and admin create/edit/delete actions require a valid `DATABASE_URL`.

## Admin

Visit `/login` and sign in with the seeded admin account. Then visit `/admin` to add, edit, and delete projects, blog posts, reviews, and client users, and to view contact form submissions.

Default local admin credentials come from `.env`:

```env
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin12345"
AUTH_SECRET="change-this-to-a-long-random-secret"
```

Change these before production and run `npm run db:seed` again.

Clients can sign in at `/login` and access `/client`.

## Blog Editor and SEO

The admin blog form includes a Markdown-style editor with preview. Supported formatting:

```text
## Heading
### Smaller heading
**bold text**
_italic text_
- Bullet item
1. Numbered item
[Link text](https://example.com)
> Quote text
[youtube:https://www.youtube.com/watch?v=VIDEO_ID]
```

Blog SEO can be adjusted per post with `SEO Meta Title` and `SEO Meta Description` in `/admin`.

Blog display styling is controlled in:

- `components/blog-content.tsx`
- `components/blog-editor.tsx`
- `app/globals.css`

## Media Library

The admin dashboard includes a simple media library. Uploaded images are stored locally in:

```text
public/uploads
```

The image URL is saved in the `MediaAsset` database table. Use the shown URL, for example `/uploads/image-name.webp`, in `Featured Image URL` for projects and blog posts.

Important for deployment: Vercel's filesystem is not persistent for user uploads. For production, move uploads to Cloudinary, UploadThing, S3, or Supabase Storage.

## Deploy on Vercel with Neon or Supabase

1. Push this project to GitHub.
2. Create a free PostgreSQL database:
   - Neon: create a project, copy the pooled PostgreSQL connection string.
   - Supabase: create a project, copy the direct PostgreSQL connection string from database settings.
3. In Vercel, import the GitHub repository.
4. Add these environment variables in Vercel Project Settings:
   - `DATABASE_URL`: Copy the **Transaction Mode** (Pooled) connection string from Supabase (usually port 6543). **Append `?pgbouncer=true`** to the end of the URL.
   - `DIRECT_URL`: Copy the **Session Mode** (Direct) connection string from Supabase (usually port 5432).
   - `AUTH_SECRET`: A long random string for session encryption.
   - `ADMIN_EMAIL`: Your admin login email.
   - `ADMIN_PASSWORD`: Your admin login password.
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - `NEXT_PUBLIC_CONTACT_EMAIL`
5. Deploy once, then run the production migration from your local machine to set up the production database:

```bash
# Temporarily set DATABASE_URL to your PRODUCTION direct connection string (Port 5432)
# Windows (PowerShell):
$env:DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"; npx prisma migrate deploy; npm run db:seed

# Mac/Linux:
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres" npx prisma migrate deploy && npm run db:seed
```

6. Redeploy from Vercel if needed.

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run prisma:studio
```

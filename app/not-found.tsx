import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section text-center">
      <h1 className="text-4xl font-black text-ink">Page not found</h1>
      <p className="mt-3 text-slate-600">The page you are looking for does not exist.</p>
      <Link href="/" className="mt-6 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-bold text-white">Go Home</Link>
    </section>
  );
}

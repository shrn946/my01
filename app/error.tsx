"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="section text-center">
      <div className="section-container">
        <h1 className="text-4xl font-black text-ink">Something went wrong</h1>
        <p className="mt-3 text-slate-600">Try again or check the database connection.</p>
        <button onClick={reset} className="mt-6 rounded-md bg-ink px-4 py-2 text-sm font-bold text-white">Retry</button>
      </div>
    </section>
  );
}

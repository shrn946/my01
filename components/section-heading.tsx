export function SectionHeading({ eyebrow, title, text, align = "center" }: { eyebrow: string; title: string; text?: string; align?: "center" | "left" }) {
  return (
    <div className={`mb-16 max-w-4xl ${align === "center" ? "mx-auto text-center" : "text-left"}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-4 text-4xl font-black tracking-tight text-ink sm:text-5xl lg:text-6xl leading-[1.1]">
        {title}
      </h2>
      {text ? <p className="mt-6 text-lg leading-relaxed text-slate-500">{text}</p> : null}
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";

function youtubeId(value: string) {
  const trimmed = value.trim();
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtu\.be\/([^?]+)/
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return trimmed.length >= 8 ? trimmed : null;
}

function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-bold text-ink">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("_") && part.endsWith("_")) {
      return <em key={index} className="italic">{part.slice(1, -1)}</em>;
    }

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = link[2];
      const isInternal = href.startsWith("/");
      const className = "font-bold text-primary decoration-primary/30 underline decoration-2 underline-offset-4 transition-all hover:decoration-primary";
      return isInternal ? (
        <Link key={index} href={href} className={className}>{link[1]}</Link>
      ) : (
        <a key={index} href={href} target="_blank" rel="noreferrer" className={className}>{link[1]}</a>
      );
    }

    return part;
  });
}

export function BlogContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let orderedItems: string[] = [];

  function flushLists() {
    if (listItems.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="my-8 list-none space-y-4">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-4 text-lg leading-relaxed text-slate-600">
              <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
              </span>
              <span>{inline(item)}</span>
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }

    if (orderedItems.length) {
      blocks.push(
        <ol key={`ol-${blocks.length}`} className="my-8 list-none space-y-4">
          {orderedItems.map((item, i) => (
            <li key={i} className="flex gap-4 text-lg leading-relaxed text-slate-600">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {i + 1}
              </span>
              <span>{inline(item)}</span>
            </li>
          ))}
        </ol>
      );
      orderedItems = [];
    }
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushLists();
      return;
    }

    const video = trimmed.match(/^\[youtube:(.+)\]$/);
    if (video) {
      flushLists();
      const id = youtubeId(video[1]);
      if (id) {
        blocks.push(
          <div key={`video-${index}`} className="my-12 overflow-hidden rounded-[2rem] bg-ink shadow-premium">
            <iframe
              src={`https://www.youtube.com/embed/${id}`}
              title="YouTube video"
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        );
      }
      return;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      orderedItems = [];
      listItems.push(trimmed.slice(2));
      return;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      listItems = [];
      orderedItems.push(ordered[1]);
      return;
    }

    flushLists();

    if (trimmed.startsWith("# ")) {
      blocks.push(<h1 key={index} className="mb-8 mt-4 text-4xl font-black text-ink sm:text-5xl">{inline(trimmed.slice(2))}</h1>);
    } else if (trimmed.startsWith("### ")) {
      blocks.push(<h3 key={index} className="mb-4 mt-12 text-2xl font-black text-ink">{inline(trimmed.slice(4))}</h3>);
    } else if (trimmed.startsWith("## ")) {
      blocks.push(<h2 key={index} className="mb-6 mt-16 text-3xl font-black text-ink">{inline(trimmed.slice(3))}</h2>);
    } else if (trimmed.startsWith("> ")) {
      blocks.push(
        <blockquote key={index} className="my-10 relative rounded-[2rem] bg-slate-50 p-8 text-xl font-bold italic leading-relaxed text-ink shadow-soft">
          <span className="absolute -left-2 -top-4 text-8xl text-primary/20 leading-none">“</span>
          <div className="relative z-10">{inline(trimmed.slice(2))}</div>
        </blockquote>
      );
    } else {
      blocks.push(<p key={index} className="my-6 text-lg leading-relaxed text-slate-600">{inline(trimmed)}</p>);
    }
  });

  flushLists();

  return <div className="blog-content prose-headings:font-black prose-p:text-slate-600">{blocks}</div>;
}

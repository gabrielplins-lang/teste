import { useEffect, useRef, useState } from "react";
import type { CategoryDTO } from "@feijuca/shared";

/** Abas de categoria que grudam no topo e acompanham a rolagem do cardápio. */
export function CategoryTabs({ categories }: { categories: CategoryDTO[] }) {
  const [active, setActive] = useState(categories[0]?.slug);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = categories.map((c) => document.getElementById(`cat-${c.slug}`)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id.replace("cat-", ""));
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [categories]);

  useEffect(() => {
    barRef.current?.querySelector<HTMLElement>(`[data-slug="${active}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active]);

  const go = (slug: string) => {
    const el = document.getElementById(`cat-${slug}`);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 108, behavior: "smooth" });
  };

  return (
    <div className="cat-tabs" ref={barRef} role="tablist" aria-label="Categorias">
      {categories.map((c) => (
        <button key={c.slug} data-slug={c.slug} role="tab" aria-selected={active === c.slug}
          className={`cat-tabs__tab ${active === c.slug ? "is-active" : ""}`} onClick={() => go(c.slug)}>
          {c.name}
        </button>
      ))}
    </div>
  );
}

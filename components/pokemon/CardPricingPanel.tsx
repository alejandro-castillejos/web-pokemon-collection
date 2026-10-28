"use client";

import GlassPanel from "@/components/ui/GlassPanel";

interface CardPricingPanelProps {
  searchQuery: string;
}

const priceSources = [
  {
    name: "TCGplayer",
    description: "Mercado estadounidense",
    href: (query: string) =>
      `https://www.tcgplayer.com/search/all/product?q=${encodeURIComponent(query)}&productLineName=pokemon`,
    className: "hover:border-blue-300 hover:bg-blue-50/70",
  },
  {
    name: "Cardmarket",
    description: "Mercado europeo",
    href: (query: string) =>
      `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(query)}`,
    className: "hover:border-violet-300 hover:bg-violet-50/70",
  },
  {
    name: "eBay",
    description: "Publicaciones y ventas",
    href: (query: string) =>
      `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=183454&LH_Sold=1&LH_Complete=1`,
    className: "hover:border-yellow-300 hover:bg-yellow-50/70",
  },
];

export default function CardPricingPanel({ searchQuery }: CardPricingPanelProps) {
  return (
    <GlassPanel strong className="mt-6 rounded-[24px] p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-zinc-900">
        Busca precio de carta
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Consulta esta carta en una tienda o mercado externo.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {priceSources.map((source) => (
          <a
            key={source.name}
            href={source.href(searchQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex min-w-0 items-center justify-between gap-2 rounded-2xl border border-black/5 bg-white/65 px-3 py-3 transition ${source.className}`}
            aria-label={`Buscar ${searchQuery} en ${source.name}`}
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-zinc-900">{source.name}</span>
              <span className="mt-0.5 block text-xs text-zinc-500">{source.description}</span>
            </span>
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-zinc-700">
              <path d="M7 4H4.75A1.75 1.75 0 0 0 3 5.75v9.5A1.75 1.75 0 0 0 4.75 17h9.5A1.75 1.75 0 0 0 16 15.25V13M11 3h6v6M17 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        ))}
      </div>
    </GlassPanel>
  );
}

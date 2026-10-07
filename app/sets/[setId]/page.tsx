import Link from "next/link";
import GlassPanel from "@/components/ui/GlassPanel";
import SetDetailsPage from "@/components/pokemon/SetDetailsPage";
import { getSet } from "@/lib/tcgdex";

interface SetPageProps {
  params: Promise<{ setId: string }>;
}

export default async function SetPage({ params }: SetPageProps) {
  const { setId } = await params;
  const set = await getSet(setId);

  if (!set) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f5f7] px-6">
        <GlassPanel className="max-w-md rounded-[28px] p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Error</p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">Set no encontrado</h1>
          <p className="mt-3 text-sm text-zinc-500">El set que intentaste abrir no existe.</p>
          <Link href="/sets" className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800">
            Volver a sets
          </Link>
        </GlassPanel>
      </main>
    );
  }

  return <SetDetailsPage set={set} basePath="/sets" />;
}

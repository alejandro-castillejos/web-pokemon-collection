import { login, signup } from "./actions";
import GlassPanel from "@/components/ui/GlassPanel";
import Link from "next/link";

interface LoginPageProps {
  searchParams: Promise<{
    message?: string;
    error?: string;
    status?: string;
    reason?: string;
  }>;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;

  const message = params.message;
  const error = params.error;

  const contextualMessage =
    params.reason === "collection"
      ? "Inicia sesión para ver tu colección"
      : params.reason === "wishlist"
        ? "Inicia sesión para ver tu wishlist"
        : message;

  const contextualTitle =
    params.reason === "collection" ||
    params.reason === "wishlist"
      ? "Inicia sesión para continuar"
      : params.status === "logout"
        ? "Sesión cerrada"
        : "Cuenta creada";

  return (
    <main className="relative min-h-screen overflow-hidden text-[#111111]">
      <div className="soft-glow left-[-140px] top-[180px] h-72 w-72 bg-blue-300/20" />

      <div className="soft-glow right-[-120px] top-[300px] h-80 w-80 bg-yellow-200/30" />

      <div className="relative mx-auto min-h-screen max-w-[1400px] px-5 py-4 sm:px-8 lg:px-10">

        <section className="flex min-h-[calc(100vh-120px)] items-center justify-center py-12">
          <GlassPanel
            strong
            className="w-full max-w-md rounded-[32px] p-6 sm:p-8"
          >
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Pokémon TCG Collection
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-zinc-900">
                Iniciar sesión
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Accede a tu colección y a tu wishlist.
              </p>
            </div>

            {contextualMessage && (
              <div
                className={`mb-5 rounded-2xl px-4 py-4 text-sm ${
                  params.reason === "collection" ||
                  params.reason === "wishlist"
                    ? "border border-yellow-200 bg-yellow-50 text-yellow-900"
                    : "border border-emerald-200 bg-emerald-50 text-emerald-800"
                }`}
              >
                <p className="font-semibold">{contextualTitle}</p>

                <p className="mt-1 leading-6">
                  {contextualMessage}
                </p>
              </div>
            )}

            {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
                <p className="font-semibold">No se pudo completar la acción</p>

                <p className="mt-1 leading-6">
                {error}
                </p>
            </div>
            )}

            <form className="mt-8 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-zinc-700"
                >
                  Correo electrónico
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-2xl border border-black/5 bg-white/60 px-4 py-3.5 text-sm outline-none transition placeholder:text-zinc-400 focus:border-yellow-400 focus:bg-white/80"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-zinc-700"
                >
                  Contraseña
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-black/5 bg-white/60 px-4 py-3.5 text-sm outline-none transition placeholder:text-zinc-400 focus:border-yellow-400 focus:bg-white/80"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  formAction={login}
                  className="yellow-button rounded-full px-5 py-3.5 text-sm font-bold text-[#111111]"
                >
                  Iniciar sesión
                </button>

                <button
                  formAction={signup}
                  className="glass-hover glass rounded-full px-5 py-3.5 text-sm font-semibold text-zinc-800"
                >
                  Crear cuenta
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-black/5 pt-6 text-center">
              <Link
                href="/"
                className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
              >
                ← Volver al inicio
              </Link>
            </div>
          </GlassPanel>
        </section>
      </div>
    </main>
  );
}
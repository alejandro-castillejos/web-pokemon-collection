import Link from "next/link";
import { redirect } from "next/navigation";

import GlassPanel from "@/components/ui/GlassPanel";
import { createClient } from "@/lib/supabase/server";
import { changePassword, logout } from "./actions";

interface AccountPageProps {
  searchParams: Promise<{
    error?: string;
    passwordError?: string;
    passwordSuccess?: string;
  }>;
}

export default async function AccountPage({
  searchParams,
}: AccountPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-[#111111]">
      <div className="soft-glow left-[-140px] top-[180px] h-72 w-72 bg-blue-300/20" />
      <div className="soft-glow right-[-120px] top-[300px] h-80 w-80 bg-yellow-200/30" />

      <div className="relative mx-auto min-h-screen max-w-[1400px] px-5 py-4 sm:px-8 lg:px-10">
        <section className="mx-auto max-w-2xl pt-8 sm:pt-14">
          <div className="mb-8">
            <p className="text-sm font-medium text-zinc-500">
              Cuenta
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Tu cuenta
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Administra tu sesión y la información básica de tu cuenta.
            </p>
          </div>

          <GlassPanel
            strong
            className="rounded-[32px] p-6 sm:p-8"
          >
            {params.error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
                <p className="font-semibold">
                  No se pudo cerrar la sesión
                </p>
                <p className="mt-1 leading-6">
                  {params.error}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                Correo electrónico
              </p>

              <p className="mt-2 break-all text-base font-semibold text-zinc-900 sm:text-lg">
                {user.email}
              </p>
            </div>

            <div className="my-6 border-t border-black/5" />

            <section>
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Seguridad
                </p>

                <h2 className="mt-1 text-xl font-semibold text-zinc-900">
                  Cambiar contraseña
                </h2>

                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  Verifica tu contraseña actual antes de establecer una nueva.
                </p>
              </div>

              {params.passwordSuccess && (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                  {params.passwordSuccess}
                </div>
              )}

              {params.passwordError && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800">
                  {params.passwordError}
                </div>
              )}

              <form action={changePassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-semibold text-zinc-700"
                  >
                    Contraseña actual
                  </label>

                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-black/5 bg-white/60 px-4 py-3.5 text-sm outline-none transition placeholder:text-zinc-400 focus:border-yellow-400 focus:bg-white/80"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-semibold text-zinc-700"
                  >
                    Nueva contraseña
                  </label>

                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-black/5 bg-white/60 px-4 py-3.5 text-sm outline-none transition placeholder:text-zinc-400 focus:border-yellow-400 focus:bg-white/80"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-zinc-700"
                  >
                    Confirmar nueva contraseña
                  </label>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-black/5 bg-white/60 px-4 py-3.5 text-sm outline-none transition placeholder:text-zinc-400 focus:border-yellow-400 focus:bg-white/80"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="yellow-button w-full rounded-full px-5 py-3.5 text-sm font-bold text-[#111111]"
                >
                  Cambiar contraseña
                </button>
              </form>
            </section>

            <div className="my-6 border-t border-black/5" />

            <div className="flex flex-col gap-3 sm:flex-row">
              <form action={logout} className="flex-1">
                <button
                  type="submit"
                  className="glass-hover glass w-full rounded-full px-5 py-3.5 text-sm font-semibold text-zinc-800"
                >
                  Cerrar sesión
                </button>
              </form>

              <Link
                href="/"
                className="flex flex-1 items-center justify-center rounded-full px-5 py-3.5 text-sm font-medium text-zinc-500 transition hover:bg-black/5 hover:text-zinc-900"
              >
                Volver al inicio
              </Link>
            </div>
          </GlassPanel>
        </section>
      </div>
    </main>
  );
}

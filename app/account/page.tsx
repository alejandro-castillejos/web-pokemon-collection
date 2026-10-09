import Link from "next/link";
import { redirect } from "next/navigation";

import GlassPanel from "@/components/ui/GlassPanel";
import PasswordChangeForm from "@/components/account/PasswordChangeForm";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

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

            <div className="py-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                Correo electrónico
              </p>

              <p className="mt-2 break-all text-base font-semibold text-zinc-900 sm:text-lg">
                {user.email}
              </p>
            </div>

            <div className="my-6 border-t border-black/5" />

            <details open={Boolean(params.passwordSuccess || params.passwordError)} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between py-1 transition hover:text-zinc-700">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Seguridad
                  </p>

                  <h2 className="mt-1 text-base font-semibold text-zinc-900">
                    Cambiar contraseña
                  </h2>
                </div>

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                >
                  <path
                    d="m6 9 6 6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>

              <PasswordChangeForm />
            </details>

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

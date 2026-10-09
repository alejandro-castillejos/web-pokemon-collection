interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    status?: string;
    reason?: string;
  }>;
}

type Notice = {
  title: string;
  message: string;
  tone: "success" | "info";
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;

  const errorMessages: Record<string, string> = {
    callback_code_missing:
      "El enlace de confirmación no contiene un código válido. Vuelve a abrir el enlace de tu correo.",
    callback_failed:
      "No se pudo completar la confirmación de tu cuenta. Vuelve a intentarlo desde el enlace recibido.",
  };

  const initialError = params.error
    ? errorMessages[params.error] ??
      "No se pudo completar la autenticación. Vuelve a intentarlo."
    : undefined;

  let initialNotice: Notice | null = null;

  if (!initialError) {
    if (params.reason === "collection") {
      initialNotice = {
        title: "Inicia sesión para continuar",
        message: "Inicia sesión para ver tu colección.",
        tone: "info",
      };
    } else if (params.reason === "wishlist") {
      initialNotice = {
        title: "Inicia sesión para continuar",
        message: "Inicia sesión para ver tu wishlist.",
        tone: "info",
      };
    } else if (params.reason === "add-collection") {
      initialNotice = {
        title: "Inicia sesión para continuar",
        message: "Inicia sesión para agregar esta carta a tu colección.",
        tone: "info",
      };
    } else if (params.reason === "add-wishlist") {
      initialNotice = {
        title: "Inicia sesión para continuar",
        message: "Inicia sesión para agregar esta carta a tu wishlist.",
        tone: "info",
      };
    } else if (params.status === "logout") {
      initialNotice = {
        title: "Sesión cerrada",
        message: "Sesión cerrada correctamente.",
        tone: "success",
      };
    } else if (params.status === "signup") {
      initialNotice = {
        title: "Cuenta creada",
        message: "Revisa tu correo para confirmar tu cuenta.",
        tone: "success",
      };
    }
  }

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

            <LoginForm initialError={initialError} initialNotice={initialNotice} />

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
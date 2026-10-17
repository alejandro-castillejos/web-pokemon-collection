"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { login, signup } from "@/app/login/actions";

interface LoginFormProps {
  initialError?: string;
  initialNotice?: {
    title: string;
    message: string;
    tone: "success" | "info";
  } | null;
  redirectTo?: string;
}

type AuthMode = "login" | "signup";

export default function LoginForm({
  initialError,
  initialNotice = null,
  redirectTo = "/",
}: LoginFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState(initialError ?? "");
  const [notice, setNotice] = useState(initialNotice);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!initialNotice && !initialError) {
      return;
    }

    // Status/reason/error are one-time UI signals, not persistent page state.
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname
    );
  }, [initialNotice, initialError]);

  function handleSubmit(mode: AuthMode) {
    // Hide any previous success/info message when the user starts a new attempt.
    setNotice(null);
    setError("");

    const form = formRef.current;

    if (!form || !form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);

    startTransition(async () => {
      const result =
        mode === "login"
          ? await login(formData)
          : await signup(formData);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setEmail("");
      setPassword("");
      setPasswordVisible(false);
      setError("");
      setNotice(null);
      router.push(result.redirectTo);
    });
  }

  return (
    <form
      ref={formRef}
      className="mt-8 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit("login");
      }}
    >
      <input type="hidden" name="redirectTo" value={redirectTo} />

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-2xl border px-4 py-4 text-sm ${
            notice.tone === "info"
              ? "border-yellow-200 bg-yellow-50 text-yellow-900"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <p className="font-semibold">{notice.title}</p>
          <p className="mt-1 leading-6">{notice.message}</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800"
        >
          <p className="font-semibold">No se pudo completar la acción</p>
          <p className="mt-1 leading-6">{error}</p>
        </div>
      )}

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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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

        <div className="relative">
          <input
            id="password"
            name="password"
            type={passwordVisible ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            autoComplete="current-password"
            className="w-full rounded-2xl border border-black/5 bg-white/60 px-4 py-3.5 pr-12 text-sm outline-none transition placeholder:text-zinc-400 focus:border-yellow-400 focus:bg-white/80"
            placeholder="••••••••"
          />

          <button
            type="button"
            onClick={() => setPasswordVisible((current) => !current)}
            aria-label={
              passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            title={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute inset-y-0 right-2 flex w-10 items-center justify-center rounded-full text-zinc-400 transition hover:bg-black/5 hover:text-zinc-700"
          >
            <EyeIcon visible={passwordVisible} />
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleSubmit("login")}
          disabled={isPending}
          className="yellow-button rounded-full px-5 py-3.5 text-sm font-bold text-[#111111] disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? "Procesando..." : "Iniciar sesión"}
        </button>

        <button
          type="button"
          onClick={() => handleSubmit("signup")}
          disabled={isPending}
          className="glass-hover glass rounded-full px-5 py-3.5 text-sm font-semibold text-zinc-800 disabled:cursor-wait disabled:opacity-60"
        >
          Crear cuenta
        </button>
      </div>
    </form>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {visible ? (
        <>
          <path
            d="M2.8 12s3.3-5 9.2-5 9.2 5 9.2 5-3.3 5-9.2 5-9.2-5-9.2-5Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2.5" />
        </>
      ) : (
        <>
          <path
            d="M2.8 12s3.3-5 9.2-5c2.1 0 3.9.7 5.3 1.6M21.2 12s-3.3 5-9.2 5c-2.1 0-3.9-.7-5.3-1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="m4 4 16 16" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

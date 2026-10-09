"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { login, signup } from "@/app/login/actions";

interface LoginFormProps {
  initialError?: string;
}

type AuthMode = "login" | "signup";

export default function LoginForm({ initialError }: LoginFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(mode: AuthMode) {
    const form = formRef.current;

    if (!form || !form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    setError("");

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
      setError("");
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

        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
          autoComplete="current-password"
          className="w-full rounded-2xl border border-black/5 bg-white/60 px-4 py-3.5 text-sm outline-none transition placeholder:text-zinc-400 focus:border-yellow-400 focus:bg-white/80"
          placeholder="••••••••"
        />
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

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "@/app/account/actions";

type Visibility = {
  current: boolean;
  next: boolean;
  confirm: boolean;
};

export default function PasswordChangeForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState<Visibility>({
    current: false,
    next: false,
    confirm: false,
  });
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const inputClass =
    "w-full rounded-2xl border border-black/5 bg-white/60 px-4 py-3.5 pr-12 text-sm outline-none transition placeholder:text-zinc-400 focus:border-yellow-400 focus:bg-white/80";
  const eyeButtonClass =
    "absolute inset-y-0 right-2 flex w-10 items-center justify-center rounded-full text-zinc-400 transition hover:bg-black/5 hover:text-zinc-700";

  function toggleVisibility(field: keyof Visibility) {
    setVisible((current) => ({
      ...current,
      [field]: !current[field],
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);

    startTransition(async () => {
      const result = await changePassword(formData);

      if (result.sessionExpired) {
        router.push("/login");
        return;
      }

      setFeedback({
        type: result.success ? "success" : "error",
        message: result.message,
      });

      if (result.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setVisible({
          current: false,
          next: false,
          confirm: false,
        });
      }
    });
  }

  return (
    <div className="pt-5">
      <p className="mb-5 text-sm leading-6 text-zinc-500">
        Verifica tu contraseña actual antes de establecer una nueva.
      </p>

      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`mb-5 rounded-2xl border px-4 py-4 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          label="Contraseña actual"
          value={currentPassword}
          onChange={setCurrentPassword}
          visible={visible.current}
          onToggle={() => toggleVisibility("current")}
          autoComplete="current-password"
          inputClass={inputClass}
          buttonClass={eyeButtonClass}
        />

        <PasswordInput
          id="newPassword"
          name="newPassword"
          label="Nueva contraseña"
          value={newPassword}
          onChange={setNewPassword}
          visible={visible.next}
          onToggle={() => toggleVisibility("next")}
          autoComplete="new-password"
          minLength={6}
          inputClass={inputClass}
          buttonClass={eyeButtonClass}
        />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirmar nueva contraseña"
          value={confirmPassword}
          onChange={setConfirmPassword}
          visible={visible.confirm}
          onToggle={() => toggleVisibility("confirm")}
          autoComplete="new-password"
          minLength={6}
          inputClass={inputClass}
          buttonClass={eyeButtonClass}
        />

        <button
          type="submit"
          disabled={isPending}
          className="yellow-button w-full rounded-full px-5 py-3.5 text-sm font-bold text-[#111111] disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? "Actualizando..." : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}

interface PasswordInputProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  autoComplete: string;
  minLength?: number;
  inputClass: string;
  buttonClass: string;
}

function PasswordInput({
  id,
  name,
  label,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
  minLength,
  inputClass,
  buttonClass,
}: PasswordInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-zinc-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          className={inputClass}
          placeholder="••••••••"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`}
          title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className={buttonClass}
        >
          <EyeIcon visible={visible} />
        </button>
      </div>
    </div>
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

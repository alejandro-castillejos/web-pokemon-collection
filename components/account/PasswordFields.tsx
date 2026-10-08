"use client";

import { useId, useState } from "react";

interface PasswordFieldsProps {
  currentPasswordId: string;
  newPasswordId: string;
  confirmPasswordId: string;
}

export default function PasswordFields({
  currentPasswordId,
  newPasswordId,
  confirmPasswordId,
}: PasswordFieldsProps) {
  const [visible, setVisible] = useState({
    current: false,
    newPassword: false,
    confirm: false,
  });

  const baseInputClass =
    "w-full rounded-2xl border border-black/5 bg-white/60 px-4 py-3.5 pr-12 text-sm outline-none transition placeholder:text-zinc-400 focus:border-yellow-400 focus:bg-white/80";

  const buttonClass =
    "absolute inset-y-0 right-2 flex w-10 items-center justify-center rounded-full text-zinc-400 transition hover:bg-black/5 hover:text-zinc-700";

  function toggle(field: "current" | "newPassword" | "confirm") {
    setVisible((state) => ({
      ...state,
      [field]: !state[field],
    }));
  }

  return (
    <>
      <div>
        <label
          htmlFor={currentPasswordId}
          className="mb-2 block text-sm font-semibold text-zinc-700"
        >
          Contraseña actual
        </label>

        <div className="relative">
          <input
            id={currentPasswordId}
            name="currentPassword"
            type={visible.current ? "text" : "password"}
            required
            autoComplete="current-password"
            className={baseInputClass}
            placeholder="••••••••"
          />

          <button
            type="button"
            onClick={() => toggle("current")}
            aria-label={
              visible.current
                ? "Ocultar contraseña actual"
                : "Mostrar contraseña actual"
            }
            title={
              visible.current
                ? "Ocultar contraseña"
                : "Mostrar contraseña"
            }
            className={buttonClass}
          >
            <EyeIcon visible={visible.current} />
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor={newPasswordId}
          className="mb-2 block text-sm font-semibold text-zinc-700"
        >
          Nueva contraseña
        </label>

        <div className="relative">
          <input
            id={newPasswordId}
            name="newPassword"
            type={visible.newPassword ? "text" : "password"}
            required
            minLength={6}
            autoComplete="new-password"
            className={baseInputClass}
            placeholder="••••••••"
          />

          <button
            type="button"
            onClick={() => toggle("newPassword")}
            aria-label={
              visible.newPassword
                ? "Ocultar nueva contraseña"
                : "Mostrar nueva contraseña"
            }
            title={
              visible.newPassword
                ? "Ocultar contraseña"
                : "Mostrar contraseña"
            }
            className={buttonClass}
          >
            <EyeIcon visible={visible.newPassword} />
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor={confirmPasswordId}
          className="mb-2 block text-sm font-semibold text-zinc-700"
        >
          Confirmar nueva contraseña
        </label>

        <div className="relative">
          <input
            id={confirmPasswordId}
            name="confirmPassword"
            type={visible.confirm ? "text" : "password"}
            required
            minLength={6}
            autoComplete="new-password"
            className={baseInputClass}
            placeholder="••••••••"
          />

          <button
            type="button"
            onClick={() => toggle("confirm")}
            aria-label={
              visible.confirm
                ? "Ocultar confirmación de contraseña"
                : "Mostrar confirmación de contraseña"
            }
            title={
              visible.confirm
                ? "Ocultar contraseña"
                : "Mostrar contraseña"
            }
            className={buttonClass}
          >
            <EyeIcon visible={visible.confirm} />
          </button>
        </div>
      </div>
    </>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  const id = useId();

  return (
    <svg
      key={id}
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
          <path
            d="m4 4 16 16"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

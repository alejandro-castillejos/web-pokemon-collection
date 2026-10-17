"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AuthActionResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string };

function getSafeRedirectPath(value: FormDataEntryValue | null): string {
  const path = typeof value === "string" ? value.trim() : "";

  // Only allow relative paths on this site to prevent open redirects.
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return "/";
  }

  try {
    const parsed = new URL(path, "https://pokemon-collection.invalid");
    if (parsed.origin !== "https://pokemon-collection.invalid") {
      return "/";
    }
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return "/";
  }
}

export async function login(
  formData: FormData
): Promise<AuthActionResult> {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      success: false,
      error: "Correo y contraseña son obligatorios.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: "No se pudo iniciar sesión. Revisa tu correo y contraseña.",
    };
  }

  revalidatePath("/", "layout");

  return {
    success: true,
    redirectTo: getSafeRedirectPath(formData.get("redirectTo")),
  };
}

export async function signup(
  formData: FormData
): Promise<AuthActionResult> {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      success: false,
      error: "Correo y contraseña son obligatorios.",
    };
  }

  const hasMinimumLength = password.length >= 8;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);

  if (
    !hasMinimumLength ||
    !hasLowercase ||
    !hasUppercase ||
    !hasDigit
  ) {
    return {
      success: false,
      error:
        "La contraseña debe tener al menos 8 caracteres e incluir una minúscula, una mayúscula y un número.",
    };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath("/", "layout");

  return {
    success: true,
    redirectTo: getSafeRedirectPath(formData.get("redirectTo")),
  };
}

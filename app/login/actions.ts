"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AuthActionResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string };

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
    redirectTo: "/",
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

  if (password.length < 6) {
    return {
      success: false,
      error: "La contraseña debe tener al menos 6 caracteres.",
    };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: "http://localhost:3000/auth/callback",
    },
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
    redirectTo:
      "/login?status=signup&message=" +
      encodeURIComponent(
        "Cuenta creada. Revisa tu correo para confirmar tu cuenta."
      ),
  };
}

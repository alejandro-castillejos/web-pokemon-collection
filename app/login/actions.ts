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

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const siteUrl =
    configuredSiteUrl ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "");

  let emailRedirectTo: string;

  try {
    if (!siteUrl) {
      throw new Error("Missing canonical site URL");
    }

    const parsedSiteUrl = new URL(siteUrl);
    const isLocalHttp =
      parsedSiteUrl.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(parsedSiteUrl.hostname);
    const isSecurePublicUrl = parsedSiteUrl.protocol === "https:";

    if (!isLocalHttp && !isSecurePublicUrl) {
      throw new Error("Invalid canonical site URL");
    }

    emailRedirectTo = new URL(
      "/auth/callback",
      parsedSiteUrl.origin
    ).toString();
  } catch {
    return {
      success: false,
      error:
        "No se pudo preparar el enlace de confirmación. Configura NEXT_PUBLIC_SITE_URL con la dirección HTTPS del sitio.",
    };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
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
    redirectTo: "/login?status=signup",
  };
}

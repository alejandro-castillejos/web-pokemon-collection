"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface PasswordChangeResult {
  success: boolean;
  message: string;
  sessionExpired?: boolean;
}

export async function changePassword(
  formData: FormData
): Promise<PasswordChangeResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Tu sesión ha expirado. Inicia sesión de nuevo.",
      sessionExpired: true,
    };
  }

  const currentPassword = String(
    formData.get("currentPassword") ?? ""
  );
  const newPassword = String(
    formData.get("newPassword") ?? ""
  );
  const confirmPassword = String(
    formData.get("confirmPassword") ?? ""
  );

  if (!currentPassword || !newPassword || !confirmPassword) {
    return {
      success: false,
      message: "Completa todos los campos de contraseña.",
    };
  }

  if (newPassword.length < 6) {
    return {
      success: false,
      message: "La nueva contraseña debe tener al menos 6 caracteres.",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      message: "Las nuevas contraseñas no coinciden.",
    };
  }

  if (currentPassword === newPassword) {
    return {
      success: false,
      message: "La nueva contraseña debe ser diferente a la actual.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
    current_password: currentPassword,
  });

  if (error) {
    return {
      success: false,
      message: "La contraseña actual no es correcta o no se pudo actualizar.",
    };
  }

  return {
    success: true,
    message: "Contraseña actualizada correctamente.",
  };
}

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect(
      `/account?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/", "layout");
  redirect(`/login?status=logout&message=${encodeURIComponent("Sesión cerrada correctamente")}`);
}

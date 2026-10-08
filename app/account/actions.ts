"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function changePassword(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
    redirect(
      "/account?passwordError=Completa todos los campos de contraseña."
    );
  }

  if (newPassword.length < 6) {
    redirect(
      "/account?passwordError=La nueva contraseña debe tener al menos 6 caracteres."
    );
  }

  if (newPassword !== confirmPassword) {
    redirect(
      "/account?passwordError=Las nuevas contraseñas no coinciden."
    );
  }

  if (currentPassword === newPassword) {
    redirect(
      "/account?passwordError=La nueva contraseña debe ser diferente a la actual."
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
    current_password: currentPassword,
  });

  if (error) {
    redirect(
      `/account?passwordError=${encodeURIComponent(
        "La contraseña actual no es correcta o no se pudo actualizar."
      )}`
    );
  }

  revalidatePath("/account");
  redirect("/account?passwordSuccess=Contraseña actualizada correctamente.");
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
  redirect("/login?message=Sesión cerrada correctamente");
}

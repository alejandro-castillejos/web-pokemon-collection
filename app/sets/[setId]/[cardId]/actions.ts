"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ToggleResult<T> =
  | ({ success: true; requiresLogin: false; error: null } & T)
  | ({ success: false; requiresLogin: boolean; error: string } & T);

function revalidateCardRoutes(setId: string, cardId: string) {
  // Refresh all views that derive counts or recent additions from these records.
  revalidatePath("/");
  revalidatePath("/sets");
  revalidatePath(`/sets/${setId}`);
  revalidatePath(`/sets/${setId}/${cardId}`);
  revalidatePath("/collection");
  revalidatePath(`/collection/${setId}`);
  revalidatePath(`/collection/${setId}/${cardId}`);
  revalidatePath("/wishlist");
  revalidatePath(`/wishlist/${setId}`);
  revalidatePath(`/wishlist/${setId}/${cardId}`);
}

function isValidCardReference(cardId: string, setId: string) {
  const validId = /^[A-Za-z0-9_.-]{1,100}$/;
  if (!validId.test(cardId) || !validId.test(setId)) {
    return false;
  }

  const separatorIndex = cardId.indexOf("-");
  return (
    separatorIndex > 0 &&
    cardId.slice(0, separatorIndex).toLowerCase() === setId.toLowerCase()
  );
}

export async function toggleCollection(
  cardId: string,
  setId: string
): Promise<ToggleResult<{ owned: boolean }>> {
  if (!isValidCardReference(cardId, setId)) {
    return {
      success: false,
      requiresLogin: false,
      owned: false,
      error: "La referencia de la carta no es válida.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      requiresLogin: true,
      owned: false,
      error: "Inicia sesión para agregar esta carta a tu colección.",
    };
  }

  const { data: existingCard, error: findError } = await supabase
    .from("collection")
    .select("card_id")
    .eq("user_id", user.id)
    .eq("card_id", cardId)
    .maybeSingle();

  if (findError) {
    return {
      success: false,
      requiresLogin: false,
      owned: false,
      error: "No se pudo consultar tu colección. Inténtalo de nuevo.",
    };
  }

  if (existingCard) {
    const { error } = await supabase
      .from("collection")
      .delete()
      .eq("user_id", user.id)
      .eq("card_id", cardId);

    if (error) {
      return {
        success: false,
        requiresLogin: false,
        owned: true,
        error: "No se pudo quitar la carta de tu colección.",
      };
    }

    revalidateCardRoutes(setId, cardId);
    return {
      success: true,
      requiresLogin: false,
      owned: false,
      error: null,
    };
  }

  const { error } = await supabase.from("collection").insert({
    user_id: user.id,
    card_id: cardId,
  });

  if (error) {
    return {
      success: false,
      requiresLogin: false,
      owned: false,
      error: "No se pudo agregar la carta a tu colección.",
    };
  }

  revalidateCardRoutes(setId, cardId);
  return {
    success: true,
    requiresLogin: false,
    owned: true,
    error: null,
  };
}

export async function toggleWishlist(
  cardId: string,
  setId: string
): Promise<ToggleResult<{ wishlist: boolean }>> {
  if (!isValidCardReference(cardId, setId)) {
    return {
      success: false,
      requiresLogin: false,
      wishlist: false,
      error: "La referencia de la carta no es válida.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      requiresLogin: true,
      wishlist: false,
      error: "Inicia sesión para agregar esta carta a tu wishlist.",
    };
  }

  const { data: existingCard, error: findError } = await supabase
    .from("wishlist")
    .select("card_id")
    .eq("user_id", user.id)
    .eq("card_id", cardId)
    .maybeSingle();

  if (findError) {
    return {
      success: false,
      requiresLogin: false,
      wishlist: false,
      error: "No se pudo consultar tu wishlist. Inténtalo de nuevo.",
    };
  }

  if (existingCard) {
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", user.id)
      .eq("card_id", cardId);

    if (error) {
      return {
        success: false,
        requiresLogin: false,
        wishlist: true,
        error: "No se pudo quitar la carta de tu wishlist.",
      };
    }

    revalidateCardRoutes(setId, cardId);
    return {
      success: true,
      requiresLogin: false,
      wishlist: false,
      error: null,
    };
  }

  const { error } = await supabase.from("wishlist").insert({
    user_id: user.id,
    card_id: cardId,
  });

  if (error) {
    return {
      success: false,
      requiresLogin: false,
      wishlist: false,
      error: "No se pudo agregar la carta a tu wishlist.",
    };
  }

  revalidateCardRoutes(setId, cardId);
  return {
    success: true,
    requiresLogin: false,
    wishlist: true,
    error: null,
  };
}

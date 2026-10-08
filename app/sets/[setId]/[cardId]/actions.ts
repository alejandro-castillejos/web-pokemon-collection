"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function revalidateCardRoutes(setId: string, cardId: string) {
  revalidatePath(`/sets/${setId}/${cardId}`);
  revalidatePath(`/collection/${setId}/${cardId}`);
  revalidatePath(`/wishlist`);
  revalidatePath(`/wishlist/${setId}`);
  revalidatePath(`/wishlist/${setId}/${cardId}`);
}

export async function toggleCollection(cardId: string, setId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      owned: false,
      error: "Debes iniciar sesión para modificar tu colección.",
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
      owned: false,
      error: findError.message,
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
        owned: true,
        error: error.message,
      };
    }

    revalidateCardRoutes(setId, cardId);

    return {
      success: true,
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
      owned: false,
      error: error.message,
    };
  }

  revalidateCardRoutes(setId, cardId);

  return {
    success: true,
    owned: true,
    error: null,
  };
}

export async function toggleWishlist(cardId: string, setId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      wishlist: false,
      error: "Debes iniciar sesión para modificar tu wishlist.",
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
      wishlist: false,
      error: findError.message,
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
        wishlist: true,
        error: error.message,
      };
    }

    revalidateCardRoutes(setId, cardId);

    return {
      success: true,
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
      wishlist: false,
      error: error.message,
    };
  }

  revalidateCardRoutes(setId, cardId);

  return {
    success: true,
    wishlist: true,
    error: null,
  };
}

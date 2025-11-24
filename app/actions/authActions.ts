"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function login(password: string) {
  if (password === "admin") {
    const cookieStore = await cookies();
    cookieStore.set("auth_token", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    revalidatePath("/");
    return { success: true };
  }
  return { success: false, error: "Invalid password" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  revalidatePath("/");
}

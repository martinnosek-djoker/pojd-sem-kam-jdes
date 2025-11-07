import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const AUTH_COOKIE = "admin_auth";

export async function checkAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get(AUTH_COOKIE);
    return authCookie?.value === "authenticated";
  } catch (error) {
    console.error("checkAuth error:", error);
    return false;
  }
}

export async function login(password: string): Promise<boolean> {
  try {
    if (password === ADMIN_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE, "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("login error:", error);
    return false;
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE);
  } catch (error) {
    console.error("logout error:", error);
  }
}

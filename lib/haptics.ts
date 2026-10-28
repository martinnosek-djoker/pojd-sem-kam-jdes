import { IS_MOBILE } from "@/lib/api-config";

// Short vibration for taps that deserve physical feedback (native app only; on the web it does nothing).
export async function tapHaptic(strength: "light" | "medium" = "light") {
  if (!IS_MOBILE) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: strength === "medium" ? ImpactStyle.Medium : ImpactStyle.Light });
  } catch {
    // no haptics on this device: ignore
  }
}

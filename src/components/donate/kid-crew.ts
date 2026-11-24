import type { KidProps } from "@/components/donate/Kid";

// Shared ink colour and the CIYES crew of kids: different skin tones, hairstyles and CIYES colours.
export const INK = "#1B1B2F";

// The CIYES crew: different skin tones, hairstyles and CIYES colours.
export const KID_CREW = {
  amara: { skin: "#8D5524", top: "#CC2129", bottom: "#FFB200", skirt: true, hair: "puffs", hairColor: "#1B1B1B", accent: "#FFB200" },
  junior: { skin: "#C68642", top: "#1875D2", bottom: "#1B1B2F", hair: "cap", accent: "#FFB200" },
  nadia: { skin: "#5C3A21", top: "#FFB200", bottom: "#156D3B", skirt: true, hair: "braids", hairColor: "#2A1A12", accent: "#CC2129" },
  kofi: { skin: "#A0522D", top: "#156D3B", bottom: "#1875D2", hair: "afro", hairColor: "#1B1B1B" },
  sara: { skin: "#E0AC69", top: "#1875D2", bottom: "#CC2129", skirt: true, hair: "short", hairColor: "#3B2412" },
} satisfies Record<string, Omit<KidProps, "x" | "y">>;

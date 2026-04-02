export const competitionRegistrationLinks = {
  cyesPitch: {
    title: "CYES Business Pitch Competition",
    description: "Complete your application on the website first, then continue to Ayati to complete payment.",
    paymentHref: "https://ayati.me/5see",
    path: "/cyes/pitch-competition",
    competitionSlug: "cyes-pitch-competition",
    codePrefix: "CYESP",
  },
  exhibitionStands: {
    title: "Panache Expo 2026 Exhibition Stands",
    description: "Reserve your stand on the website first, then continue to Ayati to complete payment.",
    paymentHref: "https://ayati.me/kqhc",
    path: "/panache-expo/exhibition-stands",
    competitionSlug: "exhibition-stands",
    codePrefix: "STAND",
  },
  missPanache: {
    title: "Mademoiselle Panache",
    description: "Complete your contestant application on the website, then continue to Ayati for payment.",
    paymentHref: "https://ayati.me/qi18",
    path: "/miss-panache/register",
    competitionSlug: "miss-panache",
    codePrefix: "MISS",
  },
  fashionNight: {
    title: "Panache Fashion Night",
    description: "Complete your designer application on the website, then continue to Ayati for payment.",
    paymentHref: "https://ayati.me/6jtf",
    path: "/panache-fashion-night/register",
    competitionSlug: "fashion-night",
    codePrefix: "PFN",
  },
  panache360: {
    title: "Panache 360 Beauty Contest 2026",
    description: "Complete your competition application on the website, then continue to Ayati for payment.",
    paymentHref: "https://ayati.me/pyfk",
    path: "/panache-360/register",
    competitionSlug: "panache-360",
    codePrefix: "P360",
  },
} as const;

export const buildCompetitionApplicationCode = (prefix: string) => {
  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `${prefix}-${dateStamp}-${random}`;
};

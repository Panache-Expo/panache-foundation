export type RegistrationPostSubmitAction = "redirect_payment" | "redirect_whatsapp";
export type RegistrationPaymentMode = "paid" | "free";

export const PANACHE_SUPPORT_WHATSAPP_NUMBER = "+237674230406";
export const PANACHE_SUPPORT_WHATSAPP_HREF = "https://wa.me/237674230406";

export const PANACHE_PARTICIPANT_WHATSAPP_GROUP_URL =
  import.meta.env.VITE_PARTICIPANT_WHATSAPP_GROUP_URL ||
  "https://chat.whatsapp.com/JvzGqSujsVH8mpMMsROInH";
export const PANACHE_RUNWAY_WHATSAPP_GROUP_URL =
  import.meta.env.VITE_RUNWAY_WHATSAPP_GROUP_URL ||
  "https://chat.whatsapp.com/FS3SllgrWSr78MRJfEfCNU?mode=gi_t";

export interface CompetitionRegistrationConfig {
  title: string;
  description: string;
  path: string;
  competitionSlug: string;
  codePrefix: string;
  postSubmitAction: RegistrationPostSubmitAction;
  paymentMode: RegistrationPaymentMode;
  paymentHref?: string;
  whatsappGroupUrl?: string;
  successTitle?: string;
  successDescription?: string;
  notificationRecipientEmails?: string[];
  redirectDelayMs?: number;
}

const DEFAULT_NOTIFICATION_EMAILS = ["glenmue2020@gmail.com"];

export const competitionRegistrationLinks: Record<
  "cyesPitch" | "exhibitionStands" | "missPanache" | "fashionNight" | "panache360",
  CompetitionRegistrationConfig
> = {
  cyesPitch: {
    title: "CYES Business Pitch Competition",
    description:
      "Complete your application on the website first, then continue to Ayati to complete payment.",
    paymentHref: "https://ayati.me/5see",
    postSubmitAction: "redirect_payment",
    paymentMode: "paid",
    path: "/cyes/pitch-competition",
    competitionSlug: "cyes-pitch-competition",
    codePrefix: "CYESP",
  },
  exhibitionStands: {
    title: "Panache Expo 2026 Exhibition Stands",
    description:
      "Reserve your stand on the website first, then continue to our registration flow.",
    postSubmitAction: "redirect_whatsapp",
    paymentMode: "free",
    path: "/panache-expo/exhibition-stands",
    competitionSlug: "exhibition-stands",
    codePrefix: "STAND",
    whatsappGroupUrl: PANACHE_PARTICIPANT_WHATSAPP_GROUP_URL,
    successTitle: "Exhibition stand request received",
    successDescription:
      "Your stand request is now saved in the Panache registration system. Continue in WhatsApp to confirm your stand details with the team.",
    notificationRecipientEmails: ["glenmue2020@gmail.com"],
  },
  missPanache: {
    title: "Mademoiselle Panache",
    description:
      "Complete your contestant application on the website first, then join our WhatsApp support flow.",
    postSubmitAction: "redirect_whatsapp",
    paymentMode: "free",
    path: "/panache-expo/miss-panache/register",
    competitionSlug: "miss-panache",
    codePrefix: "MISS",
    whatsappGroupUrl: PANACHE_PARTICIPANT_WHATSAPP_GROUP_URL,
    successTitle: "Miss Panache Application Received",
    successDescription:
      "Your contestant application is now stored in the Panache registration system. Continue in WhatsApp to finish your registration process.",
    notificationRecipientEmails: ["glenmue2020@gmail.com"],
  },
  fashionNight: {
    title: "Panache Fashion Night",
    description:
      "Save your entry details on the website, then continue through the WhatsApp flow.",
    postSubmitAction: "redirect_whatsapp",
    paymentMode: "free",
    path: "/panache-expo/panache-fashion-night/register",
    competitionSlug: "fashion-night",
    codePrefix: "PFN",
    whatsappGroupUrl: PANACHE_RUNWAY_WHATSAPP_GROUP_URL,
    successTitle: "Fashion Night Application Received",
    successDescription:
      "Your designer application is now stored in the Panache registration system. Continue in WhatsApp to finish your registration process.",
    notificationRecipientEmails: ["glenmue2020@gmail.com"],
  },
  panache360: {
    title: "Panache 360 Beauty Contest 2026",
    description:
      "Complete your competition application on the website, then continue through the WhatsApp flow.",
    postSubmitAction: "redirect_whatsapp",
    paymentMode: "free",
    path: "/panache-expo/panache-360/register",
    competitionSlug: "panache-360",
    codePrefix: "P360",
    whatsappGroupUrl: PANACHE_PARTICIPANT_WHATSAPP_GROUP_URL,
    successTitle: "Panache 360 Application Received",
    successDescription:
      "Your contest application is now stored in the Panache registration system. Continue in WhatsApp to finish your registration process.",
    notificationRecipientEmails: ["glenmue2020@gmail.com"],
  },
};

export const getCompetitionPaymentSettings = (config: CompetitionRegistrationConfig) => ({
  postSubmitHref:
    config.postSubmitAction === "redirect_whatsapp"
      ? config.whatsappGroupUrl || PANACHE_PARTICIPANT_WHATSAPP_GROUP_URL
      : config.paymentHref || "",
  paymentStatus: config.paymentMode === "free" ? "paid" : "pending",
  paymentPlatform: config.paymentMode === "free" ? "free" : "ayatickets",
  ctaLabel:
    config.postSubmitAction === "redirect_whatsapp"
      ? "Continue to WhatsApp"
      : "Continue to payment",
  postSubmitCopy:
    config.postSubmitAction === "redirect_whatsapp"
      ? "You will be redirected to WhatsApp. If nothing happens, use the button below."
      : "You will be redirected to the payment page. If nothing happens, use the button below.",
  successMessage:
    config.postSubmitAction === "redirect_whatsapp"
      ? "A confirmation email has been sent. Redirecting you to WhatsApp to continue your registration."
      : "A confirmation email has been sent. Redirecting you to continue the payment flow.",
  pendingMessage:
    config.postSubmitAction === "redirect_whatsapp"
      ? "Your application was still saved and you are being redirected to WhatsApp."
      : "Your application was still saved and you are being redirected to payment.",
  isFree: config.paymentMode === "free",
  notificationEmails:
    config.notificationRecipientEmails && config.notificationRecipientEmails.length > 0
      ? config.notificationRecipientEmails
      : DEFAULT_NOTIFICATION_EMAILS,
  redirectDelayMs: config.redirectDelayMs ?? 1600,
});

export const buildCompetitionApplicationCode = (prefix: string) => {
  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `${prefix}-${dateStamp}-${random}`;
};

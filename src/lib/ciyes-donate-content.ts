// Text for the CIYES community project donation pages (/donate, /donate/thank-you) and the
// site navbar. English and French; the French uses the formal "vous" throughout.
import type { CiyesLang } from "@/lib/ciyes-home-content";

export const CIYES_DONATE_CAMPAIGN = "borehole-2027";
export const CIYES_DONATE_URL = "https://panache-foundation.org/donate";
export const CIYES_DONATE_MIN_XAF = 500;
export const CIYES_DONATE_MAX_XAF = 2_000_000;
export const CIYES_DONATE_AMOUNTS = [1000, 2500, 5000, 10000, 25000] as const;
export const CIYES_SPONSOR_EMAIL = "info.ciyesawards@gmail.com";
export const CIYES_SPONSOR_PHONES = [
  { label: "+237 6 58 11 91 67", tel: "+237658119167" },
  { label: "+237 6 73 59 49 31", tel: "+237673594931" },
] as const;

export const formatFcfa = (lang: CiyesLang, amount: number) => {
  const digits = Math.round(amount).toLocaleString("en-US");
  return lang === "fr" ? `${digits.replace(/,/g, "\u00A0")}\u00A0FCFA` : `${digits} FCFA`;
};

type Item = { title: string; text: string };

export type CiyesNavContent = {
  links: { label: string; to: string }[];
  waitlist: string;
  donate: string;
  switchTo: string;
  menu: string;
  close: string;
  home: string;
};

export type CiyesDonateContent = {
  meta: { title: string; description: string };
  hero: { headline: string; text: string; date: string };
  progress: {
    raised: (amount: string) => string;
    ofGoal: (goal: string) => string;
    donors: (count: number) => string;
    noGoal: string;
    loading: string;
    unavailable: string;
  };
  form: {
    title: string;
    amountLabel: string;
    custom: string;
    customPlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phoneHint: string;
    optional: string;
    submit: string;
    sending: string;
    secure: string;
    errors: { amount: string; phone: string; generic: string; notReady: string };
  };
  costs: { title: string; text: string; items: Item[] };
  steps: { title: string; items: { when: string; title: string; text: string }[] };
  impact: { title: string; text: string; items: Item[] };
  video: { title: string; text: string };
  sponsor: { title: string; text: string; cta: string; subject: string; phones: string };
  thanks: {
    metaTitle: string;
    checking: string;
    pendingTitle: string;
    pendingText: string;
    checkAgain: string;
    successTitle: (name: string | null) => string;
    successText: (amount: string) => string;
    failedTitle: string;
    failedText: string;
    tryAgain: string;
    missingTitle: string;
    missingText: string;
    share: string;
    shareMessage: string;
    back: string;
  };
  band: { title: string; text: string; cta: string };
};

export const CIYES_NAV_CONTENT: Record<CiyesLang, CiyesNavContent> = {
  en: {
    links: [
      { label: "The app", to: "/#features" },
      { label: "Pricing", to: "/#pricing" },
      { label: "Community project", to: "/donate" },
      { label: "Summit & Awards", to: "/cyes" },
      { label: "Foundation", to: "/foundation" },
    ],
    waitlist: "Join the waitlist",
    donate: "Donate",
    switchTo: "FR",
    menu: "Open menu",
    close: "Close menu",
    home: "CIYES home",
  },
  fr: {
    links: [
      { label: "L'appli", to: "/#features" },
      { label: "Tarifs", to: "/#pricing" },
      { label: "Projet communautaire", to: "/donate" },
      { label: "Sommet & Awards", to: "/cyes" },
      { label: "Fondation", to: "/foundation" },
    ],
    waitlist: "Rejoindre la liste",
    donate: "Donner",
    switchTo: "EN",
    menu: "Ouvrir le menu",
    close: "Fermer le menu",
    home: "Accueil CIYES",
  },
};

export const CIYES_DONATE_CONTENT: Record<CiyesLang, CiyesDonateContent> = {
  en: {
    meta: {
      title: "Donate to the CIYES 2027 community borehole | Panache Foundation",
      description:
        "This year, the CIYES community project is a borehole for an underserved community in Cameroon. Give with Mobile Money or card.",
    },
    hero: {
      headline:
        "This year, the CIYES community project is a borehole, for an underserved community in Cameroon that needs clean water.",
      text: "Every franc goes to drilling, equipping and handing over one working borehole. Give with Mobile Money or card in under a minute.",
      date: "Handover on Day 1 of CIYES 2027 · 14 April 2027",
    },
    progress: {
      raised: (amount) => `${amount} raised`,
      ofGoal: (goal) => `of ${goal}`,
      donors: (count) => (count === 1 ? "1 donor" : `${count.toLocaleString("en-US")} donors`),
      noGoal: "The final budget will be published once the site survey is done.",
      loading: "Loading the total…",
      unavailable: "The total will show here shortly.",
    },
    form: {
      title: "Give to the borehole",
      amountLabel: "Choose an amount",
      custom: "Other amount",
      customPlaceholder: "Amount in FCFA",
      nameLabel: "Your name",
      namePlaceholder: "Shown as a donor, if you like",
      phoneLabel: "WhatsApp number",
      phoneHint: "We send you photos of the handover.",
      optional: "optional",
      submit: "Donate",
      sending: "Opening secure payment…",
      secure: "You pay on Campay's secure page with Mobile Money (MTN MoMo, Orange Money) or a bank card. We never see your PIN or card details.",
      errors: {
        amount: "Choose an amount between 500 and 2,000,000 FCFA.",
        phone: "Please check the WhatsApp number, or leave it empty.",
        generic: "We could not open the payment. Please try again.",
        notReady: "Donations open very soon. Please try again shortly.",
      },
    },
    costs: {
      title: "What your money pays for",
      text: "One borehole, built properly and built to last.",
      items: [
        { title: "Drilling", text: "A licensed team drills to a reliable water table." },
        { title: "Materials", text: "Casing, gravel pack, concrete and the apron around the well." },
        { title: "Pumps", text: "A hand pump the community can run and repair themselves." },
        { title: "Transport", text: "Getting the rig, the crew and the materials to the site." },
        { title: "Water testing", text: "Lab tests before handover, so the water is safe to drink." },
        { title: "Installation", text: "Fitting, finishing, and training a local water committee." },
      ],
    },
    steps: {
      title: "From today to the handover",
      items: [
        { when: "Now", title: "Raise the funds", text: "Donations and sponsors fund the project." },
        { when: "Early 2027", title: "Choose the site", text: "We pick the community with local leaders and survey the ground." },
        { when: "Feb – Mar 2027", title: "Drill and build", text: "Drilling, pump installation and the water tests." },
        { when: "14 April 2027", title: "Handover", text: "The borehole is handed to the community on Day 1 of CIYES 2027." },
      ],
    },
    impact: {
      title: "How we measure it",
      text: "We report back to every donor after the handover.",
      items: [
        { title: "People served", text: "How many people draw water from the borehole each day." },
        { title: "Water quality", text: "Test results at handover and again six months later." },
        { title: "Time saved", text: "Minutes no longer spent walking to fetch water." },
        { title: "Still working", text: "A check that the pump runs one year on." },
      ],
    },
    video: {
      title: "See the project",
      text: "A short video about the community and the borehole.",
    },
    sponsor: {
      title: "Want to sponsor the borehole?",
      text: "Companies and partners can fund the whole project or a part of it, with visibility at CIYES 2027.",
      cta: "Email us about sponsoring",
      subject: "Sponsoring the CIYES 2027 borehole",
      phones: "Call us",
    },
    thanks: {
      metaTitle: "Thank you | CIYES community borehole",
      checking: "Checking your payment…",
      pendingTitle: "Your payment is still pending",
      pendingText: "Confirm it on your phone if you have not yet, then check again.",
      checkAgain: "Check again",
      successTitle: (name) => (name ? `Thank you, ${name}.` : "Thank you."),
      successText: (amount) => `Your ${amount} donation is now part of the CIYES 2027 community borehole.`,
      failedTitle: "The payment did not go through",
      failedText: "No money was taken. You can try again.",
      tryAgain: "Try again",
      missingTitle: "We could not find this donation",
      missingText: "If money left your account, write to us and we will sort it out.",
      share: "Share on WhatsApp",
      shareMessage:
        "I just gave to the CIYES 2027 community borehole: clean water for an underserved community in Cameroon. You can give too:",
      back: "Back to the project",
    },
    band: {
      title: "This year's community project: a borehole",
      text: "Clean water for an underserved community in Cameroon, handed over on Day 1 of CIYES 2027.",
      cta: "Donate",
    },
  },
  fr: {
    meta: {
      title: "Faire un don pour le forage communautaire CIYES 2027 | Panache Foundation",
      description:
        "Cette année, le projet communautaire du CIYES est un forage pour une communauté défavorisée au Cameroun. Donnez par Mobile Money ou par carte.",
    },
    hero: {
      headline:
        "Cette année, le projet communautaire du CIYES est un forage, pour une communauté défavorisée au Cameroun qui a besoin d'eau potable.",
      text: "Chaque franc sert à forer, équiper et remettre un forage qui fonctionne. Donnez par Mobile Money ou par carte en moins d'une minute.",
      date: "Remise le jour 1 du CIYES 2027 · 14 avril 2027",
    },
    progress: {
      raised: (amount) => `${amount} collectés`,
      ofGoal: (goal) => `sur ${goal}`,
      donors: (count) => (count === 1 ? "1 donateur" : `${count.toLocaleString("fr-FR")} donateurs`),
      noGoal: "Le budget final sera publié après l'étude du site.",
      loading: "Chargement du total…",
      unavailable: "Le total s'affichera ici sous peu.",
    },
    form: {
      title: "Donner pour le forage",
      amountLabel: "Choisissez un montant",
      custom: "Autre montant",
      customPlaceholder: "Montant en FCFA",
      nameLabel: "Votre nom",
      namePlaceholder: "Affiché parmi les donateurs, si vous le souhaitez",
      phoneLabel: "Numéro WhatsApp",
      phoneHint: "Nous vous enverrons les photos de la remise.",
      optional: "facultatif",
      submit: "Faire un don",
      sending: "Ouverture du paiement sécurisé…",
      secure: "Vous payez sur la page sécurisée de Campay, par Mobile Money (MTN MoMo, Orange Money) ou par carte bancaire. Nous ne voyons jamais votre code ni les données de votre carte.",
      errors: {
        amount: "Choisissez un montant entre 500 et 2 000 000 FCFA.",
        phone: "Veuillez vérifier le numéro WhatsApp, ou laissez-le vide.",
        generic: "Le paiement n'a pas pu s'ouvrir. Veuillez réessayer.",
        notReady: "Les dons ouvrent très bientôt. Veuillez réessayer sous peu.",
      },
    },
    costs: {
      title: "À quoi sert votre don",
      text: "Un forage, bien construit et fait pour durer.",
      items: [
        { title: "Forage", text: "Une équipe agréée fore jusqu'à une nappe fiable." },
        { title: "Matériaux", text: "Tubage, massif filtrant, béton et dalle autour du puits." },
        { title: "Pompes", text: "Une pompe manuelle que la communauté peut faire fonctionner et réparer." },
        { title: "Transport", text: "Acheminer la foreuse, l'équipe et les matériaux sur le site." },
        { title: "Analyse de l'eau", text: "Des analyses en laboratoire avant la remise, pour une eau potable." },
        { title: "Installation", text: "Pose, finitions et formation d'un comité local de l'eau." },
      ],
    },
    steps: {
      title: "D'aujourd'hui à la remise",
      items: [
        { when: "Maintenant", title: "Collecter les fonds", text: "Les dons et les sponsors financent le projet." },
        { when: "Début 2027", title: "Choisir le site", text: "Nous choisissons la communauté avec les autorités locales et étudions le terrain." },
        { when: "Fév. – mars 2027", title: "Forer et construire", text: "Forage, installation de la pompe et analyses de l'eau." },
        { when: "14 avril 2027", title: "Remise", text: "Le forage est remis à la communauté le jour 1 du CIYES 2027." },
      ],
    },
    impact: {
      title: "Comment nous mesurons l'impact",
      text: "Nous rendons compte à chaque donateur après la remise.",
      items: [
        { title: "Personnes servies", text: "Combien de personnes puisent l'eau du forage chaque jour." },
        { title: "Qualité de l'eau", text: "Les analyses à la remise, puis six mois plus tard." },
        { title: "Temps gagné", text: "Les minutes qui ne sont plus passées à marcher pour chercher l'eau." },
        { title: "Toujours en service", text: "Une vérification que la pompe fonctionne un an après." },
      ],
    },
    video: {
      title: "Découvrez le projet",
      text: "Une courte vidéo sur la communauté et le forage.",
    },
    sponsor: {
      title: "Vous souhaitez sponsoriser le forage ?",
      text: "Les entreprises et partenaires peuvent financer tout ou partie du projet, avec une visibilité au CIYES 2027.",
      cta: "Nous écrire pour sponsoriser",
      subject: "Sponsoriser le forage CIYES 2027",
      phones: "Appelez-nous",
    },
    thanks: {
      metaTitle: "Merci | Forage communautaire CIYES",
      checking: "Vérification de votre paiement…",
      pendingTitle: "Votre paiement est toujours en attente",
      pendingText: "Confirmez-le sur votre téléphone si ce n'est pas encore fait, puis vérifiez à nouveau.",
      checkAgain: "Vérifier à nouveau",
      successTitle: (name) => (name ? `Merci, ${name}.` : "Merci."),
      successText: (amount) => `Votre don de ${amount} fait désormais partie du forage communautaire CIYES 2027.`,
      failedTitle: "Le paiement n'a pas abouti",
      failedText: "Aucun montant n'a été prélevé. Vous pouvez réessayer.",
      tryAgain: "Réessayer",
      missingTitle: "Nous ne trouvons pas ce don",
      missingText: "Si un montant a été prélevé, écrivez-nous et nous réglerons cela.",
      share: "Partager sur WhatsApp",
      shareMessage:
        "Je viens de donner pour le forage communautaire CIYES 2027 : de l'eau potable pour une communauté défavorisée au Cameroun. Vous pouvez aussi donner :",
      back: "Retour au projet",
    },
    band: {
      title: "Le projet communautaire de cette année : un forage",
      text: "De l'eau potable pour une communauté défavorisée au Cameroun, remise le jour 1 du CIYES 2027.",
      cta: "Faire un don",
    },
  },
};

// All text for the CIYES app homepage (/ and /waitlist), in English and French.
// French uses the informal "tu" and FCFA, matching the CIYES promo videos.

export type CiyesLang = "en" | "fr";

export type CiyesWaitlistRole = "entrepreneur" | "organiser" | "ngo" | "customer";
export type CiyesPhoneOs = "iphone" | "android";

// Pro plan: 7,450 XAF a month, 3-month minimum; 6 months = 1 month free, 12 months = 3 months free.
export const CIYES_PRO_MONTHLY_XAF = 7450;
export const CIYES_PRO_PLANS = [
  { months: 3, freeMonths: 0, priceXaf: 22350 },
  { months: 6, freeMonths: 1, priceXaf: 37250 },
  { months: 12, freeMonths: 3, priceXaf: 67050 },
] as const;

export const formatCiyesPrice = (lang: CiyesLang, amount: number) => {
  const digits = Math.round(amount).toLocaleString("en-US");
  return lang === "fr" ? `${digits.replace(/,/g, "\u00A0")}\u00A0FCFA` : `${digits} XAF`;
};

export const CIYES_WAITLIST_PATH = "/waitlist";
export const CIYES_WAITLIST_URL = "https://panache-foundation.org/waitlist";

type Card = { title: string; text: string };

export type CiyesHomeContent = {
  meta: { title: string; description: string };
  nav: { waitlist: string; waitlistShort: string; switchTo: string; by: string };
  hero: {
    eyebrow: string;
    lines: [string, string, string];
    tagline: string;
    text: string;
    primary: string;
    secondary: string;
    chips: string[];
    videoLabel: string;
  };
  problem: { eyebrow: string; title: string; cards: Card[] };
  features: { eyebrow: string; title: string; items: Card[] };
  soon: { eyebrow: string; title: string; badge: string; items: string[] };
  who: { eyebrow: string; title: string; items: Card[] };
  pricing: {
    eyebrow: string;
    title: string;
    text: string;
    free: { name: string; price: string; items: string[] };
    pro: { name: string; badge: string; items: string[] };
    planLabel: (months: number) => string;
    freeMonths: (n: number) => string;
    perMonth: (amount: string) => string;
    bestValue: string;
    note: string;
    cta: string;
  };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  waitlist: {
    eyebrow: string;
    title: string;
    text: string;
    name: string;
    phone: string;
    phonePlaceholder: string;
    email: string;
    city: string;
    optional: string;
    role: string;
    roles: Record<CiyesWaitlistRole, string>;
    phoneOs: string;
    submit: string;
    sending: string;
    privacy: string;
    successTitle: string;
    successText: string;
    alreadyTitle: string;
    alreadyText: string;
    share: string;
    shareMessage: string;
    errors: { name: string; phone: string; email: string; role: string; generic: string };
  };
  foundation: { eyebrow: string; title: string; cards: (Card & { to: string; cta: string })[] };
};

export const CIYES_HOME_CONTENT: Record<CiyesLang, CiyesHomeContent> = {
  en: {
    meta: {
      title: "CIYES app · Join the waitlist",
      description:
        "One app to show your business, find customers and get paid with Mobile Money. Coming 2027 on iPhone and Android. Join the waitlist.",
    },
    nav: { waitlist: "Join the waitlist", waitlistShort: "Waitlist", switchTo: "Français", by: "by Panache Foundation" },
    hero: {
      eyebrow: "The CIYES app · Coming 2027",
      lines: ["Show your business.", "Find customers.", "Get paid."],
      tagline: "All year long.",
      text: "One app for young entrepreneurs in Cameroon: your own shop page, Mobile Money payments, tickets for your events and voting, right in your pocket.",
      primary: "Join the waitlist",
      secondary: "Watch the video",
      chips: ["iPhone & Android", "MTN MoMo & Orange Money", "Free to start"],
      videoLabel: "CIYES app video",
    },
    problem: {
      eyebrow: "The problem",
      title: "Selling is hard work.",
      cards: [
        { title: "Your WhatsApp status is gone in a day.", text: "You post your products, and 24 hours later nobody sees them." },
        { title: "Customers ask “how much?”, then vanish.", text: "No shop page, no prices, no easy way to buy from you." },
        { title: "Chasing payments and checking screenshots.", text: "Real or fake? You lose hours confirming who really paid." },
        { title: "Planning an event?", text: "Names on paper, cash at the door, and no idea who really paid." },
      ],
    },
    features: {
      eyebrow: "What you can do",
      title: "One place to show your business, find customers and get paid.",
      items: [
        { title: "Your own shop page", text: "Add your products and prices, share one link, and customers reach you on WhatsApp in one tap." },
        { title: "Get paid with Mobile Money", text: "Customers pay you in the app with MTN MoMo or Orange Money. You see every payment." },
        { title: "Sell tickets to your events", text: "Workshops, trainings, launches: people pay, get a QR ticket, and you check them in at the door." },
        { title: "Post once, sell more", text: "Share your TikTok or Instagram link. It shows on CIYES with a Buy button." },
        { title: "See your money", text: "Sales, tickets and payments in one simple dashboard." },
        { title: "Free or paid voting", text: "Run awards, competitions and polls. A paid vote counts once the Mobile Money payment is confirmed." },
        { title: "Go Pro", text: "A verified badge and a featured spot to reach more customers." },
      ],
    },
    soon: {
      eyebrow: "Coming soon",
      title: "And we're just getting started.",
      badge: "Soon",
      items: ["Your own website", "Salon & barber bookings", "Income & expense tracking", "Auto-post from TikTok & Instagram"],
    },
    who: {
      eyebrow: "Who it's for",
      title: "Built for you.",
      items: [
        { title: "Young entrepreneurs", text: "Sell your products and services all year." },
        { title: "Side hustlers", text: "Turn your skills into steady income." },
        { title: "Event organisers", text: "Sell tickets and run voting." },
        { title: "NGOs & organisations", text: "Run events, awards and campaigns with clear records." },
        { title: "Their customers", text: "Find, buy from and support local businesses." },
      ],
    },
    pricing: {
      eyebrow: "Pricing",
      title: "Free to start. Go Pro when you're ready.",
      text: "Everyone starts free. Pro helps more customers find you.",
      free: {
        name: "Free",
        price: "0 XAF",
        items: ["Your profile and shop page", "Up to 3 offers", "Customers contact you on WhatsApp"],
      },
      pro: {
        name: "Pro",
        badge: "For growing businesses",
        items: ["Verified badge on your profile", "Featured in the feed and search", "Up to 20 offers", "Stats on views, clicks and contacts"],
      },
      planLabel: (months) => `${months} months`,
      freeMonths: (n) => (n === 1 ? "1 month free" : `${n} months free`),
      perMonth: (amount) => `${amount} / month`,
      bestValue: "Best value",
      note: "Minimum 3 months · pay with MTN MoMo or Orange Money. Join the waitlist to hear first when Pro pre-orders open.",
      cta: "Join the waitlist",
    },
    faq: {
      eyebrow: "Questions",
      title: "Good to know",
      items: [
        { q: "When does CIYES launch?", a: "In 2027, on iPhone and Android. Join the waitlist and we'll message you on WhatsApp when it's ready." },
        {
          q: "How much does it cost?",
          a: "CIYES is free to start. Pro starts at 22,350 XAF for 3 months (7,450 a month), with 1 month free on 6 months and 3 months free on 12 months.",
        },
        { q: "Is it only for CIYES events?", a: "No. Sell tickets and run voting for your own events, awards and competitions." },
        { q: "How do customers pay?", a: "With MTN Mobile Money or Orange Money, right in the app." },
        { q: "Who is behind CIYES?", a: "The team behind the CIYES Summit & Awards, with Panache Foundation." },
      ],
    },
    waitlist: {
      eyebrow: "Waitlist",
      title: "Be among the first to get CIYES.",
      text: "Leave your WhatsApp number. We'll send you the link the day the app opens.",
      name: "Full name",
      phone: "WhatsApp number",
      phonePlaceholder: "6 70 00 00 00",
      email: "Email",
      city: "City",
      optional: "optional",
      role: "I am…",
      roles: {
        entrepreneur: "An entrepreneur or side hustler",
        organiser: "An event organiser",
        ngo: "An NGO or organisation",
        customer: "A customer",
      },
      phoneOs: "My phone",
      submit: "Join the waitlist",
      sending: "Joining…",
      privacy: "We only use your details to tell you about CIYES. No spam.",
      successTitle: "You're on the list!",
      successText: "We'll message you on WhatsApp when CIYES opens. Know someone who sells? Send them the link.",
      alreadyTitle: "You're already on the list.",
      alreadyText: "This number is already registered. We'll message you on WhatsApp when CIYES opens.",
      share: "Share on WhatsApp",
      shareMessage: "Join the CIYES app waitlist: show your business, find customers and get paid with Mobile Money.",
      errors: {
        name: "Please enter your name.",
        phone: "Please enter a valid WhatsApp number.",
        email: "Please check your email address.",
        role: "Please choose what describes you.",
        generic: "Something went wrong. Please try again, or message us on WhatsApp.",
      },
    },
    foundation: {
      eyebrow: "From Panache Foundation",
      title: "The team behind the CIYES Summit & Awards",
      cards: [
        { title: "CIYES Summit & Awards", text: "Cameroon's youth entrepreneurship summit and awards.", to: "/cyes", cta: "Explore the Summit" },
        { title: "Panache Expo", text: "Beauty, fashion, workshops and awards.", to: "/panache-expo", cta: "Explore Panache Expo" },
        { title: "Panache Foundation", text: "Who we are and what we do.", to: "/foundation", cta: "About the Foundation" },
      ],
    },
  },
  fr: {
    meta: {
      title: "Appli CIYES · Rejoins la liste d'attente",
      description:
        "Une seule appli pour montrer ton business, trouver des clients et te faire payer avec Mobile Money. Disponible en 2027 sur iPhone et Android. Rejoins la liste d'attente.",
    },
    nav: { waitlist: "Rejoindre la liste d'attente", waitlistShort: "Liste d'attente", switchTo: "English", by: "par Panache Foundation" },
    hero: {
      eyebrow: "L'appli CIYES · Disponible en 2027",
      lines: ["Montre ton business.", "Trouve des clients.", "Fais-toi payer."],
      tagline: "Toute l'année.",
      text: "Une seule appli pour les jeunes entrepreneurs au Cameroun : ta boutique, les paiements Mobile Money, les billets de tes événements et les votes, dans ta poche.",
      primary: "Rejoindre la liste d'attente",
      secondary: "Voir la vidéo",
      chips: ["iPhone & Android", "MTN MoMo & Orange Money", "Gratuit pour commencer"],
      videoLabel: "Vidéo de l'appli CIYES",
    },
    problem: {
      eyebrow: "Le problème",
      title: "Vendre, c'est dur.",
      cards: [
        { title: "Ton statut WhatsApp disparaît en un jour.", text: "Tu postes tes produits, et 24 heures plus tard, plus personne ne les voit." },
        { title: "Les clients demandent « combien ? », puis disparaissent.", text: "Pas de boutique, pas de prix, pas de moyen simple d'acheter chez toi." },
        { title: "Relancer les paiements et vérifier les captures.", text: "Vrai ou faux ? Tu perds des heures à vérifier qui a vraiment payé." },
        { title: "Tu organises un événement ?", text: "Des noms sur papier, du cash à l'entrée, et aucune idée de qui a vraiment payé." },
      ],
    },
    features: {
      eyebrow: "Ce que tu peux faire",
      title: "Un seul endroit pour montrer ton business, trouver des clients et te faire payer.",
      items: [
        { title: "Ta propre boutique", text: "Ajoute tes produits et tes prix, partage un seul lien, et tes clients te joignent sur WhatsApp en un clic." },
        { title: "Encaisse avec Mobile Money", text: "Tes clients te paient dans l'appli avec MTN MoMo ou Orange Money. Tu vois chaque paiement." },
        { title: "Vends des billets pour tes événements", text: "Ateliers, formations, lancements : on paie, on reçoit un billet QR, et tu valides l'entrée." },
        { title: "Poste une fois, vends plus", text: "Partage ton lien TikTok ou Instagram : il s'affiche sur CIYES avec un bouton Acheter." },
        { title: "Vois ton argent", text: "Ventes, billets et paiements dans un tableau de bord simple." },
        { title: "Votes gratuits ou payants", text: "Organise des awards, des concours et des sondages. Un vote payant compte dès que le paiement Mobile Money est confirmé." },
        { title: "Passe Pro", text: "Un badge vérifié et une place en vedette pour toucher plus de clients." },
      ],
    },
    soon: {
      eyebrow: "Bientôt",
      title: "Et ce n'est que le début.",
      badge: "Bientôt",
      items: ["Ton propre site web", "Réservations salons & barbiers", "Suivi des revenus & dépenses", "Publication auto depuis TikTok & Instagram"],
    },
    who: {
      eyebrow: "Pour qui ?",
      title: "Conçu pour toi.",
      items: [
        { title: "Jeunes entrepreneurs", text: "Vends tes produits et services toute l'année." },
        { title: "Petits business", text: "Transforme ton talent en revenu régulier." },
        { title: "Organisateurs d'événements", text: "Vends des billets et organise des votes." },
        { title: "ONG & organisations", text: "Organise événements, awards et campagnes, avec des comptes clairs." },
        { title: "Leurs clients", text: "Trouve, achète et soutiens les business locaux." },
      ],
    },
    pricing: {
      eyebrow: "Tarifs",
      title: "Gratuit pour commencer. Passe Pro quand tu veux.",
      text: "Tout le monde commence gratuitement. Pro aide plus de clients à te trouver.",
      free: {
        name: "Gratuit",
        price: "0\u00A0FCFA",
        items: ["Ton profil et ta boutique", "Jusqu'à 3 offres", "Tes clients te contactent sur WhatsApp"],
      },
      pro: {
        name: "Pro",
        badge: "Pour faire grandir ton business",
        items: ["Badge vérifié sur ton profil", "En vedette dans le fil et la recherche", "Jusqu'à 20 offres", "Stats de vues, clics et contacts"],
      },
      planLabel: (months) => `${months} mois`,
      freeMonths: (n) => (n === 1 ? "1 mois offert" : `${n} mois offerts`),
      perMonth: (amount) => `${amount} / mois`,
      bestValue: "Meilleure offre",
      note: "Minimum 3 mois · paiement par MTN MoMo ou Orange Money. Rejoins la liste d'attente pour être prévenu dès l'ouverture des précommandes Pro.",
      cta: "Rejoindre la liste d'attente",
    },
    faq: {
      eyebrow: "Questions",
      title: "Bon à savoir",
      items: [
        { q: "Quand CIYES sera-t-il disponible ?", a: "En 2027, sur iPhone et Android. Rejoins la liste d'attente et on t'écrit sur WhatsApp dès que c'est prêt." },
        {
          q: "Combien ça coûte ?",
          a: "C'est gratuit pour commencer. Pro commence à 22\u00A0350\u00A0FCFA pour 3 mois (7\u00A0450 par mois), avec 1 mois offert sur 6 mois et 3 mois offerts sur 12 mois.",
        },
        { q: "C'est seulement pour les événements CIYES ?", a: "Non. Vends des billets et organise des votes pour tes propres événements, awards et concours." },
        { q: "Comment les clients paient-ils ?", a: "Avec MTN Mobile Money ou Orange Money, directement dans l'appli." },
        { q: "Qui est derrière CIYES ?", a: "L'équipe du Sommet et des Awards CIYES, avec Panache Foundation." },
      ],
    },
    waitlist: {
      eyebrow: "Liste d'attente",
      title: "Sois parmi les premiers à avoir CIYES.",
      text: "Laisse ton numéro WhatsApp. On t'envoie le lien le jour de l'ouverture de l'appli.",
      name: "Nom complet",
      phone: "Numéro WhatsApp",
      phonePlaceholder: "6 70 00 00 00",
      email: "E-mail",
      city: "Ville",
      optional: "facultatif",
      role: "Je suis…",
      roles: {
        entrepreneur: "Entrepreneur ou petit business",
        organiser: "Organisateur d'événements",
        ngo: "Une ONG ou organisation",
        customer: "Un client",
      },
      phoneOs: "Mon téléphone",
      submit: "Rejoindre la liste d'attente",
      sending: "Envoi…",
      privacy: "On utilise tes infos seulement pour te parler de CIYES. Pas de spam.",
      successTitle: "Tu es sur la liste !",
      successText: "On t'écrit sur WhatsApp dès l'ouverture de CIYES. Tu connais quelqu'un qui vend ? Envoie-lui le lien.",
      alreadyTitle: "Tu es déjà sur la liste.",
      alreadyText: "Ce numéro est déjà inscrit. On t'écrit sur WhatsApp dès l'ouverture de CIYES.",
      share: "Partager sur WhatsApp",
      shareMessage: "Rejoins la liste d'attente de l'appli CIYES : montre ton business, trouve des clients et fais-toi payer avec Mobile Money.",
      errors: {
        name: "Entre ton nom.",
        phone: "Entre un numéro WhatsApp valide.",
        email: "Vérifie ton adresse e-mail.",
        role: "Choisis ce qui te décrit.",
        generic: "Une erreur s'est produite. Réessaie, ou écris-nous sur WhatsApp.",
      },
    },
    foundation: {
      eyebrow: "Par Panache Foundation",
      title: "L'équipe du Sommet et des Awards CIYES",
      cards: [
        { title: "Sommet & Awards CIYES", text: "Le sommet et les awards des jeunes entrepreneurs du Cameroun.", to: "/cyes", cta: "Découvrir le Sommet" },
        { title: "Panache Expo", text: "Beauté, mode, ateliers et awards.", to: "/panache-expo", cta: "Découvrir Panache Expo" },
        { title: "Panache Foundation", text: "Qui nous sommes et ce que nous faisons.", to: "/foundation", cta: "À propos de la Fondation" },
      ],
    },
  },
};

// Language order: ?lang=fr|en in the URL, then the visitor's saved choice, then the browser language.
const LANG_STORAGE_KEY = "ciyes-lang";

export const detectCiyesLang = (): CiyesLang => {
  if (typeof window === "undefined") return "en";
  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  if (fromUrl === "fr" || fromUrl === "en") return fromUrl;
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === "fr" || saved === "en") return saved;
  } catch {
    // storage blocked: fall through
  }
  return window.navigator.language?.toLowerCase().startsWith("fr") ? "fr" : "en";
};

export const saveCiyesLang = (lang: CiyesLang) => {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // storage blocked: the choice just won't be remembered
  }
};

// Cameroon numbers: 9 digits starting with 6 or 2, with or without +237. Other countries: +country code.
export const normalizeWhatsAppNumber = (raw: string): string | null => {
  let value = raw.replace(/[\s().-]/g, "");
  if (value.startsWith("00")) value = `+${value.slice(2)}`;
  if (/^[26]\d{8}$/.test(value)) return `+237${value}`;
  if (/^237[26]\d{8}$/.test(value)) return `+${value}`;
  if (/^\+237[26]\d{8}$/.test(value)) return value;
  if (/^\+(?!237)[1-9]\d{7,14}$/.test(value)) return value;
  return null;
};

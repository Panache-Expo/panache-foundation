// All text for the CIYES app homepage (/ and /waitlist), in English and French.
// French uses the informal "tu" and FCFA, matching the CIYES promo videos.

export type CiyesLang = "en" | "fr";

export type CiyesWaitlistRole = "entrepreneur" | "organiser" | "ngo" | "customer";
export type CiyesPhoneOs = "iphone" | "android";

// Pro plan: normally 9,450 XAF a month; early users pay 7,450. 3-month minimum;
// 6 months = 1 month free, 12 months = 3 months free (so you pay for 3, 5 or 9 months).
export const CIYES_PRO_NORMAL_MONTHLY_XAF = 9450;
export const CIYES_PRO_MONTHLY_XAF = 7450;
export const CIYES_PRO_PLANS = [
  { months: 3, freeMonths: 0, priceXaf: 22350, normalXaf: 28350 },
  { months: 6, freeMonths: 1, priceXaf: 37250, normalXaf: 47250 },
  { months: 12, freeMonths: 3, priceXaf: 67050, normalXaf: 85050 },
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
  nav: { waitlist: string; switchTo: string; by: string; tagline: string };
  hero: {
    // Three lines set like the Panache Foundation headline: sans, display, sans.
    headline: [string, string, string];
    text: string;
    meta: string;
    primary: string;
    secondary: string;
    pillars: Card[];
    videoLabel: string;
  };
  problem: { title: string; cards: Card[] };
  features: { title: string; text: string; items: Card[] };
  who: { title: string; text: string; items: Card[] };
  soon: { title: string; text: string; badge: string; items: string[] };
  pricing: {
    title: string;
    text: string;
    free: { name: string; price: string; items: string[] };
    pro: { name: string; badge: string; items: string[] };
    planLabel: (months: number) => string;
    freeMonths: (n: number) => string;
    perMonth: (amount: string) => string;
    bestValue: string;
    early: { label: string; normally: string; earlyPay: string };
    note: string;
    cta: string;
  };
  faq: { title: string; items: { q: string; a: string }[] };
  waitlist: {
    title: string;
    text: string;
    name: string;
    phone: string;
    phonePlaceholder: string;
    steps: {
      progress: (n: number) => string;
      next: string;
      back: string;
      details: string;
      who: string;
      device: string;
      deviceHint: string;
    };
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
    shareMessage: string;
    // After joining: step 1 shares the waitlist, step 2 joins the WhatsApp channel.
    shareStep: { title: string; whatsapp: string; copy: string; copied: string; copyFailed: string };
    channelStep: { title: string; text: string; cta: string };
    errors: { name: string; phone: string; role: string; generic: string };
  };
  foundation: {
    title: string;
    text: string;
    cards: (Card & { meta: string; to: string; cta: string; accent: string })[];
    about: string;
  };
};

export const CIYES_HOME_CONTENT: Record<CiyesLang, CiyesHomeContent> = {
  en: {
    meta: {
      title: "CIYES app · Join the waitlist",
      description:
        "One app to show your business, find customers and get paid with Mobile Money. Coming 2027 on iPhone and Android. Join the waitlist.",
    },
    nav: { waitlist: "Join the waitlist", switchTo: "Français", by: "by Panache Foundation", tagline: "The app for young entrepreneurs in Cameroon." },
    hero: {
      headline: ["Show your business,", "find customers", "and get paid."],
      text: "One app for young entrepreneurs in Cameroon: your own shop page, Mobile Money payments, tickets for your events and voting, all year long.",
      meta: "Coming 2027 · iPhone & Android · free to start",
      primary: "Join the waitlist",
      secondary: "Watch the video",
      pillars: [
        { title: "Your shop page", text: "Products, prices and one link to share on WhatsApp." },
        { title: "Mobile Money", text: "Customers pay you with MTN MoMo or Orange Money." },
        { title: "Tickets & voting", text: "Sell tickets and run free or paid votes for your events." },
      ],
      videoLabel: "CIYES app video",
    },
    problem: {
      title: "Selling is hard work.",
      cards: [
        { title: "Your WhatsApp status is gone in a day.", text: "You post your products, and 24 hours later nobody sees them." },
        { title: "Customers ask “how much?”, then vanish.", text: "No shop page, no prices, no easy way to buy from you." },
        { title: "Chasing payments and checking screenshots.", text: "Real or fake? You lose hours confirming who really paid." },
        { title: "Planning an event?", text: "Names on paper, cash at the door, and no idea who really paid." },
      ],
    },
    features: {
      title: "One place to show your business, find customers and get paid.",
      text: "Everything a young business needs to sell online, built for how people in Cameroon buy and pay.",
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
    who: {
      title: "Built for you",
      text: "Whoever you are in Cameroon's business scene, CIYES gives you a place to be seen.",
      items: [
        { title: "Young entrepreneurs", text: "Sell your products and services all year." },
        { title: "Side hustlers", text: "Turn your skills into steady income." },
        { title: "Event organisers", text: "Sell tickets and run voting." },
        { title: "NGOs & organisations", text: "Run events, awards and campaigns with clear records." },
        { title: "Their customers", text: "Find, buy from and support local businesses." },
      ],
    },
    soon: {
      title: "Coming next",
      text: "We're just getting started. These arrive after launch.",
      badge: "Soon",
      items: ["Your own website", "Salon & barber bookings", "Income & expense tracking", "Auto-post from TikTok & Instagram"],
    },
    pricing: {
      title: "Free to start. Go Pro when you're ready.",
      text: "Everyone starts free. Pro helps more customers find you, and early users pay less.",
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
      early: { label: "Early-user price", normally: "Normally", earlyPay: "Early users pay" },
      note: "Minimum 3 months · pay with MTN MoMo or Orange Money. Join the waitlist to be among the first users and hear when Pro pre-orders open.",
      cta: "Join the waitlist",
    },
    faq: {
      title: "Good to know",
      items: [
        { q: "When does CIYES launch?", a: "In 2027, on iPhone and Android. Join the waitlist and we'll message you on WhatsApp when it's ready." },
        {
          q: "How much does it cost?",
          a: "CIYES is free to start. Pro normally costs 9,450 XAF a month. Early users pay 7,450 a month: 22,350 XAF for 3 months, with 1 month free on 6 months and 3 months free on 12 months.",
        },
        { q: "Is it only for CIYES events?", a: "No. Sell tickets and run voting for your own events, awards and competitions." },
        { q: "How do customers pay?", a: "With MTN Mobile Money or Orange Money, right in the app." },
        { q: "Who is behind CIYES?", a: "The team behind the CIYES Summit & Awards, with Panache Foundation." },
      ],
    },
    waitlist: {
      title: "Join the waitlist",
      text: "Leave your WhatsApp number. We'll send you the link the day the app opens.",
      name: "Full name",
      phone: "WhatsApp number",
      phonePlaceholder: "6 70 00 00 00",
      steps: {
        progress: (n) => `Step ${n} of 3`,
        next: "Next",
        back: "Back",
        details: "Your name and WhatsApp number",
        who: "Who are you?",
        device: "Which phone do you use?",
        deviceHint: "So we know which app store to point you to. You can skip this.",
      },
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
      shareStep: {
        title: "Share it",
        whatsapp: "Send on WhatsApp",
        copy: "Copy message",
        copied: "Copied",
        copyFailed: "Press and hold the message to copy it.",
      },
      channelStep: {
        title: "Join the CIYES WhatsApp channel",
        text: "Get the launch news first.",
        cta: "Join the channel",
      },
      shareMessage: "Join the CIYES app waitlist: show your business, find customers and get paid with Mobile Money.",
      errors: {
        name: "Please enter your name.",
        phone: "Please enter a valid WhatsApp number.",
        role: "Please choose what describes you.",
        generic: "Something went wrong. Please try again, or message us on WhatsApp.",
      },
    },
    foundation: {
      title: "From the team behind the CIYES Summit & Awards",
      text: "CIYES grows out of Panache Foundation's work with young entrepreneurs and creatives across Cameroon.",
      cards: [
        {
          title: "CIYES",
          meta: "Cameroon Youth Entrepreneurial Summit & Awards",
          text: "Mentorship, networking and recognition for the next generation of Cameroonian entrepreneurs.",
          to: "/cyes",
          cta: "Explore the Summit",
          accent: "from-[#1875D2]/16 to-[#156D3B]/12",
        },
        {
          title: "EXPO",
          meta: "Panache Expo · 6th edition, 2026",
          text: "Celebrating and advancing the beauty industry through education, recognition and community.",
          to: "/panache-expo",
          cta: "Explore Expo",
          accent: "from-[#f4e93f]/28 to-[#8241B6]/12",
        },
      ],
      about: "About Panache Foundation",
    },
  },
  fr: {
    meta: {
      title: "Appli CIYES · Rejoins la liste d'attente",
      description:
        "Une seule appli pour montrer ton business, trouver des clients et te faire payer avec Mobile Money. Disponible en 2027 sur iPhone et Android. Rejoins la liste d'attente.",
    },
    nav: { waitlist: "Rejoindre la liste d'attente", switchTo: "English", by: "par Panache Foundation", tagline: "L'appli des jeunes entrepreneurs au Cameroun." },
    hero: {
      headline: ["Montre ton business,", "trouve des clients", "et fais-toi payer."],
      text: "Une seule appli pour les jeunes entrepreneurs au Cameroun : ta boutique, les paiements Mobile Money, les billets de tes événements et les votes, toute l'année.",
      meta: "Disponible en 2027 · iPhone & Android · gratuit pour commencer",
      primary: "Rejoindre la liste d'attente",
      secondary: "Voir la vidéo",
      pillars: [
        { title: "Ta boutique", text: "Produits, prix et un seul lien à partager sur WhatsApp." },
        { title: "Mobile Money", text: "Tes clients te paient avec MTN MoMo ou Orange Money." },
        { title: "Billets & votes", text: "Vends des billets et organise des votes gratuits ou payants." },
      ],
      videoLabel: "Vidéo de l'appli CIYES",
    },
    problem: {
      title: "Vendre, c'est dur.",
      cards: [
        { title: "Ton statut WhatsApp disparaît en un jour.", text: "Tu postes tes produits, et 24 heures plus tard, plus personne ne les voit." },
        { title: "Les clients demandent « combien ? », puis disparaissent.", text: "Pas de boutique, pas de prix, pas de moyen simple d'acheter chez toi." },
        { title: "Relancer les paiements et vérifier les captures.", text: "Vrai ou faux ? Tu perds des heures à vérifier qui a vraiment payé." },
        { title: "Tu organises un événement ?", text: "Des noms sur papier, du cash à l'entrée, et aucune idée de qui a vraiment payé." },
      ],
    },
    features: {
      title: "Un seul endroit pour montrer ton business, trouver des clients et te faire payer.",
      text: "Tout ce qu'il faut à un jeune business pour vendre en ligne, pensé pour la façon dont on achète et paie au Cameroun.",
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
    who: {
      title: "Conçu pour toi",
      text: "Qui que tu sois dans le business au Cameroun, CIYES te donne un endroit où être vu.",
      items: [
        { title: "Jeunes entrepreneurs", text: "Vends tes produits et services toute l'année." },
        { title: "Petits business", text: "Transforme ton talent en revenu régulier." },
        { title: "Organisateurs d'événements", text: "Vends des billets et organise des votes." },
        { title: "ONG & organisations", text: "Organise événements, awards et campagnes, avec des comptes clairs." },
        { title: "Leurs clients", text: "Trouve, achète et soutiens les business locaux." },
      ],
    },
    soon: {
      title: "Et ensuite",
      text: "Ce n'est que le début. Ces fonctions arrivent après le lancement.",
      badge: "Bientôt",
      items: ["Ton propre site web", "Réservations salons & barbiers", "Suivi des revenus & dépenses", "Publication auto depuis TikTok & Instagram"],
    },
    pricing: {
      title: "Gratuit pour commencer. Passe Pro quand tu veux.",
      text: "Tout le monde commence gratuitement. Pro aide plus de clients à te trouver, et les premiers utilisateurs paient moins.",
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
      early: { label: "Prix premiers utilisateurs", normally: "Normalement", earlyPay: "Les premiers utilisateurs paient" },
      note: "Minimum 3 mois · paiement par MTN MoMo ou Orange Money. Rejoins la liste d'attente pour faire partie des premiers utilisateurs et être prévenu dès l'ouverture des précommandes Pro.",
      cta: "Rejoindre la liste d'attente",
    },
    faq: {
      title: "Bon à savoir",
      items: [
        { q: "Quand CIYES sera-t-il disponible ?", a: "En 2027, sur iPhone et Android. Rejoins la liste d'attente et on t'écrit sur WhatsApp dès que c'est prêt." },
        {
          q: "Combien ça coûte ?",
          a: "C'est gratuit pour commencer. Pro coûte normalement 9\u00A0450\u00A0FCFA par mois. Les premiers utilisateurs paient 7\u00A0450 par mois : 22\u00A0350\u00A0FCFA pour 3 mois, avec 1 mois offert sur 6 mois et 3 mois offerts sur 12 mois.",
        },
        { q: "C'est seulement pour les événements CIYES ?", a: "Non. Vends des billets et organise des votes pour tes propres événements, awards et concours." },
        { q: "Comment les clients paient-ils ?", a: "Avec MTN Mobile Money ou Orange Money, directement dans l'appli." },
        { q: "Qui est derrière CIYES ?", a: "L'équipe du Sommet et des Awards CIYES, avec Panache Foundation." },
      ],
    },
    waitlist: {
      title: "Rejoins la liste d'attente",
      text: "Laisse ton numéro WhatsApp. On t'envoie le lien le jour de l'ouverture de l'appli.",
      name: "Nom complet",
      phone: "Numéro WhatsApp",
      phonePlaceholder: "6 70 00 00 00",
      steps: {
        progress: (n) => `Étape ${n} sur 3`,
        next: "Suivant",
        back: "Retour",
        details: "Ton nom et ton numéro WhatsApp",
        who: "Qui es-tu ?",
        device: "Quel téléphone utilises-tu ?",
        deviceHint: "Pour savoir vers quelle boutique d'applis t'envoyer. Tu peux passer cette étape.",
      },
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
      shareStep: {
        title: "Fais passer le mot",
        whatsapp: "Envoyer sur WhatsApp",
        copy: "Copier le message",
        copied: "Copié",
        copyFailed: "Appuie longuement sur le message pour le copier.",
      },
      channelStep: {
        title: "Rejoins la chaîne WhatsApp CIYES",
        text: "Reçois les nouvelles du lancement en premier.",
        cta: "Rejoindre la chaîne",
      },
      shareMessage: "Rejoins la liste d'attente de l'appli CIYES : montre ton business, trouve des clients et fais-toi payer avec Mobile Money.",
      errors: {
        name: "Entre ton nom.",
        phone: "Entre un numéro WhatsApp valide.",
        role: "Choisis ce qui te décrit.",
        generic: "Une erreur s'est produite. Réessaie, ou écris-nous sur WhatsApp.",
      },
    },
    foundation: {
      title: "Par l'équipe du Sommet et des Awards CIYES",
      text: "CIYES est né du travail de Panache Foundation avec les jeunes entrepreneurs et créatifs du Cameroun.",
      cards: [
        {
          title: "CIYES",
          meta: "Sommet & Awards des jeunes entrepreneurs du Cameroun",
          text: "Mentorat, réseau et reconnaissance pour la nouvelle génération d'entrepreneurs camerounais.",
          to: "/cyes",
          cta: "Découvrir le Sommet",
          accent: "from-[#1875D2]/16 to-[#156D3B]/12",
        },
        {
          title: "EXPO",
          meta: "Panache Expo · 6e édition, 2026",
          text: "Célébrer et faire grandir l'industrie de la beauté par la formation, la reconnaissance et la communauté.",
          to: "/panache-expo",
          cta: "Découvrir l'Expo",
          accent: "from-[#f4e93f]/28 to-[#8241B6]/12",
        },
      ],
      about: "À propos de Panache Foundation",
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

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const CYES_WHATSAPP_HREF =
  "https://wa.me/237674230406?text=Hi%2C%20I%20want%20to%20vote%20for%20the%20CYES%20Awards%20through%20WhatsApp.%20Please%20guide%20me%20through%20the%20voting%20process.";

const textReplacements: Array<[string, string]> = [
  ["Winner package", "Panache People's Choice Award"],
  [
    "Panache D'or comes with a full visibility and growth package.",
    "Panache People's Choice Award rewards the nominee with the most votes.",
  ],
  [
    "Panache D'or comes with a visibility and growth package.",
    "Panache People's Choice Award rewards the nominee with the most votes.",
  ],
  [
    "The Panache D'or winner goes with 1.5 million FCFA and a business-building prize package designed to extend visibility beyond the award night itself.",
    "The Panache People's Choice Award is for the Panache D'or nominee with the highest number of online votes. The winner receives a visibility and business-growth package designed to extend their recognition beyond the award night itself.",
  ],
  [
    "The Panache D'or winner receives a business-building prize package designed to extend visibility beyond the award night itself.",
    "The Panache People's Choice Award is for the Panache D'or nominee with the highest number of online votes. The winner receives a visibility and business-growth package designed to extend their recognition beyond the award night itself.",
  ],
  ["1.5 million FCFA cash package", "Free business website"],
  ["Pro video advert", "Professional video advert"],
  ["Featured on the official website", "Feature on our official website"],
  ["Official Panache ambassador status", "Official Panache D'or ambassador status"],
  ["Online public paid votes", "People's Choice online votes"],
  ["70%", "100%"],
  [
    "Each online vote costs 100 CFA (approximately $0.17 USD), allowing supporters, fans, friends, and communities to actively support their favorite nominees.",
    "The Panache People's Choice Award goes to the Panache D'or nominee with the highest number of online votes.",
  ],
  [
    "Winners of the Panache D'or Awards 2026 will be determined through a transparent voting and judging process combining both public support and professional evaluation.",
    "The Panache People's Choice Award is determined by online votes. It recognises the Panache D'or nominee who mobilises the strongest public support during the voting period.",
  ],
];

const replaceVisibleText = () => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];

  while (walker.nextNode()) {
    nodes.push(walker.currentNode as Text);
  }

  for (const node of nodes) {
    let value = node.nodeValue || "";
    let changed = false;

    for (const [from, to] of textReplacements) {
      if (value.includes(from)) {
        value = value.split(from).join(to);
        changed = true;
      }
    }

    if (changed) {
      node.nodeValue = value;
    }
  }
};

const disableEmailOtpButtons = () => {
  const buttons = Array.from(document.querySelectorAll("button"));

  for (const button of buttons) {
    const text = (button.textContent || "").toLowerCase();
    if (!text.includes("otp") && !text.includes("verification code")) {
      continue;
    }

    button.setAttribute("disabled", "true");
    button.setAttribute("aria-disabled", "true");
    button.classList.add("cursor-not-allowed", "opacity-60");
    button.textContent = "Email OTP temporarily unavailable";
  }
};

const ensureWhatsAppNotice = () => {
  if (document.getElementById("cyes-email-otp-disabled-notice")) {
    return;
  }

  const votingFlow = document.getElementById("cyes-voting-flow");
  if (!votingFlow) {
    return;
  }

  const notice = document.createElement("div");
  notice.id = "cyes-email-otp-disabled-notice";
  notice.className =
    "mt-6 rounded-[1.35rem] border border-[#25D366]/25 bg-[#f3fbf6] px-5 py-4 font-sans text-[#171411]";
  notice.innerHTML = `
    <p class="text-sm font-semibold text-[#156D3B]">Email OTP voting is temporarily unavailable for the moment.</p>
    <p class="mt-1 text-sm leading-relaxed text-[#171411]/70">Please use WhatsApp voting instead while email verification is being restored.</p>
    <a href="${CYES_WHATSAPP_HREF}" target="_blank" rel="noopener noreferrer" class="mt-3 inline-flex h-11 items-center justify-center rounded-full bg-[#25D366] px-5 text-sm font-semibold text-white">Vote through WhatsApp</a>
  `;
  votingFlow.insertBefore(notice, votingFlow.children[1] || null);
};

export const CYESOtpAndPanacheCopyGuard = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const apply = () => {
      if (pathname === "/cyes/vote") {
        disableEmailOtpButtons();
        ensureWhatsAppNotice();
      }

      if (pathname === "/panache-expo/panache-dor") {
        replaceVisibleText();
      }
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
};

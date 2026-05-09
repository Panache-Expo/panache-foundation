import { readFileSync, writeFileSync } from "node:fs";

const pagePath = "src/pages/CYESVotingPage.tsx";
let source = readFileSync(pagePath, "utf8");

const unavailableTitle = "Email OTP temporarily unavailable";
const unavailableDescription = "Email OTP voting is temporarily unavailable for the moment. Please use WhatsApp voting instead.";
const whatsappFallback = "Please use WhatsApp voting instead while we restore email verification.";

if (!source.includes("cyesEmailOtpTemporarilyDisabled")) {
  source = source.replace(
    'const cyesWhatsAppBotNumber = "237674230406";\n',
    'const cyesWhatsAppBotNumber = "237674230406";\nconst cyesEmailOtpTemporarilyDisabled = true;\n'
  );
}

if (!source.includes("Email OTP voting is temporarily unavailable for the moment.")) {
  source = source.replace(
    '    event.preventDefault();\n\n',
    `    event.preventDefault();\n\n    if (cyesEmailOtpTemporarilyDisabled) {\n      toast({\n        title: "${unavailableTitle}",\n        description: "${whatsappFallback}",\n      });\n      return;\n    }\n\n`
  );
}

source = source.replace(
  "Support outstanding entrepreneurs, leaders, and institutions across each open CYECD Awards category. Votes are verified by email before they are counted.",
  "Support outstanding entrepreneurs, leaders, and institutions across each open CYECD Awards category. Email OTP voting is temporarily unavailable; please use WhatsApp voting for the moment."
);

source = source.replace(
  "Choose a category, choose a nominee, verify your email, and submit. You can vote once in each category with the same phone number.",
  "Choose a category and nominee, then use WhatsApp voting for the moment. You can vote once in each category with the same phone number."
);

source = source.replace(
  '      label: "Verify",\n      description: "Enter the code and submit.",',
  '      label: "WhatsApp",\n      description: "Use WhatsApp while email OTP is unavailable.",'
);

const detailSummaryBlock = `                        <p className="mt-3 font-sans text-sm leading-relaxed text-[#171411]/66">
                          {voteSummary}
                        </p>
`;

const whatsappNotice = `                        <div className="mt-4 rounded-[1rem] border border-[#CC2129]/20 bg-[#fff5f5] px-4 py-3">
                          <p className="font-sans text-sm font-semibold text-[#CC2129]">
                            Email OTP voting is temporarily unavailable for the moment.
                          </p>
                          <p className="mt-1 font-sans text-sm leading-relaxed text-[#171411]/66">
                            Please use WhatsApp voting instead while we restore email verification.
                          </p>
                          <a
                            href={selectedVoteWhatsAppHref}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center rounded-full bg-[#156D3B] px-4 py-2 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#125c33]"
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Vote through WhatsApp
                          </a>
                        </div>
`;

if (!source.includes("Vote through WhatsApp")) {
  source = source.replace(detailSummaryBlock, detailSummaryBlock + whatsappNotice);
}

source = source.replace(/disabled=\{requestOtp\.isPending\s*\|\|/g, "disabled={cyesEmailOtpTemporarilyDisabled || requestOtp.isPending ||");
source = source.replace(/disabled=\{requestOtp\.isPending\}/g, "disabled={cyesEmailOtpTemporarilyDisabled || requestOtp.isPending}");
source = source.replace(/disabled=\{\s*!voterName/g, "disabled={cyesEmailOtpTemporarilyDisabled || !voterName");

if (!source.includes("disabled={cyesEmailOtpTemporarilyDisabled") && source.includes('type="submit"')) {
  source = source.replace(
    /(<Button\s+\n\s*type="submit")/,
    '$1\n                        disabled={cyesEmailOtpTemporarilyDisabled}'
  );
}

source = source.replace(/Send OTP/g, unavailableTitle);
source = source.replace(/Request OTP/g, unavailableTitle);
source = source.replace(/Send verification code/g, unavailableTitle);
source = source.replace(/Check your email for the verification code\./g, unavailableDescription);

writeFileSync(pagePath, source);
console.log("CYES email OTP disabled; WhatsApp voting message enabled.");

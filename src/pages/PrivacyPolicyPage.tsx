import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PANACHE_SUPPORT_WHATSAPP_HREF,
  PANACHE_SUPPORT_WHATSAPP_NUMBER,
} from "@/lib/registration-links";
import { Link } from "react-router-dom";

const lastUpdated = "June 1, 2026";

const privacySections = [
  {
    title: "Information We Collect",
    body: [
      "Registration and application details such as name, email address, phone number, city, country, competition category, social handles, portfolio links, experience, motivation, and related form answers.",
      "Voting and ticketing details such as nominee or contestant selected, vote count, ticket package, payment status, transaction reference, receipt email, and related support notes.",
      "Uploaded content such as nominee or contestant photos, portfolio material, and media submitted for review or publication.",
      "Technical data such as browser information, device type, page interactions, IP-derived security signals, and analytics events used to operate and improve the website.",
      "Messages you send directly to Panache Foundation through WhatsApp, email, forms, or other support channels.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "To receive, review, and manage event registrations, competition applications, voting entries, ticket purchases, and participant records.",
      "To verify payments, issue receipts, reconcile successful transactions, prevent fraud, and resolve support issues.",
      "To publish approved public nominee, contestant, leaderboard, event, and winner information where relevant to Panache Foundation programs.",
      "To send operational messages about applications, payments, tickets, voting, event access, schedule changes, and important announcements.",
      "To improve website performance, security, reliability, user experience, and reporting for Panache Foundation activities.",
    ],
  },
  {
    title: "Payments",
    body: [
      "Payments are processed through third-party payment providers such as CamPay. Panache Foundation stores payment references, statuses, amounts, and receipts needed to confirm transactions, but does not intentionally collect full card or mobile money PIN details.",
      "Payment providers may process personal and transaction data under their own privacy and security practices.",
    ],
  },
  {
    title: "WhatsApp and Group Messages",
    body: [
      "If you send information through WhatsApp, Panache Foundation may use that information to provide support, register participants, confirm payments, or communicate event updates.",
      "Panache Foundation should only import or process WhatsApp group content when the relevant participants have been informed and the data is necessary for registration, voting, or event administration.",
      "Avoid sending sensitive personal data in group chats. Use direct support channels for private registration or payment issues.",
    ],
  },
  {
    title: "Sharing Information",
    body: [
      "We may share information with service providers that help operate the website, database, storage, email, payments, analytics, ticketing, and event administration.",
      "We may share limited public information for nominees, contestants, speakers, participants, winners, sponsors, or event listings when that publication is part of the program.",
      "We may disclose information if required by law, to protect users, to prevent fraud, or to secure Panache Foundation systems and events.",
    ],
  },
  {
    title: "Retention and Security",
    body: [
      "We keep information for as long as needed to run programs, resolve disputes, maintain receipts and records, satisfy legal or accounting requirements, and protect the integrity of voting and ticketing systems.",
      "We use reasonable technical and organizational safeguards, including restricted admin access, database security controls, and secure service providers. No online system can be guaranteed to be completely secure.",
    ],
  },
  {
    title: "Your Choices",
    body: [
      "You may request access, correction, or deletion of your personal information, subject to records we need to keep for payments, fraud prevention, legal, accounting, voting integrity, or event safety reasons.",
      "You may ask us to stop non-essential communications. Operational messages about payments, applications, tickets, or event participation may still be sent when necessary.",
      "If public nominee or contestant information needs to be corrected, contact Panache support with the exact profile and requested update.",
    ],
  },
  {
    title: "Children and Minors",
    body: [
      "The website is intended for event, competition, voting, ticketing, and foundation program participation. If a participant is a minor, a parent, guardian, school, or authorized representative should provide consent where required.",
    ],
  },
  {
    title: "Updates",
    body: [
      "We may update this policy when website features, programs, laws, vendors, or operating practices change. The latest version will be posted on this page with the updated date.",
    ],
  },
];

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />

      <main className="pb-20 pt-24 md:pb-24">
        <section className="mx-auto max-w-5xl px-6 md:px-10">
          <Badge className="rounded-full bg-[#f8f2e8] px-4 py-2 text-[#8241B6] hover:bg-[#f8f2e8]">
            Privacy Policy
          </Badge>

          <div className="mt-6 rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_24px_64px_rgba(17,16,14,0.08)] md:p-10">
            <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-[#8241B6]">
              Last updated: {lastUpdated}
            </p>
            <h1 className="mt-4 font-sans text-[clamp(2.8rem,6vw,5.8rem)] font-semibold leading-[0.9] tracking-[-0.08em] text-[#171411]">
              Panache Foundation Privacy Policy
            </h1>
            <p className="mt-6 max-w-3xl font-sans text-base leading-relaxed text-[#171411]/70 md:text-lg">
              This policy explains how Panache Foundation collects, uses, stores,
              and protects personal information through the Panache Foundation,
              Panache Expo, CYES, Panache 360, Panache D&apos;or, voting,
              registration, ticketing, and related event websites.
            </p>
            <p className="mt-4 max-w-3xl font-sans text-sm leading-relaxed text-[#171411]/62">
              This page is an operational privacy notice for users of the site.
              It should be reviewed by qualified legal counsel for formal legal
              compliance.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            {privacySections.map((section) => (
              <section
                key={section.title}
                className="rounded-[1.6rem] border border-black/8 bg-white p-5 md:p-7"
              >
                <h2 className="font-sans text-2xl font-semibold tracking-[-0.05em] text-[#171411]">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-3">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="font-sans text-sm leading-relaxed text-[#171411]/68 md:text-base"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-[1.6rem] border border-[#8241B6]/18 bg-white p-5 md:p-7">
            <h2 className="font-sans text-2xl font-semibold tracking-[-0.05em] text-[#171411]">
              Contact
            </h2>
            <p className="mt-3 font-sans text-sm leading-relaxed text-[#171411]/68 md:text-base">
              For privacy questions, corrections, or data requests, contact
              Panache Foundation support on WhatsApp at{" "}
              <span className="font-semibold text-[#171411]">
                {PANACHE_SUPPORT_WHATSAPP_NUMBER}
              </span>
              .
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
              >
                <a href={PANACHE_SUPPORT_WHATSAPP_HREF} target="_blank" rel="noreferrer">
                  Contact Support
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-black/12 bg-white px-7 font-sans text-sm font-semibold text-[#171411]"
              >
                <Link to="/">Back Home</Link>
              </Button>
            </div>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;

import { useRef } from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  CYESInnerHero,
  CYESSectionIntro,
  cyesInputClasses,
  cyesSurfaceClasses,
  cyesTextareaClasses,
} from "@/components/cyes/CYESPageShell";
import {
  ExpoPageHero,
  ExpoSidebarCard,
  ExpoSurface,
  expoInputClasses,
  expoTextareaClasses,
} from "@/components/registration/ExpoPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import panacheBackdrop from "@/assets/PanachExpo.jpeg";
import cyesBackdrop from "@/assets/CYESBackground.jpeg";
import cyesEvent from "@/assets/CYES.jpeg";
import speaker1 from "@/assets/speaker1.jpeg";
import speaker4 from "@/assets/speaker4.jpeg";
import speaker5 from "@/assets/speaker5.jpeg";
import { ArrowUpRight, Clock3, Mail, MapPin, Phone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const PANACHE_EMAIL = "thepanacheexpo@gmail.com";
const CYES_EMAIL = "info.cyescyecdawards@gmail.com";
const CONTACT_PHONE = "+237 673 594 931";
const CONTACT_LOCATION = "Buea, Cameroon";

const cyesContactCards = [
  {
    image: speaker4,
    alt: "CYES guest portrait",
    className: "left-[18%] top-[8%] z-20 w-[41%] rotate-[-4deg]",
  },
  {
    image: cyesBackdrop,
    alt: "CYES background card",
    className: "left-[60%] top-[16%] z-10 w-[29%] rotate-[7deg]",
  },
  {
    image: speaker1,
    alt: "CYES speaker portrait",
    className: "left-[30%] top-[60%] z-30 w-[24%] rotate-[-8deg]",
  },
  {
    image: cyesEvent,
    alt: "CYES event collage",
    className: "left-[54%] top-[56%] z-20 w-[33%] rotate-[9deg]",
  },
];

const panacheSocialPoints = [
  "Registration and ticketing support for attendees, exhibitors, and contestants.",
  "Brand, sponsor, and partnership discussions for activations and collaborations.",
  "General programme questions, media requests, and speaker or guest enquiries.",
];

export const ContactPage = () => {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const location = useLocation();
  const isCyesRoute = location.pathname.startsWith("/cyes");
  const targetEmail = isCyesRoute ? CYES_EMAIL : PANACHE_EMAIL;
  const brandName = isCyesRoute ? "CYES" : "Panache Expo";
  const heroImage = isCyesRoute ? cyesBackdrop : panacheBackdrop;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const subjectVal = formData.get("subject") as string;
    const message = formData.get("message") as string;

    const subject = encodeURIComponent(`${brandName} Contact Form: ${subjectVal}`);
    const body = encodeURIComponent(
      `CONTACT FORM SUBMISSION\n\n` +
        `Name: ${firstName} ${lastName}\n` +
        `Email: ${email}\n` +
        `Subject: ${subjectVal}\n\n` +
        `Message:\n${message}`,
    );

    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;

    toast({
      title: "Message prepared",
      description:
        "Your email client will open. Send the draft to complete your enquiry.",
    });

    formRef.current?.reset();
  };

  if (isCyesRoute) {
    return (
      <div className="min-h-screen bg-[#f7f8f3] text-[#171411]">
        <Header />

        <main className="pb-20 md:pb-24">
          <CYESInnerHero
            eyebrow="Contact CYES"
            title={
              <>
                Start the right
                <br />
                <span className="font-display text-[#156D3B]">
                  conversation early
                </span>
              </>
            }
            description="Questions about registration, awards, partnerships, speaking, media, or community visibility? Send one clear note and the CYES team will direct it quickly."
            actions={
              <>
                <a
                  href={`mailto:${targetEmail}`}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#171411]/92"
                >
                  Email the team
                </a>
                <Link
                  to="/cyes/register"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white/80 px-7 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-white"
                >
                  Register for CYES
                </Link>
              </>
            }
            chips={[
              {
                label: "Email",
                value: targetEmail,
                accentClassName: "text-[#156D3B]",
              },
              {
                label: "Phone",
                value: CONTACT_PHONE,
                accentClassName: "text-[#1875D2]",
              },
              {
                label: "Typical reply",
                value: "24-48 hours",
                accentClassName: "text-[#CC2129]",
              },
            ]}
            cards={cyesContactCards}
            mobileImage={cyesEvent}
            mobileImageAlt="CYES event collage"
            mobileImageClassName="rotate-[10deg]"
          />

          <section className="mx-auto mt-16 max-w-6xl px-6 md:px-24">
            <CYESSectionIntro
              eyebrow="Direct contact"
              title={
                <>
                  Everything you need
                  <span className="block font-display">is here</span>
                </>
              }
              description="The goal is simple: make it easy to reach the right person with the right message, whether you are registering, partnering, covering the summit, or looking for awards clarification."
            />

            <div className="mt-10 grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
              <div className="space-y-4">
                <div className={cyesSurfaceClasses + " px-6 py-7"}>
                  <Mail className="h-8 w-8 text-[#156D3B]" />
                  <h3 className="mt-5 font-sans text-[1.28rem] font-semibold leading-[1.05] tracking-[-0.05em] text-[#171411]">
                    Email
                  </h3>
                  <p className="mt-3 font-sans text-[1rem] leading-relaxed text-[#171411]/72">
                    {targetEmail}
                  </p>
                </div>

                <div className={cyesSurfaceClasses + " px-6 py-7"}>
                  <Phone className="h-8 w-8 text-[#1875D2]" />
                  <h3 className="mt-5 font-sans text-[1.28rem] font-semibold leading-[1.05] tracking-[-0.05em] text-[#171411]">
                    Phone
                  </h3>
                  <p className="mt-3 font-sans text-[1rem] leading-relaxed text-[#171411]/72">
                    {CONTACT_PHONE}
                  </p>
                </div>

                <div className={cyesSurfaceClasses + " px-6 py-7"}>
                  <MapPin className="h-8 w-8 text-[#CC2129]" />
                  <h3 className="mt-5 font-sans text-[1.28rem] font-semibold leading-[1.05] tracking-[-0.05em] text-[#171411]">
                    Base
                  </h3>
                  <p className="mt-3 font-sans text-[1rem] leading-relaxed text-[#171411]/72">
                    {CONTACT_LOCATION}
                  </p>
                </div>

                <div className={cyesSurfaceClasses + " px-6 py-7"}>
                  <Clock3 className="h-8 w-8 text-[#156D3B]" />
                  <h3 className="mt-5 font-sans text-[1.28rem] font-semibold leading-[1.05] tracking-[-0.05em] text-[#171411]">
                    Best reasons to write
                  </h3>
                  <div className="mt-4 space-y-3">
                    {[
                      "Registration help and attendance questions",
                      "Awards, jury, and nomination clarification",
                      "Partnership, media, and speaker enquiries",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-[1.2rem] border border-black/8 bg-white/80 px-4 py-3"
                      >
                        <p className="font-sans text-sm leading-relaxed text-[#171411]/72">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={cyesSurfaceClasses + " px-6 py-7 md:px-8 md:py-8"}>
                <div>
                  <p className="font-sans text-[0.92rem] font-semibold uppercase tracking-[0.08em] text-[#156D3B]">
                    Contact form
                  </p>
                  <h2 className="mt-4 font-sans text-[clamp(2rem,4vw,3rem)] font-semibold leading-[0.93] tracking-[-0.065em] text-[#171411]">
                    Tell us what you need and we will route it correctly.
                  </h2>
                </div>

                <form ref={formRef} className="mt-8 space-y-7" onSubmit={handleSubmit}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label
                        htmlFor="firstName"
                        className="font-sans text-sm font-semibold text-[#171411]"
                      >
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        className={cyesInputClasses}
                        placeholder="Your first name"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="lastName"
                        className="font-sans text-sm font-semibold text-[#171411]"
                      >
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        className={cyesInputClasses}
                        placeholder="Your last name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-[1fr_0.84fr]">
                    <div>
                      <Label
                        htmlFor="email"
                        className="font-sans text-sm font-semibold text-[#171411]"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        className={cyesInputClasses}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="subject"
                        className="font-sans text-sm font-semibold text-[#171411]"
                      >
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        className={cyesInputClasses}
                        placeholder="What is this about?"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="message"
                      className="font-sans text-sm font-semibold text-[#171411]"
                    >
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      className={cyesTextareaClasses}
                      placeholder="Tell us what you need, which part of CYES it relates to, and any deadline we should know."
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-4 border-t border-black/8 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 text-sm text-[#171411]/58">
                      <Clock3 className="h-4 w-4 text-[#156D3B]" />
                      <span>We usually reply within 24-48 hours.</span>
                    </div>
                    <Button
                      type="submit"
                      className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
                    >
                      Send enquiry
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </main>

        <Footer variant="cyes" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />

      <ExpoPageHero
        eyebrow="Reach the Panache team"
        title={
          <>
            Let&apos;s Build Your
            <br />
            <span className="font-display text-[#f4e93f]">
              Next Conversation
            </span>
          </>
        }
        description="Questions about registration, partnerships, media, or programming? Send a note and the Panache Expo team will point you in the right direction."
        image={heroImage}
        panelLabel="Contact Flow"
        panelTitle="One message, direct follow-up."
        panelDescription="Use the form or contact details below. We normally review new enquiries quickly and route each one to the right team."
        panelItems={[
          { label: "Primary Email", value: targetEmail },
          { label: "Based In", value: CONTACT_LOCATION },
          { label: "Typical Reply", value: "Within 24-48 hours" },
        ]}
      />

      <section className="px-6 pb-20 pt-10 md:pb-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.84fr,1.16fr]">
          <ExpoSidebarCard
            eyebrow="Contact Points"
            title="The right conversation starts here."
            description="We can help with registration support, exhibition questions, sponsorship discussions, speaking requests, and media or community opportunities for Panache Expo."
            points={panacheSocialPoints}
            footer={
              <div className="space-y-4">
                <a
                  href={`mailto:${targetEmail}`}
                  className="flex items-center justify-between rounded-[1.2rem] border border-black/10 bg-white/72 px-4 py-3 transition-colors hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-[#8241B6]" />
                    <span className="font-sans text-sm text-[#171411]/78">
                      Email
                    </span>
                  </div>
                  <span className="font-sans text-sm font-semibold text-[#171411]">
                    {targetEmail}
                  </span>
                </a>
                <a
                  href={`tel:${CONTACT_PHONE.replace(/\s+/g, "")}`}
                  className="flex items-center justify-between rounded-[1.2rem] border border-black/10 bg-white/72 px-4 py-3 transition-colors hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-[#8241B6]" />
                    <span className="font-sans text-sm text-[#171411]/78">
                      Phone
                    </span>
                  </div>
                  <span className="font-sans text-sm font-semibold text-[#171411]">
                    {CONTACT_PHONE}
                  </span>
                </a>
                <div className="rounded-[1.2rem] border border-black/10 bg-white/72 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-[#8241B6]" />
                    <div>
                      <p className="font-sans text-sm font-semibold text-[#171411]">
                        Visit & operations
                      </p>
                      <p className="mt-1 font-sans text-sm leading-relaxed text-[#171411]/66">
                        {CONTACT_LOCATION}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            }
          />

          <ExpoSurface>
            <div className="flex flex-col gap-8">
              <div>
                <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                  Contact Form
                </p>
                <h2 className="mt-3 font-sans text-[clamp(2rem,3vw,2.9rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                  Tell us what you need.
                </h2>
                <p className="mt-3 max-w-2xl font-sans text-[0.98rem] leading-relaxed text-[#171411]/68">
                  Keep it concise if you want a quick answer, or add detail if you
                  need sponsorship, media, or programme support.
                </p>
              </div>

              <form ref={formRef} className="space-y-7" onSubmit={handleSubmit}>
                <div className="grid gap-7 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="firstName"
                      className="font-sans text-sm font-semibold text-[#171411]"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      className={expoInputClasses}
                      placeholder="Your first name"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="lastName"
                      className="font-sans text-sm font-semibold text-[#171411]"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      className={expoInputClasses}
                      placeholder="Your last name"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-7 md:grid-cols-[1fr,0.78fr]">
                  <div>
                    <Label
                      htmlFor="email"
                      className="font-sans text-sm font-semibold text-[#171411]"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      className={expoInputClasses}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="subject"
                      className="font-sans text-sm font-semibold text-[#171411]"
                    >
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      className={expoInputClasses}
                      placeholder="What can we help with?"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="message"
                    className="font-sans text-sm font-semibold text-[#171411]"
                  >
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    className={expoTextareaClasses}
                    placeholder="Tell us about your enquiry, the event you are interested in, and any deadlines we should know."
                    required
                  />
                </div>

                <div className="flex flex-col gap-4 border-t border-black/8 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 text-sm text-[#171411]/58">
                    <Clock3 className="h-4 w-4 text-[#8241B6]" />
                    <span>We usually reply within 24-48 hours.</span>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white shadow-none hover:bg-[#171411]/92"
                    >
                      Send Enquiry
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="h-12 rounded-full border-black/12 bg-white/72 px-6 font-sans text-sm font-semibold text-[#171411] hover:bg-white"
                    >
                      <Link to="/panache-expo/register">
                        View Registration
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </ExpoSurface>
        </div>
      </section>

      <Footer />
    </div>
  );
};

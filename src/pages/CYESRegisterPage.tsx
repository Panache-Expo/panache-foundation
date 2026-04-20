import { useState } from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  CYESInnerHero,
  CYESSectionIntro,
  cyesInputClasses,
  cyesSelectTriggerClasses,
  cyesSurfaceClasses,
  cyesTextareaClasses,
} from "@/components/cyes/CYESPageShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import cyesEvent from "@/assets/CYES.jpeg";
import speaker1 from "@/assets/speaker1.jpeg";
import speaker2 from "@/assets/speaker2.jpeg";
import speaker3 from "@/assets/speaker3.jpeg";
import {
  Calendar,
  CheckCircle2,
  Lightbulb,
  MapPin,
  Mic,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const TARGET_EMAIL = "info.cyescyecdawards@gmail.com";

const topics = [
  "Entrepreneurship & Business Growth",
  "Digital Economy & Personal Branding",
  "Technology, Innovation and AI",
  "Leadership & National Development",
];

const registrationHeroCards = [
  {
    image: speaker1,
    alt: "Featured speaker portrait",
    className: "left-[18%] top-[8%] z-20 w-[41%] rotate-[-4deg]",
  },
  {
    image: speaker2,
    alt: "Young entrepreneur portrait",
    className: "left-[61%] top-[18%] z-10 w-[28%] rotate-[7deg]",
  },
  {
    image: speaker3,
    alt: "CYES support portrait",
    className: "left-[29%] top-[60%] z-30 w-[24%] rotate-[-8deg]",
  },
  {
    image: cyesEvent,
    alt: "CYES event atmosphere",
    className: "left-[55%] top-[56%] z-20 w-[33%] rotate-[9deg]",
  },
];

const registrationValueCards = [
  {
    icon: Mic,
    title: "Live sessions and keynotes",
    description:
      "Join the summit floor, keynote conversations, and practical discussions driving entrepreneurship forward.",
  },
  {
    icon: Users,
    title: "Real networking",
    description:
      "Meet founders, operators, students, partners, and mentors in a room built for meaningful connection.",
  },
  {
    icon: Lightbulb,
    title: "Focused tracks",
    description:
      "Choose the topic area most relevant to you so your registration immediately aligns with the summit flow.",
  },
];

export const CYESRegisterPage = () => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [newsletterSubscription, setNewsletterSubscription] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast({
        title: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTopic) {
      toast({
        title: "Please select a topic",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const details = formData.get("details") as string;

    const subject = encodeURIComponent(`CYES Summit Registration - ${selectedTopic}`);
    const body = encodeURIComponent(
      `CYES SUMMIT REGISTRATION\n\n` +
        `Name: ${firstName} ${lastName}\n` +
        `Email: ${email}\n` +
        `Phone: ${phone}\n` +
        `Topic: ${selectedTopic}\n` +
        `Additional Details: ${details || "None"}\n` +
        `Newsletter: ${newsletterSubscription ? "Yes" : "No"}\n`,
    );

    window.location.href = `mailto:${TARGET_EMAIL}?subject=${subject}&body=${body}`;
    toast({
      title: "Registration prepared",
      description:
        "Your email client will open. Send the draft to complete your registration.",
    });

    e.currentTarget.reset();
    setAgreedToTerms(false);
    setNewsletterSubscription(false);
    setSelectedTopic("");
  };

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-[#171411]">
      <Header />

      <main className="pb-20 md:pb-24">
        <CYESInnerHero
          eyebrow="CYES registration"
          title={
            <>
              Reserve your place
              <br />
              <span className="font-display text-[#156D3B]">
                inside the summit
              </span>
            </>
          }
          description="Register for the Cameroon Youth Entrepreneurial Summit and Awards, choose the conversation stream most relevant to you, and enter the room prepared."
          actions={
            <>
              <a
                href="#cyes-registration-form"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#171411]/92"
              >
                Start registration
              </a>
              <Link
                to="/cyes/contact"
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white/80 px-7 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-white"
              >
                Contact the team
              </Link>
            </>
          }
          chips={[
            {
              label: "Date",
              value: "16 July 2026",
              accentClassName: "text-[#156D3B]",
            },
            {
              label: "Venue",
              value: "Buea, Cameroon",
              accentClassName: "text-[#1875D2]",
            },
            {
              label: "Tracks",
              value: "4 focus areas",
              accentClassName: "text-[#CC2129]",
            },
          ]}
          cards={registrationHeroCards}
          mobileImage={cyesEvent}
          mobileImageAlt="CYES event stage"
          mobileImageClassName="rotate-[14deg]"
        />

        <section className="mx-auto mt-16 max-w-6xl px-6 md:px-24">
          <CYESSectionIntro
            eyebrow="Registration value"
            title={
              <>
                What your
                <span className="block font-display">registration unlocks</span>
              </>
            }
            description="CYES should feel organised from the first click. Registration is not just about attendance. It is how you enter the sessions, people, and ideas most relevant to your path."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {registrationValueCards.map((card) => {
              const Icon = card.icon;

              return (
                <article key={card.title} className={cyesSurfaceClasses + " px-6 py-7"}>
                  <Icon className="h-9 w-9 text-[#156D3B]" />
                  <h3 className="mt-6 font-sans text-[1.28rem] font-semibold leading-[1.05] tracking-[-0.05em] text-[#171411]">
                    {card.title}
                  </h3>
                  <p className="mt-4 font-sans text-[0.98rem] leading-relaxed text-[#171411]/72">
                    {card.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section
          id="cyes-registration-form"
          className="mx-auto mt-20 max-w-6xl px-6 md:px-24"
        >
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div className={cyesSurfaceClasses + " px-6 py-7 md:px-7 md:py-8"}>
              <p className="font-sans text-[0.92rem] font-semibold uppercase tracking-[0.08em] text-[#156D3B]">
                Before you submit
              </p>
              <h2 className="mt-4 font-sans text-[clamp(2rem,4vw,3rem)] font-semibold leading-[0.93] tracking-[-0.065em] text-[#171411]">
                Enter with clarity.
              </h2>
              <p className="mt-4 font-sans text-[1rem] leading-relaxed text-[#171411]/72">
                Choose the topic that best matches your interests. We use this to
                understand how people are entering the summit and what kind of
                value they are looking for.
              </p>

              <div className="mt-8 space-y-3">
                {topics.map((topic, index) => (
                  <div
                    key={topic}
                    className="rounded-[1.3rem] border border-black/8 bg-white/80 px-4 py-4"
                  >
                    <p className="font-sans text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[#171411]/42">
                      Track {index + 1}
                    </p>
                    <p className="mt-2 font-sans text-[1rem] font-semibold leading-[1.2] tracking-[-0.03em] text-[#171411]">
                      {topic}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[1.2rem] border border-black/8 bg-white/80 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-[#156D3B]" />
                    <span className="font-sans text-sm text-[#171411]/76">
                      16 July 2026
                    </span>
                  </div>
                </div>
                <div className="rounded-[1.2rem] border border-black/8 bg-white/80 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-[#1875D2]" />
                    <span className="font-sans text-sm text-[#171411]/76">
                      Buea, Cameroon
                    </span>
                  </div>
                </div>
                <div className="rounded-[1.2rem] border border-black/8 bg-white/80 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[#CC2129]" />
                    <span className="font-sans text-sm text-[#171411]/76">
                      Summit and awards
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={cyesSurfaceClasses + " px-6 py-7 md:px-8 md:py-8"}>
              <div>
                <p className="font-sans text-[0.92rem] font-semibold uppercase tracking-[0.08em] text-[#156D3B]">
                  Registration form
                </p>
                <h2 className="mt-4 font-sans text-[clamp(2rem,4vw,3rem)] font-semibold leading-[0.93] tracking-[-0.065em] text-[#171411]">
                  Confirm your details and join the room.
                </h2>
              </div>

              <form className="mt-8 space-y-7" onSubmit={handleSubmit}>
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

                <div className="grid gap-6 md:grid-cols-2">
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
                      htmlFor="phone"
                      className="font-sans text-sm font-semibold text-[#171411]"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      className={cyesInputClasses}
                      placeholder="+237 6XX XXX XXX"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="font-sans text-sm font-semibold text-[#171411]">
                    What are you registering for?
                  </Label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger className={cyesSelectTriggerClasses}>
                      <SelectValue placeholder="Select a summit track" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="details"
                    className="font-sans text-sm font-semibold text-[#171411]"
                  >
                    Additional details
                  </Label>
                  <Textarea
                    id="details"
                    name="details"
                    className={cyesTextareaClasses}
                    placeholder="Share anything the team should know about your attendance or the conversation you want to join."
                  />
                </div>

                <div className="space-y-4 rounded-[1.4rem] border border-black/8 bg-white/76 px-5 py-5">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) =>
                        setAgreedToTerms(checked === true)
                      }
                      className="mt-1"
                    />
                    <Label
                      htmlFor="terms"
                      className="font-sans text-sm leading-relaxed text-[#171411]/72"
                    >
                      I agree to the terms and conditions and understand this
                      registration is submitted through email confirmation.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="newsletter"
                      checked={newsletterSubscription}
                      onCheckedChange={(checked) =>
                        setNewsletterSubscription(checked === true)
                      }
                      className="mt-1"
                    />
                    <Label
                      htmlFor="newsletter"
                      className="font-sans text-sm leading-relaxed text-[#171411]/72"
                    >
                      Keep me updated with future CYES announcements and summit
                      communication.
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-full bg-[#171411] font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
                >
                  Submit registration
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CYESRegisterPage;

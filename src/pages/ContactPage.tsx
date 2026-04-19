import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
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
import { ArrowUpRight, Clock3, Mail, MapPin, Phone } from "lucide-react";
import { useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const PANACHE_EMAIL = "thepanacheexpo@gmail.com";
const CYES_EMAIL = "info.cyescyecdawards@gmail.com";
const CONTACT_PHONE = "+237 673 594 931";
const CONTACT_LOCATION = "Buea, Cameroon";

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

  return (
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />

      <ExpoPageHero
        eyebrow={isCyesRoute ? "Reach the CYES team" : "Reach the Panache team"}
        title={
          <>
            Let&apos;s Build Your
            <br />
            <span className="font-display text-[#f4e93f]">
              Next Conversation
            </span>
          </>
        }
        description={`Questions about registration, partnerships, media, or programming? Send a note and the ${brandName} team will point you in the right direction.`}
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
            description={`We can help with registration support, exhibition questions, sponsorship discussions, speaking requests, and media or community opportunities for ${brandName}.`}
            points={[
              "Registration and ticketing support for attendees, exhibitors, and contestants.",
              "Brand, sponsor, and partnership discussions for activations and collaborations.",
              "General programme questions, media requests, and speaker or guest enquiries.",
            ]}
            footer={
              <div className="space-y-4">
                <a
                  href={`mailto:${targetEmail}`}
                  className="flex items-center justify-between rounded-[1.2rem] border border-black/10 bg-white/72 px-4 py-3 transition-colors hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-[#8241B6]" />
                    <span className="font-sans text-sm text-[#171411]/78">Email</span>
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
                    <span className="font-sans text-sm text-[#171411]/78">Phone</span>
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
                    <Label htmlFor="firstName" className="font-sans text-sm font-semibold text-[#171411]">
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
                    <Label htmlFor="lastName" className="font-sans text-sm font-semibold text-[#171411]">
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
                    <Label htmlFor="email" className="font-sans text-sm font-semibold text-[#171411]">
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
                    <Label htmlFor="subject" className="font-sans text-sm font-semibold text-[#171411]">
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
                  <Label htmlFor="message" className="font-sans text-sm font-semibold text-[#171411]">
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
                      <Link to={isCyesRoute ? "/cyes/register" : "/panache-expo/register"}>
                        {isCyesRoute ? "Register for CYES" : "View Registration"}
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

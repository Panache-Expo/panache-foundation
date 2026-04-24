import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  ExpoPageHero,
  ExpoSidebarCard,
  ExpoSurface,
  expoInputClasses,
  expoSelectTriggerClasses,
  expoTextareaClasses,
} from "@/components/registration/ExpoPageShell";
import { Button } from "@/components/ui/button";
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
import PanacheAwards from "@/assets/PanacheAwards.jpeg";
import cliqEmpireLogo from "@/assets/cliq-empire-logo.jpg";
import edith from "@/assets/edith.png";
import florence2026 from "@/assets/florence-2026-optimized.jpg";
import kellie from "@/assets/kellie.png";
import nkafu from "@/assets/nkafu.png";
import nkeng from "@/assets/nkeng.jpeg";
import prince from "@/assets/prince.jpeg";
import victor from "@/assets/victor.png";
import { ArrowRight, Award, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const PANACHE_EMAIL = "thepanacheexpo@gmail.com";

const juryMembers = [
  {
    name: "Prince Enobi Mykel",
    title: "Founder / President, CIMFEST",
    photo: prince,
  },
  {
    name: "Kellie Peace",
    title: "Medical Aesthetician and CEO, Kellie Peace Empire",
    photo: kellie,
  },
  {
    name: "Dr Edith F. Gibson",
    title: "Founder and President, TDRTI",
    photo: edith,
  },
  {
    name: "Nkafu Atemnkeng Sulet",
    title: "Chief Creative Director, Sulet Noir",
    photo: nkafu,
  },
  {
    name: "Barr. Mafany Victor Ngando",
    title: "Founder / CEO, Kinsmen Advocates Law Firm",
    photo: victor,
  },
  {
    name: "Dr Nkeng Stephens",
    title: "Film Producer, Cinematographer, Director, Colorist",
    photo: nkeng,
  },
  {
    name: "Florence Tubuoh Nabi",
    title: "Founder / CEO, Nabi's Maq and Beauty Space",
    photo: florence2026,
  },
];

const categories = [
  {
    value: "Barber of the Year",
    description:
      "Must demonstrate consistent professional barbering excellence, client base growth, technical skill, and visible industry impact.",
  },
  {
    value: "Hairstylist of the Year",
    description:
      "Must show creativity, professional service delivery, portfolio consistency, and strong client or event presence.",
  },
  {
    value: "Braider of the Year",
    description:
      "Must demonstrate advanced braiding techniques, originality, consistency, and strong cultural or market relevance.",
  },
  {
    value: "Makeup Artist of the Year (Including SFX)",
    description:
      "Must show versatility in beauty and/or special effects makeup, portfolio strength, and professional recognition.",
  },
  {
    value: "Nail Artist of the Year",
    description:
      "Must demonstrate creativity, hygiene standards, technique precision, and strong visual portfolio.",
  },
  {
    value: "Lash Artist of the Year",
    description:
      "Must show expertise in lash extensions, design precision, safety standards, and consistent client results.",
  },
  {
    value: "Wig Installation Specialist of the Year",
    description:
      "Must demonstrate advanced wig construction or installation techniques, finishing quality, and professional delivery.",
  },
  {
    value: "Fashion Designer of the Year",
    description:
      "Must show original collections, runway or commercial presence, brand identity, and creative consistency.",
  },
  {
    value: "Emerging Fashion Designer of the Year",
    description:
      "Must have less than 5 years of active professional practice and show strong growth trajectory and innovation.",
  },
  {
    value: "Model of the Year",
    description:
      "Must demonstrate professional modeling portfolio, runway/editorial experience, brand collaborations, and industry conduct.",
  },
  {
    value: "Fashion Stylist of the Year",
    description:
      "Must show creative direction skills, styling portfolio, media or event presence, and industry impact.",
  },
  {
    value: "Beauty Educator of the Year",
    description:
      "Must have trained students professionally through workshops, academies, or masterclasses with verifiable impact.",
  },
  {
    value: "Content Creator of the Year",
    description:
      "Must produce consistent beauty or fashion content with measurable engagement, originality, and industry influence.",
  },
  {
    value: "Beauty Brand of the Year",
    description:
      "Must operate as a registered or structured beauty-related brand with visible market presence and product or service consistency.",
  },
  {
    value: "Creative Entrepreneur of the Year",
    description:
      "Must demonstrate business leadership, growth strategy, employment or collaboration impact, and innovation.",
  },
  {
    value: "Emerging Creative Talent of the Year",
    description:
      "Must be within the early professional stage and show strong industry growth and recognition.",
  },
  {
    value: "Creative Photographer of the Year",
    description:
      "Must have demonstrated excellence in fashion or beauty photography within the last 24 months, supported by a strong portfolio with clear industry impact.",
  },
];

const PanacheNominationsPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nomineeName: "",
    nomineeStageName: "",
    nomineeEmail: "",
    nomineePhone: "",
    category: "",
    nominatorName: "",
    nominatorStageName: "",
    nominatorEmail: "",
    nominatorPhone: "",
    reason: "",
  });

  const selectedCategoryInfo = categories.find(
    (category) => category.value === formData.category,
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !formData.nomineeName ||
      !formData.nomineeStageName ||
      !formData.nomineePhone ||
      !formData.category ||
      !formData.nominatorName ||
      !formData.nominatorStageName ||
      !formData.nominatorEmail ||
      !formData.nominatorPhone ||
      !formData.reason
    ) {
      toast({
        title: "Missing fields",
        description:
          "Please add all full names, stage names, WhatsApp numbers, and your nomination reason before continuing.",
        variant: "destructive",
      });
      return;
    }

    const subject = encodeURIComponent(
      `Panache D'or Nomination - ${formData.category}`,
    );
    const body = encodeURIComponent(
      `PANACHE D'OR NOMINATION\n\n` +
        `Category: ${formData.category}\n\n` +
        `--- Nominee Details ---\n` +
        `Full Name: ${formData.nomineeName}\n` +
        `Stage / Brand Name: ${formData.nomineeStageName}\n` +
        `Email: ${formData.nomineeEmail}\n` +
        `WhatsApp Number: ${formData.nomineePhone}\n\n` +
        `--- Nominator Details ---\n` +
        `Full Name: ${formData.nominatorName}\n` +
        `Stage / Brand Name: ${formData.nominatorStageName}\n` +
        `Email: ${formData.nominatorEmail}\n` +
        `WhatsApp Number: ${formData.nominatorPhone}\n\n` +
        `--- Reason for Nomination ---\n` +
        `${formData.reason}`,
    );

    window.location.href = `mailto:${PANACHE_EMAIL}?subject=${subject}&body=${body}`;

    toast({
      title: "Nomination prepared",
      description:
        "Your email client will open with the nomination details. Send the draft to complete your submission.",
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />

      <ExpoPageHero
        eyebrow="Panache D'or nominations"
        title={
          <>
            Panache D&apos;or
            <br />
            <span className="font-display text-[#f4e93f]">Nominations</span>
          </>
        }
        description="Nominate the beauty, fashion, and creative professionals whose work has truly moved the industry forward. The form starts here, and the final submission is completed through your email client."
        image={PanacheAwards}
        panelLabel="Nomination notes"
        panelTitle="Good entries are specific."
        panelDescription="The clearest nominations name one strong category, explain visible achievements from the last 24 months, and give enough detail for the jury to understand the nominee's impact."
        panelItems={[
          { label: "Achievements window", value: "Last 24 months" },
          { label: "Review", value: "Panache jury committee" },
          { label: "Submission route", value: "Prepared email draft" },
        ]}
      />

      <main className="px-6 pb-20 pt-10 md:pb-24">
        <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.84fr,1.16fr]">
          <ExpoSidebarCard
            eyebrow="Before you nominate"
            title="Help the jury read the work clearly."
            description="Panache D'or is strongest when nominations feel intentional. Choose one category, explain why the nominee stands out, and keep the reason rooted in visible professional work."
            points={[
              "Nominees should be actively practicing within beauty, fashion, or the wider creative industry.",
              "Achievements should fall within the last 24 months unless the category states otherwise.",
              "Nominees should be able to provide portfolio proof, public work, or strong documentation if requested.",
              "Shortlisted nominees may be asked to confirm participation or submit more supporting material.",
            ]}
            footer={
              <div className="space-y-3">
                <div className="rounded-[1.25rem] border border-black/10 bg-white/74 px-4 py-4">
                  <p className="font-sans text-sm font-semibold text-[#171411]">
                    Submission method
                  </p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/66">
                    This form prepares a structured email draft to{" "}
                    <span className="font-semibold text-[#171411]">
                      {PANACHE_EMAIL}
                    </span>
                    .
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 w-full rounded-full border-black/12 bg-white/74 font-sans text-sm font-semibold text-[#171411] hover:bg-white"
                >
                  <Link to="/panache-expo/panache-dor">
                    View winners archive
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            }
          />

          <ExpoSurface>
            <div>
              <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                Nomination form
              </p>
              <h2 className="mt-3 font-sans text-[clamp(2rem,3vw,2.9rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                Nominate someone whose work deserves a proper spotlight.
              </h2>
            </div>

            <form className="mt-8 space-y-7" onSubmit={handleSubmit}>
              <div>
                <Label
                  htmlFor="category"
                  className="font-sans text-sm font-semibold text-[#171411]"
                >
                  Award category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((current) => ({ ...current, category: value }))
                  }
                >
                  <SelectTrigger
                    id="category"
                    className={expoSelectTriggerClasses}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedCategoryInfo ? (
                  <div className="mt-3 rounded-[1.25rem] border border-black/8 bg-[#f8f2e8] px-4 py-4">
                    <p className="font-sans text-sm leading-relaxed text-[#171411]/72">
                      <span className="font-semibold text-[#171411]">
                        Eligibility:
                      </span>{" "}
                      {selectedCategoryInfo.description}
                    </p>
                  </div>
                ) : null}
              </div>

              <div>
                <p className="font-sans text-[0.92rem] font-semibold uppercase tracking-[0.08em] text-[#8241B6]">
                  Nominee details
                </p>
                <div className="mt-5 grid gap-6 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="nomineeName"
                      className="font-sans text-sm font-semibold text-[#171411]"
                    >
                      Full legal name
                    </Label>
                    <Input
                      id="nomineeName"
                      className={expoInputClasses}
                      value={formData.nomineeName}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          nomineeName: event.target.value,
                        }))
                      }
                      placeholder="Nominee's full name"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="nomineeStageName"
                      className="font-sans text-sm font-semibold text-[#171411]"
                    >
                      Stage / brand / business name
                    </Label>
                    <Input
                      id="nomineeStageName"
                      className={expoInputClasses}
                      value={formData.nomineeStageName}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          nomineeStageName: event.target.value,
                        }))
                      }
                      placeholder="Nominee's public or brand name"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="nomineeEmail"
                      className="font-sans text-sm font-semibold text-[#171411]"
                    >
                      Email
                    </Label>
                    <Input
                      id="nomineeEmail"
                      type="email"
                      className={expoInputClasses}
                      value={formData.nomineeEmail}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          nomineeEmail: event.target.value,
                        }))
                      }
                      placeholder="Nominee's email"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label
                      htmlFor="nomineePhone"
                      className="font-sans text-sm font-semibold text-[#171411]"
                    >
                      WhatsApp number
                    </Label>
                    <Input
                      id="nomineePhone"
                      className={expoInputClasses}
                      value={formData.nomineePhone}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          nomineePhone: event.target.value,
                        }))
                      }
                      placeholder="Nominee's WhatsApp number"
                    />
                    <p className="mt-2 font-sans text-xs leading-relaxed text-[#171411]/56">
                      Use the nominee's active WhatsApp number in case they are shortlisted.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-sans text-[0.92rem] font-semibold uppercase tracking-[0.08em] text-[#8241B6]">
                  Your details
                </p>
                <div className="mt-5 grid gap-6 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="nominatorName"
                      className="font-sans text-sm font-semibold text-[#171411]"
                    >
                      Your full name
                    </Label>
                    <Input
                      id="nominatorName"
                      className={expoInputClasses}
                      value={formData.nominatorName}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          nominatorName: event.target.value,
                        }))
                      }
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="nominatorStageName"
                      className="font-sans text-sm font-semibold text-[#171411]"
                    >
                      Your stage / brand name
                    </Label>
                    <Input
                      id="nominatorStageName"
                      className={expoInputClasses}
                      value={formData.nominatorStageName}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          nominatorStageName: event.target.value,
                        }))
                      }
                      placeholder="Use your public name, brand name, or repeat your full name"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="nominatorEmail"
                      className="font-sans text-sm font-semibold text-[#171411]"
                    >
                      Your email
                    </Label>
                    <Input
                      id="nominatorEmail"
                      type="email"
                      className={expoInputClasses}
                      value={formData.nominatorEmail}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          nominatorEmail: event.target.value,
                        }))
                      }
                      placeholder="Your email address"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="nominatorPhone"
                      className="font-sans text-sm font-semibold text-[#171411]"
                    >
                      Your WhatsApp number
                    </Label>
                    <Input
                      id="nominatorPhone"
                      className={expoInputClasses}
                      value={formData.nominatorPhone}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          nominatorPhone: event.target.value,
                        }))
                      }
                      placeholder="Your WhatsApp number"
                    />
                    <p className="mt-2 font-sans text-xs leading-relaxed text-[#171411]/56">
                      The team may use this WhatsApp number for nomination clarification or follow-up.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="reason"
                  className="font-sans text-sm font-semibold text-[#171411]"
                >
                  Reason for nomination
                </Label>
                <Textarea
                  id="reason"
                  className={expoTextareaClasses}
                  value={formData.reason}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      reason: event.target.value,
                    }))
                  }
                  placeholder="Explain why this nominee deserves recognition and what they have done that makes them stand out."
                />
              </div>

              <div className="flex flex-col gap-4 border-t border-black/8 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 text-sm text-[#171411]/58">
                  <Sparkles className="mt-0.5 h-4 w-4 text-[#8241B6]" />
                  <span>
                    This form opens your email client to complete the submission. Include names exactly as they should appear publicly.
                  </span>
                </div>
                <Button
                  type="submit"
                  className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
                >
                  Prepare nomination email
                </Button>
              </div>
            </form>
          </ExpoSurface>
        </section>

        <section className="mx-auto mt-10 max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {juryMembers.map((member) => (
              <ExpoSurface key={member.name} className="h-full">
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[1.4rem] bg-[#efe9e2]">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-7 w-7 text-[#171411]/34" />
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#8241B6]">
                      Jury committee
                    </p>
                    <h2 className="mt-3 font-sans text-[1.2rem] font-semibold leading-[1.08] tracking-[-0.045em] text-[#171411]">
                      {member.name}
                    </h2>
                    <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/66">
                      {member.title}
                    </p>
                  </div>
                </div>
              </ExpoSurface>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-6xl">
          <ExpoSurface className="overflow-hidden">
            <div className="grid gap-8 lg:grid-cols-[0.82fr,1.18fr] lg:items-center">
              <div className="overflow-hidden rounded-[1.9rem] border border-black/8 bg-white">
                <img
                  src={cliqEmpireLogo}
                  alt="Cliq Empire logo"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                  Official sponsor
                </p>
                <h2 className="mt-3 font-sans text-[clamp(2rem,3vw,2.8rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                  Cliq Empire supports the 2026 awards cycle.
                </h2>
                <p className="mt-4 font-sans text-[1rem] leading-relaxed text-[#171411]/68">
                  Panache D&apos;or 2026 is proudly supported by Cliq Empire, a
                  Cameroon-based event organising, artist management, public
                  relations, and advertising company backing this year&apos;s
                  recognition platform.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="rounded-full border border-black/10 bg-white/74 px-4 py-2 font-sans text-sm font-medium text-[#171411]">
                    Official Panache D&apos;or sponsor
                  </span>
                  <span className="rounded-full border border-black/10 bg-white/74 px-4 py-2 font-sans text-sm font-medium text-[#171411]">
                    Cameroon
                  </span>
                </div>
              </div>
            </div>
          </ExpoSurface>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PanacheNominationsPage;

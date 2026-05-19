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
const PANACHE_DOR_NOMINATIONS_CLOSED = true;

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
    value: "Hair and Wig Specialist of the Year",
    description:
      "Must show creativity, professional hair service delivery, wig styling or installation skill, portfolio consistency, and strong client or event presence.",
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
    value: "Male Model of the Year",
    description:
      "Must demonstrate a strong professional modeling portfolio, runway or editorial experience, brand collaborations, consistency, and industry conduct.",
  },
  {
    value: "Female Model of the Year",
    description:
      "Must demonstrate a strong professional modeling portfolio, runway or editorial experience, brand collaborations, consistency, and industry conduct.",
  },
  {
    value: "Emerging Model of the Year",
    description:
      "Must be within the early professional modeling stage and show strong growth, visibility, discipline, and potential in the industry.",
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

const juryEvaluationItems = [
  "Impact",
  "Professionalism",
  "Creativity",
  "Consistency",
  "Contribution to their industry/community",
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
        description="Public nominations for the Panache D'or Awards 2026 are now closed. Submitted entries continue through review as the awards programme moves into the next stage."
        image={PanacheAwards}
        panelLabel="Nominations closed"
        panelTitle="The submission window has ended."
        panelDescription="No new public nominations are being accepted through the website or email draft flow. Existing entries remain part of the review cycle."
        panelItems={[
          { label: "Status", value: "Closed" },
          { label: "Next stage", value: "Review + shortlist" },
          { label: "Review", value: "Panache jury committee" },
        ]}
      />

      <main className="px-6 pb-20 pt-10 md:pb-24">
        <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.84fr,1.16fr]">
          <ExpoSidebarCard
            eyebrow="Nominations closed"
            title="No new Panache D'or nominations are being accepted."
            description="The public nomination window has ended. Submitted entries can still move through internal review, shortlist confirmation, and the wider awards cycle."
            points={[
              "The website form no longer opens email nomination drafts.",
              "Previously submitted nominations remain under Panache team review.",
              "Shortlisted nominees may still be contacted for confirmation or supporting material.",
              "For urgent award clarification, contact the Panache team directly.",
            ]}
            footer={
              <div className="space-y-3">
                <div className="rounded-[1.25rem] border border-black/10 bg-white/74 px-4 py-4">
                  <p className="font-sans text-sm font-semibold text-[#171411]">
                    Current status
                  </p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/66">
                    Public nominations are closed for the Panache D&apos;or
                    Awards 2026 cycle.
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
                <Button
                  asChild
                  variant="outline"
                  className="h-12 w-full rounded-full border-black/12 bg-white/74 font-sans text-sm font-semibold text-[#171411] hover:bg-white"
                >
                  <Link to="/panache-expo/contact">Contact the team</Link>
                </Button>
              </div>
            }
          />

          <ExpoSurface>
            <div>
              <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                Nomination status
              </p>
              <h2 className="mt-3 font-sans text-[clamp(2rem,3vw,2.9rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                The Panache D&apos;or nomination window is closed.
              </h2>
            </div>

            {PANACHE_DOR_NOMINATIONS_CLOSED ? (
              <div className="mt-8 space-y-5">
                <div className="rounded-[1.45rem] border border-[#8241B6]/18 bg-[#f8f2e8] px-5 py-5">
                  <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.22em] text-[#8241B6]">
                    Closed
                  </p>
                  <p className="mt-3 font-sans text-[1.1rem] font-semibold leading-relaxed tracking-[-0.03em] text-[#171411]">
                    Public nominations for Panache D&apos;or Awards 2026 are no
                    longer open.
                  </p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/66">
                    The team will continue reviewing submitted names and may
                    contact shortlisted nominees for confirmation, profile
                    material, or awards communication.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      label: "1",
                      title: "Entries under review",
                      description:
                        "Existing nominations can still be checked by the Panache team.",
                    },
                    {
                      label: "2",
                      title: "Shortlist follow-up",
                      description:
                        "Nominees may be contacted if more information is needed.",
                    },
                    {
                      label: "3",
                      title: "Awards cycle continues",
                      description:
                        "Follow Panache D'or updates through the main awards pages.",
                    },
                  ].map((step) => (
                    <div
                      key={step.title}
                      className="rounded-[1.3rem] border border-black/8 bg-white/74 px-4 py-4"
                    >
                      <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-[#8241B6]">
                        Step {step.label}
                      </p>
                      <h3 className="mt-3 font-sans text-base font-semibold leading-tight tracking-[-0.04em] text-[#171411]">
                        {step.title}
                      </h3>
                      <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/64">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 border-t border-black/8 pt-5 sm:flex-row">
                  <Button
                    asChild
                    className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
                  >
                    <Link to="/panache-expo/panache-dor">
                      View Panache D&apos;or
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-12 rounded-full border-black/12 bg-white/74 px-7 font-sans text-sm font-semibold text-[#171411] hover:bg-white"
                  >
                    <Link to="/panache-expo/contact">Contact the team</Link>
                  </Button>
                </div>
              </div>
            ) : (
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
            )}
          </ExpoSurface>
        </section>

        <section className="mx-auto mt-10 max-w-6xl">
          <ExpoSurface className="overflow-hidden">
            <div className="grid gap-8 lg:grid-cols-[0.78fr,1.22fr] lg:items-start">
              <div>
                <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                  Voting & selection criteria
                </p>
                <h2 className="mt-3 font-sans text-[clamp(2rem,3vw,2.85rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                  Panache D&apos;or Awards 2026 winners combine public support and jury evaluation.
                </h2>
                <p className="mt-4 font-sans text-[1rem] leading-relaxed text-[#171411]/68">
                  Winners of the Panache D&apos;or Awards 2026 will be determined through a transparent process that combines online public paid votes with the decision of the jury committee.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.45rem] border border-black/8 bg-[#f8f2e8] px-5 py-5">
                  <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-[#8241B6]">
                    Public votes
                  </p>
                  <p className="mt-4 font-sans text-4xl font-semibold tracking-[-0.08em] text-[#171411]">
                    70%
                  </p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/68">
                    Online public paid votes. Each online vote costs 100 CFA and there is no limit to the number of votes a nominee can receive.
                  </p>
                </div>

                <div className="rounded-[1.45rem] border border-black/8 bg-[#fcfbf8] px-5 py-5">
                  <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-[#8241B6]">
                    Jury decision
                  </p>
                  <p className="mt-4 font-sans text-4xl font-semibold tracking-[-0.08em] text-[#171411]">
                    30%
                  </p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/68">
                    Jury committee evaluation based on professional merit, documented work, and contribution to the industry or community.
                  </p>
                </div>

                <div className="rounded-[1.45rem] border border-black/8 bg-white px-5 py-5 md:col-span-2">
                  <p className="font-sans text-sm font-semibold text-[#171411]">
                    Jury evaluation areas
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {juryEvaluationItems.map((item) => (
                      <div
                        key={item}
                        className="rounded-full border border-black/8 bg-[#f8f2e8] px-4 py-2 font-sans text-sm font-medium text-[#171411]/72"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 font-sans text-sm leading-relaxed text-[#171411]/66">
                    Nominees are encouraged to actively campaign, promote their nomination, and mobilize their audience throughout the voting period.
                  </p>
                </div>
              </div>
            </div>
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

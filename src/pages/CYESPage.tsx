import { useRef } from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SponsorsMarquee } from "@/components/SponsorsMarquee";
import { Button } from "@/components/ui/button";
import cyesEvent from "@/assets/CYES.jpeg";
import cyesAwards from "@/assets/CYESCDAwards.jpeg";
import cyesFrameLogo from "@/assets/CYESFrameLogo.svg";
import honDonald from "@/assets/HonDonald.jpeg";
import speaker1 from "@/assets/speaker1.jpeg";
import speaker2 from "@/assets/speaker2.jpeg";
import speaker3 from "@/assets/speaker3.jpeg";
import speaker4 from "@/assets/speaker4.jpeg";
import speaker5 from "@/assets/speaker5.jpeg";
import { ArrowRight, Award, Lightbulb, Mic, Users } from "lucide-react";
import {
  motion,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { Link } from "react-router-dom";

type Highlight = {
  icon: typeof Mic;
  title: string;
  description: string;
  accentClassName: string;
};

type TiltPhoto = {
  image: string;
  alt: string;
  className: string;
  parallaxY?: [number, number];
  parallaxX?: [number, number];
  parallaxScale?: [number, number];
};

type RevealCharacterProps = {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  shouldReduceMotion: boolean;
};

const highlights: Highlight[] = [
  {
    icon: Mic,
    title: "Keynote Sessions",
    description:
      "Direct insight from builders, business leaders, and voices shaping the next generation of enterprise in Cameroon.",
    accentClassName: "text-[#156D3B]",
  },
  {
    icon: Users,
    title: "Real Networking",
    description:
      "Founders, students, operators, partners, and mentors in one room with enough structure to create useful connections.",
    accentClassName: "text-[#1875D2]",
  },
  {
    icon: Lightbulb,
    title: "Practical Workshops",
    description:
      "Focused conversations around growth, visibility, digital opportunity, and what it takes to turn ideas into traction.",
    accentClassName: "text-[#CC2129]",
  },
  {
    icon: Award,
    title: "Recognition on Stage",
    description:
      "The summit culminates in awards that spotlight youth entrepreneurship, community leadership, and impact.",
    accentClassName: "text-[#FFB200]",
  },
];

const heroPhotos: TiltPhoto[] = [
  {
    image: speaker2,
    alt: "CYES beauty portrait",
    className: "left-[56%] top-[4%] w-[20%] rotate-[-4deg]",
    parallaxY: [0, -44],
    parallaxX: [0, -12],
  },
  {
    image: cyesAwards,
    alt: "CYES awards audience",
    className: "left-[27%] top-[39%] w-[22%] rotate-[10deg]",
    parallaxY: [0, -22],
    parallaxX: [0, 10],
  },
  {
    image: speaker1,
    alt: "CYES speaker portrait",
    className: "left-[56%] top-[73%] w-[22%] rotate-[6deg]",
    parallaxY: [0, 26],
    parallaxX: [0, -8],
  },
  {
    image: cyesEvent,
    alt: "CYES event atmosphere",
    className: "left-[62%] top-[18%] w-[35%] rotate-[0deg]",
    parallaxY: [0, -58],
    parallaxScale: [1, 1.035],
  },
];

const heroSupportPhotos: TiltPhoto[] = [
  {
    image: speaker4,
    alt: "CYES support portrait one",
    className: "left-[-5%] top-[18%] w-[15%] rotate-[-8deg]",
    parallaxY: [0, -18],
    parallaxX: [0, -10],
  },
  {
    image: speaker3,
    alt: "CYES support keynote image",
    className: "left-[7%] top-[70%] w-[20%] rotate-[6deg]",
    parallaxY: [0, 24],
    parallaxX: [0, 8],
  },
  {
    image: speaker5,
    alt: "CYES support guest image",
    className: "left-[25%] top-[0%] w-[22%] rotate-[-5deg]",
    parallaxY: [0, -34],
    parallaxX: [0, 12],
  },
  {
    image: honDonald,
    alt: "Featured summit voice",
    className: "left-[43%] top-[70%] w-[22%] rotate-[-8deg]",
    parallaxY: [0, 30],
    parallaxX: [0, -6],
  },
];

const spotlightPhotos: TiltPhoto[] = [
  {
    image: speaker1,
    alt: "Featured speaker portrait",
    className:
      "left-[18%] top-[7%] z-20 w-[44%] rotate-[-4deg] rounded-[2rem]",
  },
  {
    image: speaker2,
    alt: "Young entrepreneur portrait",
    className:
      "left-[60%] top-[20%] z-10 w-[31%] rotate-[6deg] rounded-[2rem]",
  },
  {
    image: speaker5,
    alt: "Speaker card detail",
    className:
      "left-[31%] top-[60%] z-30 w-[24%] rotate-[-8deg] rounded-[1.8rem]",
  },
  {
    image: honDonald,
    alt: "Industry leader portrait",
    className:
      "left-[53%] top-[54%] z-20 w-[35%] rotate-[9deg] rounded-[2rem]",
  },
];

const statementCards = [
  {
    number: "01.",
    title: "Innovation",
    description:
      "Encouraging fresh ideas, bold enterprise, and practical solutions that create value for young Cameroonians.",
    className: "bg-[#eef5fb] md:-rotate-[0deg]",
  },
  {
    number: "02.",
    title: "Empowerment",
    description:
      "Equipping young founders with mentorship, visibility, tools, and confidence to build sustainable ventures.",
    className: "bg-[#dfeefb] md:rotate-[0deg]",
  },
  {
    number: "03.",
    title: "Recognition",
    description:
      "Celebrating and rewarding outstanding entrepreneurial achievements.",
    className: "bg-[#d4e8fb] md:-rotate-[0deg]",
  },
];
const aboutCyesDescription =
  "The Cameroon Youth Entrepreneurial Summit & Awards is a flagship initiative dedicated to nurturing entrepreneurial talent, empowering innovation, and celebrating the achievements of young Cameroonian entrepreneurs.";

const TiltCard = ({ image, alt, className }: TiltPhoto) => (
  <div
    className={`absolute aspect-[4/5] overflow-hidden rounded-[0.9rem] bg-white shadow-[0_22px_50px_rgba(17,16,14,0.1)] md:rounded-[1.05rem] ${className}`}
  >
    <img src={image} alt={alt} className="h-full w-full object-cover" />
  </div>
);

type ParallaxTiltCardProps = TiltPhoto & {
  progress: MotionValue<number>;
};

const ParallaxTiltCard = ({
  image,
  alt,
  className,
  progress,
  parallaxX = [0, 0],
  parallaxY = [0, 0],
  parallaxScale = [1, 1],
}: ParallaxTiltCardProps) => {
  const x = useTransform(progress, [0, 1], parallaxX);
  const y = useTransform(progress, [0, 1], parallaxY);
  const scale = useTransform(progress, [0, 1], parallaxScale);

  return (
    <motion.div
      style={{ x, y, scale }}
      className={`absolute aspect-[4/5] overflow-hidden rounded-[0.9rem] bg-white shadow-[0_22px_50px_rgba(17,16,14,0.1)] will-change-transform md:rounded-[1.05rem] ${className}`}
    >
      <img src={image} alt={alt} className="h-full w-full object-cover" />
    </motion.div>
  );
};

const SpeakerSpotlightCard = ({ image, alt, className }: TiltPhoto) => (
  <div
    className={`absolute aspect-[0.86/1] overflow-hidden bg-white shadow-[0_26px_60px_rgba(17,16,14,0.14)] ${className}`}
  >
    <img src={image} alt={alt} className="h-full w-full object-cover" />
  </div>
);

const RevealCharacter = ({
  children,
  progress,
  range,
  shouldReduceMotion,
}: RevealCharacterProps) => {
  const opacity = useTransform(
    progress,
    range,
    shouldReduceMotion ? [1, 1] : [0, 1],
  );
  const y = useTransform(
    progress,
    range,
    shouldReduceMotion ? [0, 0] : [16, 0],
  );

  if (children === " ") {
    return <span className="w-[0.3em]" aria-hidden="true" />;
  }

  return (
    <span className="relative mt-1 inline-block align-top">
      <span className="absolute inset-0 text-[#f7f8f3]">{children}</span>
      <motion.span style={{ opacity, y }} className="relative inline-block">
        {children}
      </motion.span>
    </span>
  );
};

const getHeadingRevealProps = (shouldReduceMotion: boolean) => ({
  initial: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 34 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.65 } as const,
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
});

const AboutCYESSection = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const words = aboutCyesDescription.split(" ");
  const totalCharacters = Math.max(aboutCyesDescription.length, 1);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 82%", "end 38%"],
  });

  const revealRange = useTransform(
    scrollYProgress,
    [0.08, 0.72],
    shouldReduceMotion ? [1, 1] : [0, 1],
  );

  return (
    <section
      ref={sectionRef}
      className="mx-auto mt-24 max-w-6xl px-6 text-center md:px-24"
    >
      <motion.h2
        {...getHeadingRevealProps(shouldReduceMotion)}
        className="font-sans text-[clamp(2.5rem,4.4vw,3.8rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-[#171411]"
      >
        About <span className="font-display">CYES</span> 
      </motion.h2>

      <p className="mx-auto mt-6 flex max-w-[90rem] flex-wrap justify-center font-sans font-semibold text-[1.2rem] leading-[1.2] text-[#171411]/76 md:text-[2.3rem]">
        {words.map((word, wordIndex) => {
          const consumedCharacters = words
            .slice(0, wordIndex)
            .reduce((count, currentWord) => count + currentWord.length + 1, 0);

          return (
            <span
              key={`${word}-${wordIndex}`}
              className="mr-[0.3em] inline-flex whitespace-nowrap"
            >
              {Array.from(word).map((character, characterIndex) => {
                const start =
                  (consumedCharacters + characterIndex) / totalCharacters;
                const end = start + 1 / totalCharacters;

                return (
                  <RevealCharacter
                    key={`${character}-${wordIndex}-${characterIndex}`}
                    progress={revealRange}
                    range={[start, end]}
                    shouldReduceMotion={shouldReduceMotion}
                  >
                    {character}
                  </RevealCharacter>
                );
              })}
            </span>
          );
        })}
      </p>
    </section>
  );
};

const CYESPage = () => {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroSectionRef,
    offset: ["start start", "end start"],
  });

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-[#171411]">
      <Header />

      <main className="pb-20 pt-28 md:pb-24 md:pt-36">
        <div className="absolute left-0 top-0 px-6 py-4 md:px-24 md:py-6">
          <img
            src={cyesFrameLogo}
            alt="CYES logo"
            className="pointer-events-none  z-30 h-10 w-auto object-contain md:h-12"
          />
        </div>
        <section
          ref={heroSectionRef}
          className="relative w-full overflow-visible px-6 md:px-24"
        >
          <div className="relative mt-12 min-h-[42rem] sm:min-h-[46rem] md:min-h-[62rem] lg:min-h-[48rem] overflow-visible">
            <div className="relative z-20 flex justify-start">
              <div className="max-w-[32rem]">
                <motion.h1
                  {...getHeadingRevealProps(shouldReduceMotion)}
                  className="leading-none text-[#171411] text-[clamp(2.35rem,11vw,3.35rem)] md:text-[clamp(3.1rem,5.4vw,5.4rem)]"
                >
                  <div className="flex gap-4">
                    <span className="block font-sans   tracking-[-0.07em]">
                      Cameroon
                    </span>
                    <span className="mt-1 block font-sans  tracking-[-0.07em] text-[#1875D2]">
                      Youth
                    </span>
                  </div>

                  <div className="flex gap-4">
                    <span className="block font-display  tracking-[-0.07em] text-[#156D3B]">
                      Entrepreneurial
                    </span>
                  </div>

                  <div className="flex gap-4">
                    <span className="block font-display  tracking-[-0.07em] text-[#156D3B]">
                      Summit
                    </span>
                    <span className="block font-display text-[clamp(2.1rem,9.5vw,3rem)] tracking-[-0.07em] text-[#CC2129] md:text-[clamp(2.8rem,5vw,4.9rem)]">
                      &amp;
                    </span>
                    <span className="block font-display  tracking-[-0.07em] text-[#FFB200]">
                      Awards
                    </span>
                  </div>
                </motion.h1>

                <p className="mt-5 font-sans text-[1.4rem] leading-relaxed font-semibold text-[#171411]/72">
                  Empowering the next generation of Cameroonian entrepreneurs
                  through mentorship, networking, and recognition of outstanding
                  achievements.
                </p>

                <Link to="/cyes/register" className="mt-7 inline-flex">
                  <Button className="h-11 rounded-full bg-[#171411] px-6 font-sans text-sm font-semibold text-white hover:bg-[#171411]/90">
                    Register now
                  </Button>
                </Link>

                <div className="relative mt-12 flex h-[19rem] items-center justify-center md:hidden">
                  <div className="absolute h-[17rem] w-[min(72vw,16rem)] rotate-[3deg] overflow-hidden rounded-[0.85rem] bg-white shadow-[0_24px_56px_rgba(17,16,14,0.16)]">
                    <img
                      src={cyesEvent}
                      alt="CYES summit hero image"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="absolute left-[10%] -bottom-[10%] h-[7rem] w-[min(36vw,8rem)] rotate-[-5deg] overflow-hidden rounded-[0.85rem] bg-white shadow-[0_24px_56px_rgba(17,16,14,0.16)]">
                    <img
                      src={cyesAwards}
                      alt="CYES summit hero image"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="absolute right-[10%] -top-[10%] h-[7rem] w-[min(36vw,8rem)] rotate-[-2deg] overflow-hidden rounded-[0.85rem] bg-white shadow-[0_24px_56px_rgba(17,16,14,0.16)]">
                    <img
                      src={speaker2}
                      alt="CYES summit hero image"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 left-[-3%] top-[19rem] z-10 hidden h-[12.5rem] overflow-visible md:block md:left-0 md:top-[22rem] md:h-[12.5rem]">
              {heroSupportPhotos.map((photo) => (
                <ParallaxTiltCard
                  key={photo.alt + photo.className}
                  {...photo}
                  progress={heroScrollProgress}
                />
              ))}
            </div>

            <div className="pointer-events-none absolute left-[5%] right-[-10%] top-[20.5rem] z-10 hidden h-[31rem] overflow-visible md:block md:left-[14%] md:right-[-6%] md:top-[24rem] md:h-[38rem] lg:left-[28%] lg:right-[-8%] lg:top-[-0.5rem] lg:h-[41rem]">
              {heroPhotos.map((photo) => (
                <ParallaxTiltCard
                  key={photo.alt + photo.className}
                  {...photo}
                  progress={heroScrollProgress}
                />
              ))}
            </div>
          </div>
        </section>

        <AboutCYESSection />

        <section className="mt-16 w-full px-2 md:px-6">
          <div className="space-y-3 px-2 py-2 md:-space-y-4">
            {statementCards.map((card, index) => (
              <article
                key={card.title}
                className={[
                  "group relative overflow-hidden px-5 py-5 shadow-[0_18px_40px_rgba(17,16,14,0.05)] transition-[transform,box-shadow,padding] duration-500 ease-out md:px-24 md:py-7",
                  "[clip-path:polygon(0_0,100%_0,98%_100%,2%_100%)]",
                  card.className,
                  index > 0 ? "md:-mt-2" : "",
                ].join(" ")}
              >
                <span
                  className="font-sans text-xl font-medium tracking-[-0.04em] text-[#171411] md:absolute md:text-2xl"
                  style={{ left: `${3 + index * 30}%` }}
                >
                  {card.number}
                </span>

                <motion.h3
                  {...getHeadingRevealProps(shouldReduceMotion)}
                  className="mt-2 font-sans text-[clamp(4.4rem,14vw,12.5rem)] font-semibold leading-[0.84] tracking-[-0.095em] text-[#171411]"
                >
                  {card.title}
                </motion.h3>

                <div className="mt-5 grid grid-rows-[1fr] transition-[grid-template-rows,opacity,transform] duration-500 ease-out md:grid-rows-[0fr] md:translate-y-4 md:opacity-0 md:group-hover:grid-rows-[1fr] md:group-hover:translate-y-0 md:group-hover:opacity-100">
                  <div className="overflow-hidden">
                    <p className="max-w-[28rem] font-sans text-base leading-relaxed text-[#171411]/72 md:ml-auto md:text-right">
                      <span className="mr-2 align-top text-lg text-[#171411]">
                        ↳
                      </span>
                      {card.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-[90rem] px-6 md:px-24">
          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
            <div>
              <motion.h2
                {...getHeadingRevealProps(shouldReduceMotion)}
                className="text-[#171411]"
              >
                <span className="block font-sans text-[clamp(2.8rem,5vw,4.9rem)] font-semibold leading-[0.92] tracking-[-0.075em]">
                  Summit
                </span>
                <span className="block font-display text-[clamp(2.8rem,5vw,5rem)] leading-[0.9] tracking-[-0.055em]">
                  Highlights
                </span>
              </motion.h2>
            </div>

            <p className="max-w-[42rem] font-sans text-[clamp(1.25rem,2vw,1.75rem)] font-medium leading-[1.34] tracking-[-0.04em] text-[#171411] lg:ml-auto">
              CYES should feel energetic, but also useful. The goal is not
              noise. It is gathering the right people, ideas, and recognition
              structures in one place.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map((highlight) => {
              const Icon = highlight.icon;

              return (
                <article
                  key={highlight.title}
                  className="rounded-[2rem] bg-[#eef2f6] px-6 py-7 shadow-[0_16px_36px_rgba(17,16,14,0.045)]"
                >
                  <Icon className={`h-10 w-10 ${highlight.accentClassName}`} />
                  <motion.h3
                    {...getHeadingRevealProps(shouldReduceMotion)}
                    className="mt-8 font-sans text-[1.2rem] font-semibold leading-[1.08] tracking-[-0.045em] text-[#171411] md:text-[1.35rem]"
                  >
                    {highlight.title}
                  </motion.h3>
                  <p className="mt-6 font-sans text-[1.02rem] leading-[1.42] tracking-[-0.02em] text-[#171411]/82">
                    {highlight.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-24 grid w-full gap-12 px-6 md:px-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="max-w-[31rem]">
            <p className="font-sans text-[0.92rem] font-semibold uppercase tracking-[0.08em] text-[#156D3B]">
              Featured Speakers
            </p>
            <motion.h2
              {...getHeadingRevealProps(shouldReduceMotion)}
              className="mt-5 font-sans text-[clamp(1.95rem,4vw,3.7rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-[#171411]"
            >
              A summit feels different when the people shaping it are visible.
              Take a look at our speakers.
            </motion.h2>

            <p className="mt-6 max-w-[28rem] font-sans text-[1rem] leading-[1.42] tracking-[-0.025em] text-[#171411]/76 md:text-[1.5rem]">
              Learn from industry leaders and successful entrepreneurs who will
              share their insights and experiences.
            </p>

            <Link to="/cyes/contact" className="mt-8 inline-flex">
              <Button className="h-12 rounded-full bg-[#171411] px-7 font-sans text-base font-semibold text-white hover:bg-[#171411]/90">
                <span className="mr-2 text-lg leading-none">↳</span>
                See more...
              </Button>
            </Link>
          </div>

          <div className="relative mx-auto h-[25rem] w-full max-w-[48rem] overflow-visible sm:h-[31rem] md:h-[35rem]">
            {spotlightPhotos.map((photo) => (
              <SpeakerSpotlightCard
                key={photo.alt + photo.className}
                {...photo}
              />
            ))}
          </div>
        </section>

        <section className="px-6 md:px-24">
          <div className="mx-auto mt-20 grid max-w-6xl gap-8 rounded-[2rem] border border-black/8 bg-white/56 px-6 py-8 md:grid-cols-[0.72fr_1.28fr] md:px-8">
            <div>
              <motion.h2
                {...getHeadingRevealProps(shouldReduceMotion)}
                className="font-sans text-[clamp(2rem,4vw,3rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-[#171411]"
              >
                Join the summit. Enter the room prepared.
              </motion.h2>
            </div>

            <div>
              <p className="max-w-[34rem] font-sans text-[1rem] leading-relaxed text-[#171411]/70">
                Whether you are coming to learn, connect, nominate, pitch, or be
                recognized, CYES should feel like a platform with direction and
                a clear path into action.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link to="/cyes/register">
                  <Button className="h-11 rounded-full bg-[#171411] px-6 font-sans text-sm font-semibold text-white hover:bg-[#171411]/90">
                    Register now
                  </Button>
                </Link>

                <Link
                  to="/cyes/contact"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-[#f0f2ed]"
                >
                  Contact the team
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <SponsorsMarquee variant="cyes" />
      <Footer variant="cyes" />
    </div>
  );
};

export default CYESPage;

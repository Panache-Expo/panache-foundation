import { useRef } from "react";

import {
  motion,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

import braidingWorkshopImage from "@/assets/BraidingWorkshop.jpeg";
import charityNightImage from "@/assets/CharityNight.jpg";
import panacheAwardsImage from "@/assets/PanacheAwards.jpeg";

type AboutSceneDefinition = {
  title: string;
  description: string;
  image: string;
  alt: string;
};

type AboutSceneProps = AboutSceneDefinition & {
  index: number;
};

type IntroCharacterProps = {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  shouldReduceMotion: boolean;
};

const aboutScenes: AboutSceneDefinition[] = [
  {
    title: "Educational Excellence",
    description:
      "Providing top-tier workshops and training programs to elevate skills and knowledge in the beauty industry.",
    image: braidingWorkshopImage,
    alt: "Hands-on beauty workshop session at Panache Expo",
  },
  {
    title: "Prestigious Recognition",
    description:
      "Honoring excellence through pageants and awards that celebrate outstanding achievements in beauty and fashion.",
    image: panacheAwardsImage,
    alt: "Panache Expo awards moment celebrating beauty and fashion excellence",
  },
  {
    title: "Community Impact",
    description:
      "Building a supportive community that fosters growth, creativity, and positive change in the beauty industry.",
    image: charityNightImage,
    alt: "Panache community gathering highlighting collaboration and impact",
  },
];

const motionSpringOptions = {
  stiffness: 140,
  damping: 28,
  mass: 0.24,
};

const aboutIntroTitle = "Empowering Beauty Excellence";
const aboutIntroDescription =
  "Panache Expo is a charitable organization dedicated to celebrating and advancing the beauty industry through education, recognition, and community empowerment.";

const IntroCharacter = ({
  children,
  progress,
  range,
  shouldReduceMotion,
}: IntroCharacterProps) => {
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
      <span className="absolute inset-0 text-[#f4f3ef]">{children}</span>
      <motion.span style={{ opacity, y }} className="relative inline-block">
        {children}
      </motion.span>
    </span>
  );
};

const AboutIntro = () => {
  const introRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const words = aboutIntroDescription.split(" ");
  const totalCharacters = Math.max(aboutIntroDescription.length, 1);
  const { scrollYProgress } = useScroll({
    target: introRef,
    offset: ["start center", "end center"],
  });

  const revealRange = useTransform(
    scrollYProgress,
    [0.08, 0.75],
    shouldReduceMotion ? [1, 1] : [0, 1],
  );
  const introOpacity = useTransform(
    scrollYProgress,
    [0, 0.08, 0.88, 1],
    shouldReduceMotion ? [1, 1, 1, 1] : [0.92, 1, 1, 0.96],
  );
  const introY = useTransform(
    scrollYProgress,
    [0, 0.08, 0.9, 1],
    shouldReduceMotion
      ? ["0px", "0px", "0px", "0px"]
      : ["32px", "0px", "0px", "-24px"],
  );

  return (
    <article
      ref={introRef}
      className="relative min-h-[220svh] md:min-h-[250svh]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 flex h-screen items-center justify-center px-2">
        <h3 className="bg-gradient-to-b from-white via-white/78 to-transparent bg-clip-text font-sans text-center text-[clamp(10.1rem,24.7vw,17.6rem)] tracking-[-0.095em] text-transparent">
          360 BEAUTY
        </h3>
      </div>

      <div className="sticky top-1/2 z-30 -translate-y-1/2 px-2 pt-[20svh] md:pt-[24svh]">
        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="mx-auto flex w-full max-w-6xl flex-col items-center text-center"
        >
          <h3 className="my-10 w-full text-center text-[clamp(3.2rem,9vw,5.9rem)] leading-[0.8] tracking-[-0.085em]">
            {aboutIntroTitle}
          </h3>

          <p className="mx-auto mt-6 flex w-full max-w-5xl flex-wrap justify-center font-sans text-lg leading-relaxed text-[#2a2521]/80 md:text-5xl">
            {words.map((word, wordIndex) => {
              const consumedCharacters = words
                .slice(0, wordIndex)
                .reduce(
                  (count, currentWord) => count + currentWord.length + 1,
                  0,
                );

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
                      <IntroCharacter
                        key={`${character}-${wordIndex}-${characterIndex}`}
                        progress={revealRange}
                        range={[start, end]}
                        shouldReduceMotion={shouldReduceMotion}
                      >
                        {character}
                      </IntroCharacter>
                    );
                  })}
                </span>
              );
            })}
          </p>
        </motion.div>
      </div>
    </article>
  );
};

const AboutScene = ({
  title,
  description,
  image,
  alt,
  index,
}: AboutSceneProps) => {
  const sceneRef = useRef<HTMLElement | null>(null);
  const [firstWord, ...remainingWords] = title.split(" ");
  const secondPart = remainingWords.join(" ");
  const overlapsPreviousScene = index > 0;
  const sceneLayer = 20 + index * 10;
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start end", "end start"],
  });

  const cardYRange = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? ["0vh", "0vh"] : ["0vh", "-14vh"],
  );
  const imageYRange = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? ["0%", "0%"] : ["8%", "-10%"],
  );
  const titleOpacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.65, 0.9, 1],
    shouldReduceMotion ? [1, 1, 1, 1, 1] : [0, 1, 1, 0.25, 0],
  );
  const descriptionOpacity = useTransform(
    scrollYProgress,
    [0, 0.22, 0.68, 0.9, 1],
    shouldReduceMotion ? [1, 1, 1, 1, 1] : [0, 1, 1, 0.2, 0],
  );
  const textY = useTransform(
    scrollYProgress,
    [0, 0.18, 0.9, 1],
    shouldReduceMotion
      ? ["0px", "0px", "0px", "0px"]
      : ["26px", "0px", "0px", "-20px"],
  );

  const cardY = useSpring(cardYRange, motionSpringOptions);
  const imageY = useSpring(imageYRange, motionSpringOptions);

  return (
    <article
      ref={sceneRef}
      style={{ zIndex: sceneLayer }}
      className={[
        "relative h-screen",
        overlapsPreviousScene
          ? "-mt-[12svh] md:-mt-[15svh] lg:-mt-[18svh]"
          : "",
      ].join(" ")}
    >
      <motion.div
        style={{ opacity: titleOpacity, y: textY, zIndex: sceneLayer + 1 }}
        className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 md:px-8 lg:px-10 py-8 md:py-10 lg:py-12"
      >
        <h3 className="w-full text-center text-[clamp(4.8rem,11vw,8.75rem)] leading-[0.8] tracking-[-0.085em] text-[#f4f3ef]">
          <span className="font-sans font-semibold">{firstWord}</span>
          {secondPart ? " " : null}
          {secondPart ? (
            <span className="font-display font-bold">{secondPart}</span>
          ) : null}
        </h3>
      </motion.div>

      <motion.div
        style={{ y: cardY }}
        className={[
          "relative h-[118%] overflow-hidden bg-transparent will-change-transform",
          "-mt-[1svh] md:-mt-[2svh] lg:-mt-[3svh]",
        ].join(" ")}
      >
        <div className="relative h-full">
          <motion.img
            src={image}
            alt={alt}
            style={{ y: cardY, scale: 1.08 }}
            className="absolute inset-x-0 top-0 w-full object-cover will-change-transform"
          />
          {/* <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#f4f3ef]/95 via-[#f4f3ef]/58 to-transparent md:h-56" /> */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/18 to-transparent" />

          <motion.div
            style={{ opacity: descriptionOpacity, y: textY }}
            className="absolute right-4 top-4 z-20 max-w-[16rem] p-4 text-left md:right-8 md:top-7 md:max-w-sm"
          >
            <p className="font-sans text-sm font-medium leading-relaxed text-[#ffffff] md:text-base">
              {description}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </article>
  );
};

export const About = () => {
  return (
    <section className="relative z-20 -mt-20 rounded-t-[2rem] bg-[#f4f3ef] pt-12  md:pt-20">
      <div className="w-full">
        <AboutIntro />
        <div className="space-y-0">
          {aboutScenes.map((scene, index) => (
            <AboutScene key={scene.title} {...scene} index={index} />
          ))}
          {/* <motion.div
            style={{ y: textY }}
            className="absolute right-4 top-4 z-20 max-w-[16rem] p-4 text-left md:right-8 md:top-7 md:max-w-sm"
          >
            <p className="font-sans text-sm font-medium leading-relaxed text-[#ffffff] md:text-base">
              {description}
            </p>
          </motion.div> */}
        </div>
      </div>
    </section>
  );
};

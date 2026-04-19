import { useRef } from "react";

import { Button } from "@/components/ui/button";
import awardOneImage from "@/assets/Award1.jpeg";
import awardTwoImage from "@/assets/Award2.jpeg";
import awardThreeImage from "@/assets/award3.jpeg";
import braidingImage from "@/assets/BraidingWorkshop.jpeg";
import businessCompetitionImage from "@/assets/businesscomp.jpeg";
import charityNightImage from "@/assets/CharityNight.jpg";
import fashionNightImage from "@/assets/FashionNight.jpg";
import hairStylingImage from "@/assets/HairStyling.jpg";
import lashImage from "@/assets/Lash.jpg";
import makeupImage from "@/assets/Makeup.jpg";
import missPanacheUpdateImage from "@/assets/misspanacheupdate.jpg";
import nailImage from "@/assets/NailArt.jpg";
import panacheAwardsImage from "@/assets/PanacheAwards.jpeg";
import panacheDorImage from "@/assets/PanacheDorWinners.jpeg";
import panachExpoImage from "@/assets/PanachExpo.jpeg";
import speakerThreeImage from "@/assets/speaker3.jpeg";
import wigImage from "@/assets/WigInstall.jpg";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Link } from "react-router-dom";

type GalleryCard = {
  src: string;
  alt: string;
  frameClassName: string;
};

type GalleryPanel = {
  title: string;
  subtitle: string;
  cards: GalleryCard[];
};

const galleryPanels: GalleryPanel[] = [
  {
    title: "MakeUp Workshop",
    subtitle: "Color, technique, and artistry in motion.",
    cards: [
      {
        src: makeupImage,
        alt: "Makeup workshop close-up",
        frameClassName:
          "left-[2vw] top-[0.5rem] h-[44vh] w-[22vw] min-w-[13rem] lg:min-w-[15rem]",
      },
      {
        src: nailImage,
        alt: "Nail art session in progress",
        frameClassName:
          "left-[17vw] bottom-[5vh] h-[34vh] w-[25vw] min-w-[16rem] lg:min-w-[19rem]",
      },
      {
        src: lashImage,
        alt: "Lash extension training setup",
        frameClassName:
          "right-[5vw] bottom-0 h-[58vh] w-[42vw] min-w-[22rem] lg:min-w-[28rem]",
      },
      {
        src: makeupImage,
        alt: "Makeup workshop behind the scenes",
        frameClassName:
          "right-[-6vw] top-[16vh] h-[38vh] w-[12vw] min-w-[8rem] lg:min-w-[10rem]",
      },
      {
        src: awardOneImage,
        alt: "Creative makeup showcase moment",
        frameClassName:
          "left-[36vw] top-[14vh] h-[24vh] w-[14vw] min-w-[9rem] lg:min-w-[11rem]",
      },
    ],
  },
  {
    title: "Hair & Styling Lab",
    subtitle: "Where precision styling meets live transformation.",
    cards: [
      {
        src: hairStylingImage,
        alt: "Hair styling workshop",
        frameClassName:
          "left-[4vw] top-[4vh] h-[36vh] w-[20vw] min-w-[12rem] lg:min-w-[14rem]",
      },
      {
        src: braidingImage,
        alt: "Braiding workshop demonstration",
        frameClassName:
          "left-[22vw] bottom-[3vh] h-[40vh] w-[24vw] min-w-[16rem] lg:min-w-[18rem]",
      },
      {
        src: wigImage,
        alt: "Wig installation workshop",
        frameClassName:
          "right-[7vw] top-[12vh] h-[56vh] w-[40vw] min-w-[24rem] lg:min-w-[30rem]",
      },
      {
        src: hairStylingImage,
        alt: "Barber workshop close-up",
        frameClassName:
          "right-[-5vw] bottom-[4vh] h-[30vh] w-[13vw] min-w-[8rem] lg:min-w-[10rem]",
      },
      {
        src: businessCompetitionImage,
        alt: "Creative business challenge at Panache Expo",
        frameClassName:
          "left-[44vw] top-[18vh] h-[24vh] w-[16vw] min-w-[10rem] lg:min-w-[12rem]",
      },
    ],
  },
  {
    title: "Panache Highlights",
    subtitle: "From awards to runway moments and community celebration.",
    cards: [
      {
        src: panacheAwardsImage,
        alt: "Panache Awards highlight",
        frameClassName:
          "left-[3vw] top-[3vh] h-[40vh] w-[22vw] min-w-[13rem] lg:min-w-[15rem]",
      },
      {
        src: charityNightImage,
        alt: "Community charity night moment",
        frameClassName:
          "left-[18vw] bottom-[4vh] h-[34vh] w-[22vw] min-w-[15rem] lg:min-w-[18rem]",
      },
      {
        src: fashionNightImage,
        alt: "Fashion night highlight",
        frameClassName:
          "right-[7vw] bottom-0 h-[60vh] w-[43vw] min-w-[23rem] lg:min-w-[30rem]",
      },
      {
        src: panacheDorImage,
        alt: "Panache D'or winners moment",
        frameClassName:
          "right-[-5vw] top-[17vh] h-[34vh] w-[14vw] min-w-[8rem] lg:min-w-[10rem]",
      },
      {
        src: awardTwoImage,
        alt: "Award ceremony close-up",
        frameClassName:
          "left-[42vw] top-[15vh] h-[25vh] w-[15vw] min-w-[10rem] lg:min-w-[12rem]",
      },
    ],
  },
  {
    title: "Expo Energy",
    subtitle: "Big-stage moments, candid scenes, and the people behind the atmosphere.",
    cards: [
      {
        src: panachExpoImage,
        alt: "Panache Expo stage moment",
        frameClassName:
          "left-[2vw] top-[2vh] h-[43vh] w-[24vw] min-w-[14rem] lg:min-w-[16rem]",
      },
      {
        src: speakerThreeImage,
        alt: "Speaker spotlight during the expo",
        frameClassName:
          "left-[21vw] bottom-[5vh] h-[36vh] w-[20vw] min-w-[14rem] lg:min-w-[16rem]",
      },
      {
        src: missPanacheUpdateImage,
        alt: "Miss Panache runway highlight",
        frameClassName:
          "right-[7vw] bottom-0 h-[58vh] w-[41vw] min-w-[24rem] lg:min-w-[30rem]",
      },
      {
        src: awardThreeImage,
        alt: "Backstage portrait from the awards evening",
        frameClassName:
          "right-[-5vw] top-[15vh] h-[35vh] w-[13vw] min-w-[8rem] lg:min-w-[10rem]",
      },
      {
        src: fashionNightImage,
        alt: "Fashion showcase at Panache Expo",
        frameClassName:
          "left-[45vw] top-[14vh] h-[23vh] w-[15vw] min-w-[10rem] lg:min-w-[12rem]",
      },
    ],
  },
];

export const Gallery = () => {
  const sceneRef = useRef<HTMLElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const panelCount = galleryPanels.length;
  const horizontalEnd = `-${((panelCount - 1) / panelCount) * 100}%`;
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });
  const trackX = useTransform(scrollYProgress, [0, 1], ["0%", horizontalEnd]);
  const sectionBackground = useTransform(
    scrollYProgress,
    [0, 0.45, 1],
    ["rgb(244, 243, 239)", "rgb(239, 233, 237)", "hsl(280 40% 88%)"],
  );

  return (
    <motion.section
      style={shouldReduceMotion ? undefined : { backgroundColor: sectionBackground }}
      className="relative z-20 bg-[#f4f3ef] py-24 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-display text-[clamp(2.85rem,5vw,5rem)] font-bold leading-[0.95] tracking-[-0.05em] text-[#13110f]">
          Event Gallery
        </h2>
        <p className="mx-auto mt-6 max-w-3xl font-sans text-[clamp(1.15rem,2vw,1.7rem)] leading-[1.35] text-[#2a2521]/82">
          Scroll through workshop moments, live demonstrations, and signature Panache highlights
          in one continuous visual reel.
        </p>
      </div>

      <div className="mt-16 md:hidden">
        <div className="space-y-16 px-6">
          {galleryPanels.map((panel) => (
            <article key={panel.title} className="space-y-6">
              <div className="text-center">
                <h3 className="font-sans text-3xl font-semibold tracking-[-0.04em] text-[#15120f]">
                  {panel.title}
                </h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-[#2a2521]/76">
                  {panel.subtitle}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {panel.cards.slice(0, 5).map((card, index) => (
                  <div
                    key={`${panel.title}-${card.alt}`}
                    className={
                      index === 2
                        ? "col-span-2 aspect-[4/3] overflow-hidden"
                        : index === 4
                          ? "col-span-2 aspect-[16/9] overflow-hidden"
                          : "aspect-[3/4] overflow-hidden"
                    }
                  >
                    <img src={card.src} alt={card.alt} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div
        ref={sceneRef}
        style={shouldReduceMotion ? undefined : { height: `${panelCount * 100}vh` }}
        className="relative mt-16 hidden md:block"
      >
        <div
          style={shouldReduceMotion ? undefined : { position: "sticky", top: 0, height: "100svh", overflow: "hidden" }}
        >
          <motion.div
            style={shouldReduceMotion ? undefined : { x: trackX, display: "flex", width: `${panelCount * 100}vw` }}
            className={shouldReduceMotion ? "space-y-20 px-10" : "h-full"}
          >
            {galleryPanels.map((panel) => (
              <article
                key={panel.title}
                className={shouldReduceMotion ? "relative h-[85svh]" : "relative h-full w-screen shrink-0 px-8 pb-10 pt-6 lg:px-12"}
              >
                <div className="mx-auto h-full max-w-[1600px]">
                  <div className="text-center">
                    <h3 className="font-sans text-[clamp(2.5rem,3.6vw,4rem)] font-semibold tracking-[-0.05em] text-[#15120f]">
                      {panel.title}
                    </h3>
                    <p className="mx-auto mt-3 max-w-2xl font-sans text-lg text-[#2a2521]/74">
                      {panel.subtitle}
                    </p>
                  </div>

                  <div className="relative mt-8 h-[calc(100%-7rem)]">
                    {panel.cards.map((card) => (
                      <figure
                        key={`${panel.title}-${card.alt}`}
                        className={`absolute overflow-hidden bg-[#e8e4dc]  ${card.frameClassName}`}
                      >
                        <img src={card.src} alt={card.alt} className="h-full w-full object-cover" />
                      </figure>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="mx-auto mt-14 px-6 text-center">
        <Link to="/panache-expo/panache-dor">
          <Button className="h-12 rounded-full bg-black px-7 font-sans text-sm font-semibold text-white hover:bg-black/85">
            View Panache D&apos;or Winners
          </Button>
        </Link>
      </div>
    </motion.section>
  );
};

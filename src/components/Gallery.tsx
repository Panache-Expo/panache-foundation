import { Button } from "@/components/ui/button";
import awardOneImage from "@/assets/Award1.jpeg";
import charityNightImage from "@/assets/CharityNight.jpg";
import fashionNightImage from "@/assets/FashionNight.jpg";
import makeupImage from "@/assets/Makeup.jpg";
import panacheAwardsImage from "@/assets/PanacheAwards.jpeg";
import panacheDorImage from "@/assets/PanacheDorWinners.jpeg";
import panachExpoImage from "@/assets/PanachExpo.jpeg";
import wigImage from "@/assets/WigInstall.jpg";
import { Link } from "react-router-dom";

type GalleryMoment = {
  src: string;
  alt: string;
  label: string;
  title: string;
  description: string;
  className: string;
};

const galleryMoments: GalleryMoment[] = [
  {
    src: panachExpoImage,
    alt: "Panache Expo crowd and stage atmosphere",
    label: "Panache Expo",
    title: "The atmosphere that brings the whole experience together.",
    description:
      "A cleaner overview of the stage, audience, and live energy behind the event.",
    className: "md:col-span-2 md:row-span-2 md:min-h-[33rem]",
  },
  {
    src: makeupImage,
    alt: "Makeup workshop at Panache Expo",
    label: "Workshops",
    title: "Hands-on beauty sessions.",
    description: "Skill-building moments across makeup, styling, and technique.",
    className: "md:min-h-[16rem]",
  },
  {
    src: wigImage,
    alt: "Wig installation workshop",
    label: "Training",
    title: "Craft and precision.",
    description: "Professional demonstrations designed to sharpen real practice.",
    className: "md:min-h-[16rem]",
  },
  {
    src: panacheAwardsImage,
    alt: "Panache awards ceremony",
    label: "Awards",
    title: "Recognition that feels official.",
    description:
      "The award moments that turn standout work into visible prestige.",
    className: "md:min-h-[17rem]",
  },
  {
    src: fashionNightImage,
    alt: "Panache runway and fashion night",
    label: "Runway",
    title: "Fashion night in motion.",
    description: "Runway presence, live styling, and the public face of Panache.",
    className: "md:min-h-[17rem]",
  },
  {
    src: panacheDorImage,
    alt: "Panache D'or winners collage",
    label: "Winners",
    title: "Faces behind the archive.",
    description: "A direct look at the people Panache has already celebrated.",
    className: "md:min-h-[17rem]",
  },
  {
    src: charityNightImage,
    alt: "Panache community charity night",
    label: "Community",
    title: "Impact beyond the stage.",
    description:
      "The social side of Panache and the community it continues to build.",
    className: "md:col-span-2 md:min-h-[18rem]",
  },
  {
    src: awardOneImage,
    alt: "Close-up award ceremony moment",
    label: "Highlights",
    title: "Signature details.",
    description:
      "Small moments that still communicate quality and celebration.",
    className: "md:min-h-[18rem]",
  },
];

export const Gallery = () => {
  return (
    <section className="relative z-20 bg-[#f4f3ef] py-24 md:py-28 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-5 md:auto-rows-[15rem] md:grid-cols-3">
          {galleryMoments.map((moment) => (
            <article
              key={`${moment.label}-${moment.title}`}
              className={`group relative isolate overflow-hidden rounded-[1.9rem] border border-black/8 bg-[#e8e4dc] shadow-[0_18px_44px_rgba(17,16,14,0.08)] ${moment.className}`}
            >
              <img
                src={moment.src}
                alt={moment.alt}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-black/8 to-transparent transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100" />
              <div className="absolute inset-0 bg-black/18 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100" />

              <div className="absolute inset-x-0 bottom-0 p-5 transition-all duration-300 md:translate-y-6 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:p-6">
                <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white">
                  {moment.label}
                </p>
                <h3 className="mt-3 max-w-[24rem] font-sans text-[1.2rem] font-semibold leading-[1.02] tracking-[-0.05em] text-white md:text-[1.35rem]">
                  {moment.title}
                </h3>
                <p className="mt-3 max-w-[28rem] font-sans text-sm leading-relaxed text-white">
                  {moment.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="relative z-30 mt-12 text-center md:text-left">
          <Link to="/panache-expo/panache-dor" className="inline-flex">
            <Button className="h-12 rounded-full bg-black px-7 font-sans text-sm font-semibold text-white hover:bg-black/85">
              View Panache D&apos;or Winners
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

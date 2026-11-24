import { useEffect, useState } from "react";

// Slot for the kids' donation video at the top of /donate: portrait on phones, landscape on wide
// screens. It stays hidden until both the video and its poster exist in public/videos/. The site
// answers missing files with index.html (status 200), so this checks the content type, not the status.

const WIDE_QUERY = "(min-width: 768px)";

const useIsWide = () => {
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia(WIDE_QUERY).matches);
  useEffect(() => {
    const mql = window.matchMedia(WIDE_QUERY);
    const onChange = () => setWide(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return wide;
};

const useFilesExist = (videoSrc: string, posterSrc: string) => {
  const [exists, setExists] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setExists(false);
    const poster = new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth > 0);
      img.onerror = () => resolve(false);
      img.src = posterSrc;
    });
    const video = fetch(videoSrc, { method: "HEAD" })
      .then((r) => r.ok && (r.headers.get("content-type") || "").startsWith("video/"))
      .catch(() => false);
    Promise.all([poster, video]).then(([p, v]) => {
      if (!cancelled) setExists(p && v);
    });
    return () => {
      cancelled = true;
    };
  }, [videoSrc, posterSrc]);
  return exists;
};

type Props = { lang: string; label: string; panelClassName: string };

export const KidsVideo = ({ lang, label, panelClassName }: Props) => {
  const wide = useIsWide();
  const orientation = wide ? "landscape" : "portrait";
  const src = `/videos/kids-${lang}-${orientation}.mp4`;
  const poster = `/videos/kids-${lang}-${orientation}-poster.jpg`;
  const exists = useFilesExist(src, poster);

  if (!exists) return null;

  return (
    <section className="pt-8 sm:pt-10" aria-label={label}>
      <div className={`${panelClassName} mx-auto p-2 sm:p-3 ${wide ? "max-w-4xl" : "w-[min(100%,calc(78svh*9/16))]"}`}>
        <video
          key={src}
          className={`w-full rounded-[1.5rem] bg-[#0b4fd6] ${wide ? "aspect-video" : "aspect-[9/16]"}`}
          controls
          playsInline
          preload="none"
          poster={poster}
          aria-label={label}
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
    </section>
  );
};

export default KidsVideo;

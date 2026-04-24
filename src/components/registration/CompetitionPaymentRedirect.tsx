import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { ExpoSurface } from "@/components/registration/ExpoPageShell";

interface CompetitionPaymentRedirectProps {
  applicationCode: string;
  paymentHref: string;
  title: string;
  description: string;
  actionLabel?: string;
  postSubmitCopy?: string;
}

export const CompetitionPaymentRedirect = ({
  applicationCode,
  paymentHref,
  title,
  description,
  actionLabel,
  postSubmitCopy,
}: CompetitionPaymentRedirectProps) => {
  const buttonLabel = actionLabel || "Continue";
  const copy =
    postSubmitCopy ||
    "You will be redirected to continue your registration flow. If nothing happens, use the button below.";
  return (
    <ExpoSurface className="max-w-2xl mx-auto text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-gold mb-4">
        Application Saved
      </p>
      <h2 className="font-sans text-[clamp(2.1rem,3vw,2.9rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-[#171411] mb-4">
        {title}
      </h2>
      <p className="mx-auto mb-6 max-w-xl font-sans text-[0.98rem] leading-relaxed text-[#171411]/68">
        {description}
      </p>
      <div className="mb-8 inline-flex items-center justify-center rounded-full border border-[#8241B6]/12 bg-[#8241B6]/6 px-5 py-3 text-sm font-semibold text-[#171411]">
        Application Code: {applicationCode}
      </div>
      <p className="mb-8 font-sans text-sm text-[#171411]/56">
        {copy}
      </p>
      <Button
        asChild
        size="lg"
        className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white shadow-none hover:bg-[#171411]/92"
      >
        <a href={paymentHref} target="_blank" rel="noopener noreferrer">
          {buttonLabel}
          <ExternalLink className="w-4 h-4" />
        </a>
      </Button>
    </ExpoSurface>
  );
};

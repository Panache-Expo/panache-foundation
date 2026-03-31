import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface CompetitionPaymentRedirectProps {
  applicationCode: string;
  paymentHref: string;
  title: string;
  description: string;
}

export const CompetitionPaymentRedirect = ({
  applicationCode,
  paymentHref,
  title,
  description,
}: CompetitionPaymentRedirectProps) => {
  return (
    <div className="max-w-2xl mx-auto rounded-3xl border border-border/60 bg-card p-8 md:p-10 shadow-soft text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-gold mb-4">
        Application Saved
      </p>
      <h2 className="font-display text-3xl font-bold text-primary mb-4">{title}</h2>
      <p className="text-muted-foreground mb-6">{description}</p>
      <div className="inline-flex items-center justify-center rounded-full border border-primary/15 bg-primary/5 px-5 py-3 text-sm font-semibold text-primary mb-8">
        Application Code: {applicationCode}
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        You will be redirected to Ayati to complete payment. If nothing happens, use the button below.
      </p>
      <Button asChild variant="hero" size="lg">
        <a href={paymentHref} target="_blank" rel="noopener noreferrer">
          Continue to Ayati
          <ExternalLink className="w-4 h-4" />
        </a>
      </Button>
    </div>
  );
};

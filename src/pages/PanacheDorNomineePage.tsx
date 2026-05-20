import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PanacheDorVoteForm } from "@/components/PanacheDorVoteForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  PanacheDorAwardCategory,
  PanacheDorAwardNominee,
} from "@/integrations/supabase/services";
import { usePanacheDorVoting } from "@/hooks/useSupabase";
import { Award, ArrowLeft, Loader2, Trophy } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

type NomineeWithCategory = PanacheDorAwardNominee & {
  category: PanacheDorAwardCategory;
};

const getVoteCount = (nominee: NomineeWithCategory) =>
  nominee.vote_count ?? nominee.ayati_vote_count;

const PanacheDorNomineePage = () => {
  const { slug } = useParams();
  const { data: voting, isLoading, error } = usePanacheDorVoting();

  const nominees = useMemo(
    () =>
      (voting?.categories || []).flatMap((category) =>
        category.nominees.map((nominee) => ({
          ...nominee,
          category,
        }))
      ),
    [voting?.categories]
  );

  const nominee = nominees.find((entry) => entry.slug === slug);
  const relatedNominees = nominees
    .filter(
      (entry) =>
        nominee &&
        entry.category_id === nominee.category_id &&
        entry.id !== nominee.id
    )
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />

      <main className="pb-20 pt-24 md:pb-24">
        <section className="mx-auto max-w-7xl px-6 md:px-10">
          <Link
            to="/panache-expo/panache-dor/vote"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-[#f8f2e8]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to nominees
          </Link>

          {isLoading ? (
            <div className="mt-8 flex items-center gap-3 rounded-[2rem] border border-black/8 bg-white px-6 py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[#8241B6]" />
              <p className="font-sans text-sm text-[#171411]/68">
                Loading nominee...
              </p>
            </div>
          ) : error ? (
            <div className="mt-8 rounded-[2rem] border border-black/8 bg-white px-6 py-8">
              <p className="font-sans text-sm text-destructive">
                {error instanceof Error ? error.message : "Could not load nominee."}
              </p>
            </div>
          ) : nominee ? (
            <>
              <div className="mt-8 grid gap-8 lg:grid-cols-[0.48fr_0.52fr] lg:items-start">
                <div className="overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_24px_64px_rgba(17,16,14,0.10)]">
                  <div className="aspect-[4/5] bg-[#f8f2e8]">
                    {nominee.photo_url ? (
                      <img
                        src={nominee.photo_url}
                        alt={nominee.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Award className="h-16 w-16 text-[#171411]/28" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-black/8 bg-white p-6 md:p-8">
                  <Badge className="rounded-full bg-[#f8f2e8] text-[#8241B6] hover:bg-[#f8f2e8]">
                    {nominee.category.name}
                  </Badge>
                  <h1 className="mt-5 font-sans text-[clamp(3rem,6vw,5.8rem)] font-semibold leading-[0.86] tracking-[-0.08em] text-[#171411]">
                    {nominee.name}
                  </h1>
                  {nominee.organization ? (
                    <p className="mt-4 font-sans text-xl font-semibold text-[#8241B6]">
                      {nominee.organization}
                    </p>
                  ) : null}
                  {nominee.bio ? (
                    <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-[#171411]/68">
                      {nominee.bio}
                    </p>
                  ) : (
                    <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-[#171411]/68">
                      This nominee is listed for Panache D&apos;or voting. Use the
                      Panache CamPay voting flow to support them officially.
                    </p>
                  )}

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.35rem] border border-black/8 bg-[#f8f2e8] px-5 py-4">
                      <p className="font-sans text-sm font-semibold text-[#171411]">
                        Vote source
                      </p>
                      <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/64">
                        Panache CamPay checkout
                      </p>
                    </div>
                    <div className="rounded-[1.35rem] border border-black/8 bg-[#f8f2e8] px-5 py-4">
                      <p className="font-sans text-sm font-semibold text-[#171411]">
                        Vote count
                      </p>
                      <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/64">
                        {getVoteCount(nominee).toLocaleString()} verified votes
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <PanacheDorVoteForm
                      nominee={nominee}
                      category={nominee.category}
                      payment={voting?.payment}
                    />
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button
                      asChild
                      variant="outline"
                      className="h-12 rounded-full border-black/12 bg-white/74 px-7 font-sans text-sm font-semibold text-[#171411] hover:bg-white"
                    >
                      <Link to="/panache-expo/panache-dor/leaderboard">
                        Leaderboard
                        <Trophy className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {relatedNominees.length ? (
                <section className="mt-10 rounded-[2rem] border border-black/8 bg-white p-6">
                  <h2 className="font-sans text-2xl font-semibold tracking-[-0.05em] text-[#171411]">
                    More in {nominee.category.name}
                  </h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {relatedNominees.map((entry: NomineeWithCategory) => (
                      <Link
                        key={entry.id}
                        to={`/panache-expo/panache-dor/nominees/${entry.slug}`}
                        className="rounded-[1.35rem] border border-black/8 bg-[#f8f2e8] p-4 transition-colors hover:bg-white"
                      >
                        <p className="font-sans text-base font-semibold text-[#171411]">
                          {entry.name}
                        </p>
                        {entry.organization ? (
                          <p className="mt-1 font-sans text-sm text-[#171411]/60">
                            {entry.organization}
                          </p>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            <div className="mt-8 rounded-[2rem] border border-dashed border-black/12 bg-white px-6 py-12 text-center">
              <h1 className="font-sans text-3xl font-semibold tracking-[-0.05em] text-[#171411]">
                Nominee not found
              </h1>
              <p className="mt-3 font-sans text-sm text-[#171411]/64">
                This nominee may not be public yet, or the link may have changed.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PanacheDorNomineePage;

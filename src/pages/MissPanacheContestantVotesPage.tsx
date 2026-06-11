import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Award, Loader2, Lock, Trophy } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";

type ContestantVoteCount = {
  id: string;
  slug: string;
  name: string;
  organization?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  total_votes: number;
  verified_at?: string | null;
};

const MISS_PANACHE_CONTESTANT_VOTES_API_URL =
  import.meta.env.VITE_MISS_PANACHE_CONTESTANT_VOTES_API_URL ||
  "/api/miss-panache-contestant-votes";

const formatCheckedAt = (value?: string | null) => {
  if (!value) {
    return "just now";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "just now";
  }

  return parsed.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const MissPanacheContestantVotesPage = () => {
  const { slug = "" } = useParams();
  const [password, setPassword] = useState("");
  const [contestant, setContestant] = useState<ContestantVoteCount | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(MISS_PANACHE_CONTESTANT_VOTES_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          password,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { contestant?: ContestantVoteCount; message?: string }
        | null;

      if (!response.ok || !payload?.contestant) {
        throw new Error(payload?.message || "Could not unlock this vote count.");
      }

      setContestant(payload.contestant);
      setPassword("");
    } catch (requestError) {
      setContestant(null);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not unlock this vote count."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f3ef] text-[#171411]">
      <Header />

      <main className="pb-20 pt-24 md:pb-24">
        <section className="mx-auto max-w-4xl px-6 md:px-10">
          <Link
            to="/panache-expo/miss-panache"
            className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-[#f8f2e8]"
          >
            Back to Miss Panache
          </Link>

          <div className="mt-8 rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_24px_64px_rgba(17,16,14,0.10)] md:p-8">
            <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[0.45fr_0.55fr] lg:items-start">
              <Card className="overflow-hidden rounded-[1.75rem] border-black/8 bg-[#f8f2e8] shadow-none">
                <div className="aspect-[4/5] bg-[#efe7dc]">
                  {contestant?.photo_url ? (
                    <img
                      src={contestant.photo_url}
                      alt={contestant.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Award className="h-16 w-16 text-[#171411]/30" />
                    </div>
                  )}
                </div>
              </Card>

              <div>
                <Badge className="rounded-full bg-[#f8f2e8] text-[#8241B6] hover:bg-[#f8f2e8]">
                  Private vote count
                </Badge>
                <h1 className="mt-5 font-sans text-[clamp(2.8rem,6vw,5rem)] font-semibold leading-[0.88] tracking-[-0.08em] text-[#171411]">
                  {contestant?.name || "Miss Panache"}
                </h1>
                <p className="mt-4 font-sans text-lg text-[#171411]/68">
                  Enter your private password to view only your own verified vote
                  count.
                </p>

                {!contestant ? (
                  <Card className="mt-8 rounded-[1.5rem] border-black/8 bg-white shadow-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-sans text-2xl text-[#171411]">
                        <Lock className="h-5 w-5 text-[#8241B6]" />
                        Unlock your count
                      </CardTitle>
                      <CardDescription>
                        This page is private to the contestant who owns this link.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                          <Label htmlFor="contestantPassword">Password</Label>
                          <Input
                            id="contestantPassword"
                            type="password"
                            className="mt-2 h-12 rounded-full"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your private password"
                            autoComplete="current-password"
                          />
                        </div>

                        {error ? (
                          <p className="rounded-[1rem] bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive">
                            {error}
                          </p>
                        ) : null}

                        <Button
                          type="submit"
                          variant="hero"
                          className="h-12 rounded-full px-7"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Checking...
                            </>
                          ) : (
                            "Show my votes"
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="mt-8 space-y-4">
                    <div className="rounded-[1.5rem] border border-black/8 bg-[#f8f2e8] p-6">
                      <p className="font-sans text-sm font-semibold uppercase tracking-[0.2em] text-[#8241B6]">
                        Verified votes
                      </p>
                      <div className="mt-3 flex items-end gap-3">
                        <p className="font-sans text-6xl font-semibold tracking-[-0.08em] text-[#171411]">
                          {contestant.total_votes.toLocaleString()}
                        </p>
                        <Trophy className="mb-2 h-8 w-8 text-[#8241B6]" />
                      </div>
                      <p className="mt-3 font-sans text-sm text-[#171411]/60">
                        Checked: {formatCheckedAt(contestant.verified_at)}
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] border border-black/8 bg-white p-5">
                      <p className="font-sans text-sm font-semibold text-[#171411]">
                        {contestant.organization || "Contestant"}
                      </p>
                      <p className="mt-1 font-sans text-sm text-[#171411]/60">
                        {contestant.category_name || "Miss Panache Expo 2026"}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 rounded-full border-black/12 bg-white/74 px-7 font-sans text-sm font-semibold text-[#171411] hover:bg-white"
                      onClick={() => setContestant(null)}
                    >
                      Lock again
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MissPanacheContestantVotesPage;

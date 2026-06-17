import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import {
  eventTicketsService,
  type ContestantBasePassSource,
  type EventTicketIssued,
} from "@/integrations/supabase/services";
import { Award, CheckCircle2, Download, Loader2, Lock, Mail, Ticket, Trophy } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

type VoteCountEntry = {
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

type PrivateVoteCountPageProps = {
  title: string;
  label?: string;
  backTo: string;
  source: ContestantBasePassSource;
  rpcName?:
    | "public_verify_panache_dor_contestant_password"
    | "public_verify_panache_360_contestant_password";
  verifyApiPath?: string;
};

const formatCheckedAt = (value?: string | null) => {
  if (!value) return "just now";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "just now";
  return parsed.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
};

const extractVoteCountSlug = (pathname: string) => {
  const match = pathname.match(/\/(?:contestants|nominees)\/([^/]+)\/vote-count/i);
  if (!match?.[1]) return "";

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

const PrivateVoteCountPage = ({
  title,
  label = "participant",
  backTo,
  source,
  rpcName,
  verifyApiPath,
}: PrivateVoteCountPageProps) => {
  const { slug: routeSlug = "" } = useParams();
  const location = useLocation();
  const slug = useMemo(
    () => routeSlug || extractVoteCountSlug(location.pathname),
    [location.pathname, routeSlug]
  );
  const [password, setPassword] = useState("");
  const [accessPassword, setAccessPassword] = useState("");
  const [entry, setEntry] = useState<VoteCountEntry | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerWhatsapp, setBuyerWhatsapp] = useState("");
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [ticket, setTicket] = useState<EventTicketIssued | null>(null);
  const [passNotice, setPassNotice] = useState("");
  const [passError, setPassError] = useState("");
  const [isCreatingPass, setIsCreatingPass] = useState(false);

  const resetUnlockedState = () => {
    setEntry(null);
    setAccessPassword("");
    setBuyerName("");
    setBuyerEmail("");
    setBuyerWhatsapp("");
    setWhatsappConsent(false);
    setTicket(null);
    setPassNotice("");
    setPassError("");
  };

  const verifyVoteCount = async (submittedPassword: string) => {
    if (rpcName) {
      const { data, error: rpcError } = await (supabase as any).rpc(rpcName, {
        p_slug: slug,
        p_password: submittedPassword,
      });

      if (rpcError) throw rpcError;
      return Array.isArray(data) ? data[0] : null;
    }

    if (!verifyApiPath) {
      throw new Error("Vote-count verification is not configured.");
    }

    const response = await fetch(verifyApiPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        password: submittedPassword,
      }),
    });
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
      contestant?: VoteCountEntry;
    } | null;

    if (!response.ok || !payload?.contestant) {
      throw new Error(payload?.message || "Invalid private password.");
    }

    return payload.contestant;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const submittedPassword = password;
      const unlockedEntry = await verifyVoteCount(submittedPassword);
      if (!unlockedEntry) {
        throw new Error("Invalid private password.");
      }

      setEntry(unlockedEntry);
      setAccessPassword(submittedPassword);
      setBuyerName(unlockedEntry.name || "");
      setBuyerEmail("");
      setBuyerWhatsapp("");
      setWhatsappConsent(false);
      setTicket(null);
      setPassNotice("");
      setPassError("");
      setPassword("");
    } catch (requestError) {
      resetUnlockedState();
      setError(requestError instanceof Error ? requestError.message : "Could not unlock this vote count.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePass = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPassError("");
    setPassNotice("");
    setIsCreatingPass(true);

    try {
      if (!entry || !accessPassword) {
        throw new Error("Unlock your vote count again before creating a pass.");
      }

      const result = await eventTicketsService.createContestantBasePass({
        source,
        slug: entry.slug || slug,
        password: accessPassword,
        buyerName: buyerName || entry.name,
        buyerEmail,
        buyerWhatsapp,
        whatsappConsent,
      });

      if (!result.ticket) {
        throw new Error(result.message || "Could not create the base pass.");
      }

      setTicket(result.ticket);
      setPassNotice(
        result.status === "already-created"
          ? "Your base pass already existed. The same pass is ready to download."
          : "Your base pass is ready to download."
      );
    } catch (requestError) {
      setPassError(
        requestError instanceof Error
          ? requestError.message
          : "Could not create the base event pass."
      );
    } finally {
      setIsCreatingPass(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f3ef] text-[#171411]">
      <Header />
      <main className="pb-20 pt-24 md:pb-24">
        <section className="mx-auto max-w-4xl px-6 md:px-10">
          <Link
            to={backTo}
            className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-[#f8f2e8]"
          >
            Back to {title}
          </Link>

          <div className="mt-8 rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_24px_64px_rgba(17,16,14,0.10)] md:p-8">
            <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[0.45fr_0.55fr] lg:items-start">
              <Card className="overflow-hidden rounded-[1.75rem] border-black/8 bg-[#f8f2e8] shadow-none">
                <div className="aspect-[4/5] bg-[#efe7dc]">
                  {entry?.photo_url ? (
                    <img src={entry.photo_url} alt={entry.name} className="h-full w-full object-cover" />
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
                  {entry?.name || title}
                </h1>
                <p className="mt-4 font-sans text-lg text-[#171411]/68">
                  Enter your private password to view only your own verified vote count.
                </p>

                {!entry ? (
                  <Card className="mt-8 rounded-[1.5rem] border-black/8 bg-white shadow-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-sans text-2xl text-[#171411]">
                        <Lock className="h-5 w-5 text-[#8241B6]" />
                        Unlock your count
                      </CardTitle>
                      <CardDescription>This page is private to the {label} who owns this link.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                          <Label htmlFor="privatePassword">Password</Label>
                          <Input
                            id="privatePassword"
                            type="password"
                            className="mt-2 h-12 rounded-full"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your private password"
                            autoComplete="current-password"
                          />
                        </div>

                        {error ? (
                          <p className="rounded-[1rem] bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive">{error}</p>
                        ) : null}

                        <Button type="submit" variant="hero" className="h-12 rounded-full px-7" disabled={isLoading}>
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
                      <p className="font-sans text-sm font-semibold uppercase tracking-[0.2em] text-[#8241B6]">Verified votes</p>
                      <div className="mt-3 flex items-end gap-3">
                        <p className="font-sans text-6xl font-semibold tracking-[-0.08em] text-[#171411]">
                          {(entry.total_votes || 0).toLocaleString()}
                        </p>
                        <Trophy className="mb-2 h-8 w-8 text-[#8241B6]" />
                      </div>
                      <p className="mt-3 font-sans text-sm text-[#171411]/60">Checked: {formatCheckedAt(entry.verified_at)}</p>
                    </div>

                    <div className="rounded-[1.5rem] border border-black/8 bg-white p-5">
                      <p className="font-sans text-sm font-semibold text-[#171411]">{entry.organization || label}</p>
                      <p className="mt-1 font-sans text-sm text-[#171411]/60">{entry.category_name || title}</p>
                    </div>

                    <Card className="rounded-[1.5rem] border-black/8 bg-white shadow-none">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-sans text-2xl text-[#171411]">
                          <Ticket className="h-5 w-5 text-[#8241B6]" />
                          Base event pass
                        </CardTitle>
                        <CardDescription>
                          Create one complimentary access pass from this private link. It uses the same QR ticket format as the 2,000 XAF access ticket, without payment.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {ticket ? (
                          <div className="space-y-4">
                            {passNotice ? (
                              <p className="flex items-start gap-2 rounded-[1rem] bg-emerald-50 px-4 py-3 font-sans text-sm text-emerald-800">
                                <CheckCircle2 className="mt-0.5 h-4 w-4" />
                                <span>{passNotice}</span>
                              </p>
                            ) : null}

                            <div className="rounded-[1.25rem] border border-black/8 bg-[#f8f2e8] p-5">
                              <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#8241B6]">
                                Ticket code
                              </p>
                              <p className="mt-2 font-sans text-2xl font-semibold text-[#171411]">
                                {ticket.ticket_code}
                              </p>
                              <p className="mt-3 font-sans text-sm text-[#171411]/64">
                                {ticket.package.name} | {ticket.admit_count} guest
                                {ticket.admit_count === 1 ? "" : "s"} | {ticket.event.event_date_label}
                              </p>
                              <p className="mt-1 font-sans text-sm text-[#171411]/64">
                                {ticket.event.venue}
                              </p>
                            </div>

                            <Button asChild variant="hero" className="h-12 rounded-full px-7">
                              <a href={ticket.download_url}>
                                <Download className="h-4 w-4" />
                                Download PDF pass
                              </a>
                            </Button>
                          </div>
                        ) : (
                          <form className="space-y-4" onSubmit={handleCreatePass}>
                            <div>
                              <Label htmlFor="basePassName">Name on pass</Label>
                              <Input
                                id="basePassName"
                                className="mt-2 h-12 rounded-full"
                                value={buyerName}
                                onChange={(event) => setBuyerName(event.target.value)}
                                placeholder="Name to print on the pass"
                              />
                            </div>

                            <div>
                              <Label htmlFor="basePassEmail">Email for the pass</Label>
                              <div className="relative mt-2">
                                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#171411]/40" />
                                <Input
                                  id="basePassEmail"
                                  type="email"
                                  className="h-12 rounded-full pl-11"
                                  value={buyerEmail}
                                  onChange={(event) => setBuyerEmail(event.target.value)}
                                  placeholder="name@example.com"
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="basePassWhatsapp">WhatsApp number</Label>
                              <Input
                                id="basePassWhatsapp"
                                className="mt-2 h-12 rounded-full"
                                value={buyerWhatsapp}
                                onChange={(event) => setBuyerWhatsapp(event.target.value)}
                                placeholder="Optional"
                              />
                            </div>

                            {buyerWhatsapp ? (
                              <label
                                htmlFor="basePassWhatsappConsent"
                                className="flex cursor-pointer items-start gap-3 rounded-[1rem] border border-black/8 bg-[#f8f2e8] p-4 font-sans text-sm text-[#171411]/70"
                              >
                                <Checkbox
                                  id="basePassWhatsappConsent"
                                  checked={whatsappConsent}
                                  onCheckedChange={(checked) => setWhatsappConsent(Boolean(checked))}
                                  className="mt-0.5"
                                />
                                I agree that Panache can use this WhatsApp number for ticket support and event updates.
                              </label>
                            ) : null}

                            {passError ? (
                              <p className="rounded-[1rem] bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive">
                                {passError}
                              </p>
                            ) : null}

                            <Button type="submit" variant="hero" className="h-12 rounded-full px-7" disabled={isCreatingPass}>
                              {isCreatingPass ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Creating pass...
                                </>
                              ) : (
                                <>
                                  <Ticket className="h-4 w-4" />
                                  Create base pass
                                </>
                              )}
                            </Button>
                          </form>
                        )}
                      </CardContent>
                    </Card>

                    <Button type="button" variant="outline" className="h-12 rounded-full border-black/12 bg-white/74 px-7 font-sans text-sm font-semibold text-[#171411] hover:bg-white" onClick={resetUnlockedState}>
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

export default PrivateVoteCountPage;

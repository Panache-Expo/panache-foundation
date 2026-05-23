import handler from "./panache-dor-revenue-lite.js";

const moneyAmount = (value) => Math.round(Number(value || 0));

const ignoreProcessingFee = (payload) => {
  const revenue = payload?.revenue;
  if (!revenue) {
    return payload;
  }

  const grossVoteRevenueXaf = moneyAmount(revenue.gross_vote_revenue_xaf);
  const providerFeesXaf = moneyAmount(revenue.estimated_provider_fees_xaf);
  const configuredProcessingFeePerVoteXaf = moneyAmount(
    revenue.processing_fee_per_vote_xaf
  );
  const ignoredProcessingFeeXaf = moneyAmount(
    revenue.ignored_processing_fee_xaf ||
      revenue.estimated_processing_fee_collected_xaf ||
      configuredProcessingFeePerVoteXaf * moneyAmount(revenue.total_votes)
  );

  return {
    ...payload,
    revenue: {
      ...revenue,
      processing_fee_per_vote_xaf: 0,
      ignored_processing_fee_xaf: ignoredProcessingFeeXaf,
      estimated_processing_fee_collected_xaf: 0,
      estimated_total_collected_xaf: grossVoteRevenueXaf,
      estimated_net_revenue_xaf: moneyAmount(grossVoteRevenueXaf - providerFeesXaf),
      assumptions: [
        ...(revenue.assumptions || []).filter(
          (assumption) =>
            !String(assumption).toLowerCase().includes("processing fee")
        ),
        "Estimated total collected ignores processing fees and uses vote-price revenue only.",
      ],
    },
  };
};

export default async function revenueHandler(req, res) {
  const originalEnd = res.end.bind(res);

  res.end = (body, ...args) => {
    try {
      const text = Buffer.isBuffer(body) ? body.toString("utf8") : String(body || "");
      const payload = JSON.parse(text);
      return originalEnd(JSON.stringify(ignoreProcessingFee(payload)), ...args);
    } catch {
      return originalEnd(body, ...args);
    }
  };

  return handler(req, res);
}

// utils/calculateCharges.js
const RATES = {
  BROKERAGE_INTRADAY_RATE: 0.0003, // 0.03% of turnover
  BROKERAGE_INTRADAY_CAP: 20, // ₹20 cap per order
  STT_INTRADAY_SELL: 0.00025, // 0.025% on sell for intraday
  STT_DELIVERY: 0.001, // 0.1% on buy and 0.1% on sell for delivery
  EXCHANGE_TXN_NSE: 0.0000325, // 0.00325% of turnover (NSE)
  SEBI_CHARGE: 0.000001, // ₹10 per crore = 1e-6
  STAMP_DUTY_BUY_DELIVERY: 0.00015, // 0.015% on buy for delivery
  GST_RATE: 0.18, // 18%
  DP_CHARGE_PER_SCRIP: 13.5, // ₹13.5 + GST (flat per scrip on delivery sell)
};

function round2(x) {
  // Always return Number rounded to 2 decimals
  return Number(Number(x || 0).toFixed(2));
}

export default function calculateChargesFromDates(
  tradeCategory,
  entryPrice,
  exitPrice,
  qty
) {
  if (!exitPrice || !entryPrice || !qty) {
    return {
      breakdown: {},
      totals: {
        totalCharges: 0,
        grossPnL: 0,
        netPnL: 0,
      },
    };
  }

  const buyValue = entryPrice * qty;
  const sellValue = exitPrice * qty;
  const turnover = buyValue + sellValue;

  let brokerage = 0;
  if (tradeCategory === "intraday") {
    const maybe = RATES.BROKERAGE_INTRADAY_RATE * turnover;
    brokerage = Math.min(RATES.BROKERAGE_INTRADAY_CAP, maybe);
  } else {
    brokerage = 0;
  }

  let sttBuy = 0;
  let sttSell = 0;
  if (tradeCategory === "intraday") {
    sttSell = RATES.STT_INTRADAY_SELL * sellValue;
  } else {
    sttBuy = RATES.STT_DELIVERY * buyValue;
    sttSell = RATES.STT_DELIVERY * sellValue;
  }
  const sttTotal = sttBuy + sttSell;

  const exchangeTxn = RATES.EXCHANGE_TXN_NSE * turnover;

  const sebiCharges = RATES.SEBI_CHARGE * turnover;

  const stampDuty =
    tradeCategory === "delivery" ? RATES.STAMP_DUTY_BUY_DELIVERY * buyValue : 0;

  const dpCharges =
    tradeCategory === "delivery" && sellValue > 0
      ? RATES.DP_CHARGE_PER_SCRIP * (1 + RATES.GST_RATE)
      : 0;

  const gst = RATES.GST_RATE * (brokerage + exchangeTxn);

  const totalCharges =
    round2(brokerage) +
    round2(sttTotal) +
    round2(exchangeTxn) +
    round2(sebiCharges) +
    round2(stampDuty) +
    round2(gst) +
    round2(dpCharges);

  const grossPnL = (exitPrice - entryPrice) * qty;
  const netPnL = round2(grossPnL) - round2(totalCharges);

  const breakdown = {
    brokerage: round2(brokerage),
    sttBuy: round2(sttBuy),
    sttSell: round2(sttSell),
    sttTotal: round2(sttTotal),
    exchangeTxn: round2(exchangeTxn),
    sebiCharges: round2(sebiCharges),
    stampDuty: round2(stampDuty),
    gst: round2(gst),
    dpCharges: round2(dpCharges),
  };

  const totals = {
    totalCharges: round2(totalCharges),
    grossPnL: round2(grossPnL),
    netPnL: round2(netPnL),
    turnover: round2(turnover),
  };

  return { breakdown, totals, totalCharges };
}

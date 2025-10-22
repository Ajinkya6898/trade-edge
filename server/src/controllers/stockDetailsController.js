// src/controllers/stockDetailsController.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = "https://www.alphavantage.co/query";
const FMP_BASE_URL = "https://financialmodelingprep.com/api/v3";
const FMP_API_KEY = process.env.FMP_API_KEY;

console.log("FMP_API_KEY:", process.env.FMP_API_KEY);

// Helper function to format Indian stock symbols for Alpha Vantage
const formatIndianSymbol = (symbol) => {
  // Alpha Vantage uses format: SYMBOL.BSE or SYMBOL.NSE
  // If symbol already has exchange suffix, return as is
  if (symbol.includes(".")) {
    return symbol;
  }
  // Try both BSE and NSE - Alpha Vantage coverage varies
  // For testing, we'll return the symbol without suffix first
  return symbol;
};

// Helper function to make API calls with error handling
const fetchAlphaVantageData = async (params) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: { ...params, apikey: ALPHA_VANTAGE_API_KEY },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    throw new Error(`API request failed: ${error.message}`);
  }
};

const fetchFMPData = async (endpoint, symbol, additionalParams = {}) => {
  try {
    const response = await axios.get(`${FMP_BASE_URL}${endpoint}`, {
      params: {
        symbol,
        apikey: FMP_API_KEY,
        ...additionalParams,
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    throw new Error(`FMP API request failed: ${error.message}`);
  }
};

// Format NSE symbols for FMP (they use .NS suffix)
const formatNSESymbol = (symbol) => {
  // If symbol already has .NS, return as is
  if (symbol.includes(".NS")) return symbol;
  // Otherwise add .NS suffix for NSE stocks
  return `${symbol}.NS`;
};

// Get company overview
export const getStockInfo = async (req, res) => {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: "Stock symbol is required." });
  }

  try {
    const formattedSymbol = formatIndianSymbol(symbol);
    const data = await fetchAlphaVantageData({
      function: "OVERVIEW",
      symbol: formattedSymbol,
    });

    if (!data.Symbol || data.Note) {
      return res.status(404).json({
        error: "No data found for this symbol or API limit reached.",
      });
    }

    const stockData = {
      name: data.Name,
      symbol: data.Symbol,
      sector: data.Sector || "N/A",
      industry: data.Industry || "N/A",
      exchange: data.Exchange || "N/A",
      currency: data.Currency || "INR",
      description: data.Description,
      marketCap: data.MarketCapitalization,
      pe_ratio: data.PERatio || "N/A",
      peg_ratio: data.PEGRatio || "N/A",
      book_value: data.BookValue || "N/A",
      dividend_yield: data.DividendYield || "N/A",
      eps: data.EPS || "N/A",
      week_52_high: data["52WeekHigh"] || "N/A",
      week_52_low: data["52WeekLow"] || "N/A",
    };

    res.json(stockData);
  } catch (error) {
    console.error("❌ Error fetching stock info:", error);
    res.status(500).json({
      error: "Failed to fetch stock info. Please try again.",
      details: error.message,
    });
  }
};

// Get current quote and price data
export const getStockQuote = async (req, res) => {
  const { symbol, exchange } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: "Stock symbol is required." });
  }

  try {
    // Try different symbol formats for Indian stocks
    const symbolVariants = [
      symbol, // As is
      `${symbol}.BSE`, // Bombay Stock Exchange
      `${symbol}.NSE`, // National Stock Exchange
      `${symbol}.NS`, // Yahoo Finance format
      `${symbol}.BO`, // Yahoo Finance BSE format
    ];

    let data = null;
    let successfulSymbol = null;

    // Try each variant until we get data
    for (const variant of symbolVariants) {
      try {
        const response = await fetchAlphaVantageData({
          function: "GLOBAL_QUOTE",
          symbol: variant,
        });

        if (
          response["Global Quote"] &&
          Object.keys(response["Global Quote"]).length > 0
        ) {
          data = response;
          successfulSymbol = variant;
          break;
        }
      } catch (err) {
        console.log(`Failed to fetch with symbol: ${variant}`);
        continue;
      }
    }

    if (
      !data ||
      !data["Global Quote"] ||
      Object.keys(data["Global Quote"]).length === 0
    ) {
      return res.status(404).json({
        error: "No quote data found for this symbol.",
        message:
          "Alpha Vantage may not support this Indian stock. Try using US stock symbols (e.g., AAPL, TSLA) for testing.",
        attempted_symbols: symbolVariants,
      });
    }

    const quote = data["Global Quote"];
    const quoteData = {
      symbol: quote["01. symbol"],
      searched_with: successfulSymbol,
      price: parseFloat(quote["05. price"]),
      change: parseFloat(quote["09. change"]),
      change_percent: quote["10. change percent"],
      volume: parseInt(quote["06. volume"]),
      latest_trading_day: quote["07. latest trading day"],
      previous_close: parseFloat(quote["08. previous close"]),
      open: parseFloat(quote["02. open"]),
      high: parseFloat(quote["03. high"]),
      low: parseFloat(quote["04. low"]),
    };

    res.json(quoteData);
  } catch (error) {
    console.error("❌ Error fetching stock quote:", error);
    res.status(500).json({
      error: "Failed to fetch stock quote.",
      details: error.message,
    });
  }
};

// Get technical indicators for a trade
export const getTechnicalIndicators = async (req, res) => {
  const { symbol, interval = "daily" } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: "Stock symbol is required." });
  }

  try {
    const formattedSymbol = formatNSESymbol(symbol);

    // Fetch technical indicators from FMP
    const [technicalData, quote] = await Promise.all([
      // Technical indicators endpoint
      fetchFMPData("/technical_indicator/daily", formattedSymbol, {
        period: 14, // for RSI, ADX
        type: "rsi,ema,adx,atr,macd",
      }),
      // Get current quote for additional data
      fetchFMPData("/quote", formattedSymbol),
    ]);

    // Helper to get the latest value from array
    const getLatestValue = (dataArray, field) => {
      if (!dataArray || dataArray.length === 0) return null;
      const latest = dataArray[0]; // FMP returns most recent first
      return {
        date: latest.date,
        value: parseFloat(latest[field]),
      };
    };

    // Extract EMA values for different periods
    const getEMAValues = (dataArray) => {
      if (!dataArray || dataArray.length === 0) return {};

      const latest = dataArray[0];
      return {
        ema_10: latest.ema10
          ? { date: latest.date, value: parseFloat(latest.ema10) }
          : null,
        ema_20: latest.ema20
          ? { date: latest.date, value: parseFloat(latest.ema20) }
          : null,
        ema_50: latest.ema50
          ? { date: latest.date, value: parseFloat(latest.ema50) }
          : null,
        ema_100: latest.ema100
          ? { date: latest.date, value: parseFloat(latest.ema100) }
          : null,
        ema_200: latest.ema200
          ? { date: latest.date, value: parseFloat(latest.ema200) }
          : null,
      };
    };

    // Extract MACD values
    const getMACDValues = (dataArray) => {
      if (!dataArray || dataArray.length === 0) return null;
      const latest = dataArray[0];
      return {
        date: latest.date,
        macd: parseFloat(latest.macd),
        signal: parseFloat(latest.signal),
        histogram: parseFloat(latest.histogram),
      };
    };

    const responseData = {
      symbol: formattedSymbol,
      interval,
      timestamp: new Date().toISOString(),
      currentPrice: quote[0]?.price || null,
      indicators: {
        rsi: getLatestValue(technicalData, "rsi"),
        macd: getMACDValues(technicalData),
        adx: getLatestValue(technicalData, "adx"),
        atr: getLatestValue(technicalData, "atr"),
        ema: getEMAValues(technicalData),
      },
    };

    res.json(responseData);
  } catch (error) {
    console.error("❌ Error fetching technical indicators:", error);
    res.status(500).json({
      error: "Failed to fetch technical indicators.",
      details: error.message,
    });
  }
};

// Get historical price data for a trade
export const getHistoricalData = async (req, res) => {
  const { symbol, outputsize = "compact" } = req.query; // compact = last 100 days, full = 20+ years

  if (!symbol) {
    return res.status(400).json({ error: "Stock symbol is required." });
  }

  try {
    const formattedSymbol = formatIndianSymbol(symbol);
    const data = await fetchAlphaVantageData({
      function: "TIME_SERIES_DAILY",
      symbol: formattedSymbol,
      outputsize,
    });

    if (!data["Time Series (Daily)"]) {
      return res.status(404).json({
        error: "No historical data found for this symbol.",
      });
    }

    const timeSeries = data["Time Series (Daily)"];
    const historicalData = Object.entries(timeSeries).map(([date, values]) => ({
      date,
      open: parseFloat(values["1. open"]),
      high: parseFloat(values["2. high"]),
      low: parseFloat(values["3. low"]),
      close: parseFloat(values["4. close"]),
      volume: parseInt(values["5. volume"]),
    }));

    res.json({
      symbol: formattedSymbol,
      data: historicalData,
    });
  } catch (error) {
    console.error("❌ Error fetching historical data:", error);
    res.status(500).json({
      error: "Failed to fetch historical data.",
      details: error.message,
    });
  }
};

// Comprehensive trade analysis - combines multiple endpoints
export const getTradeAnalysis = async (req, res) => {
  const { symbol, date } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: "Stock symbol is required." });
  }

  try {
    const formattedSymbol = formatIndianSymbol(symbol);

    // Fetch overview, quote, and technical indicators
    const [overview, quote, technical] = await Promise.all([
      fetchAlphaVantageData({
        function: "OVERVIEW",
        symbol: formattedSymbol,
      }),
      fetchAlphaVantageData({
        function: "GLOBAL_QUOTE",
        symbol: formattedSymbol,
      }),
      fetchAlphaVantageData({
        function: "RSI",
        symbol: formattedSymbol,
        interval: "daily",
        time_period: 14,
        series_type: "close",
      }),
    ]);

    const globalQuote = quote["Global Quote"] || {};
    const rsiData = technical["Technical Analysis: RSI"];
    const latestRSI = rsiData ? Object.values(rsiData)[0]?.RSI : null;

    const analysisData = {
      symbol: formattedSymbol,
      company_name: overview.Name || "N/A",
      sector: overview.Sector || "N/A",
      current_price: parseFloat(globalQuote["05. price"] || 0),
      change: parseFloat(globalQuote["09. change"] || 0),
      change_percent: globalQuote["10. change percent"] || "N/A",
      volume: parseInt(globalQuote["06. volume"] || 0),
      pe_ratio: overview.PERatio || "N/A",
      market_cap: overview.MarketCapitalization || "N/A",
      week_52_high: overview["52WeekHigh"] || "N/A",
      week_52_low: overview["52WeekLow"] || "N/A",
      rsi: latestRSI ? parseFloat(latestRSI) : null,
      trade_date: date || globalQuote["07. latest trading day"],
    };

    res.json(analysisData);
  } catch (error) {
    console.error("❌ Error fetching trade analysis:", error);
    res.status(500).json({
      error: "Failed to fetch trade analysis.",
      details: error.message,
    });
  }
};

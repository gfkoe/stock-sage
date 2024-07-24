"use server";
import yahooFinance from "yahoo-finance2";


export async function getStock(ticker: string) {
  const stock = await yahooFinance.quoteSummary(ticker);

  const regularMarketPrice = stock?.price?.regularMarketPrice;
  const symbol = stock?.price?.symbol;
  return { regularMarketPrice, symbol };
}

export default getStock;

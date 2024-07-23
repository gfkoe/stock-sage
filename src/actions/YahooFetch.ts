"use server";
import yahooFinance from "yahoo-finance2";

type Stock = {
  name: string;
  price: number;
  targetPrice?: number;
};

export async function getStock(ticker: string) {
  console.log(ticker);
  const stock = await yahooFinance.quoteSummary(ticker);

  const regularMarketPrice = stock?.price?.regularMarketPrice;
  const symbol = stock?.price?.symbol;
  console.log(regularMarketPrice, symbol);
  return { regularMarketPrice, symbol };
}

export async function checkPrice(stock: Stock) {
  //
}
export default getStock;

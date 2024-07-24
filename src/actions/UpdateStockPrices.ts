import yahooFinance from 'yahoo-finance2';
import { getStock } from '@/actions/YahooFetch';

type Stock = {
  name: string;
  price: number;
  targetPrice?: number;
};

export const updateStockPrices = async (stocks: Stock[]) => {
  const updatedStocks = await Promise.all(
    stocks.map(async (stock) => {
      try {
        const { regularMarketPrice } = await getStock(stock.name);
        return { ...stock, price: regularMarketPrice };
      } catch (error) {
        console.error(`Failed to update price for ${stock.name}:`, error);
        return stock;
      }
    })
  );
  return updatedStocks;
};

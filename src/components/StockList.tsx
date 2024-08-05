"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getStock } from "@/actions/YahooFetch";
import AlertComponent from "@/components/Alert";
import { UserAuthForm } from "@/components/UserAuthForm";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

type Stock = {
  name: string;
  price: number;
  targetPrice?: number;
};

function StockList() {
  const { status } = useSession();
  const loggedIn = status === "authenticated";

  const [stocks, setStocks] = useState<Stock[]>(() => {
    if (typeof window !== "undefined") {
      const savedStocks = localStorage.getItem("stocks");
      return savedStocks ? JSON.parse(savedStocks) : [];
    }
    return [];
  });

  const [stockName, setStockName] = useState<string>("");
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [showLogIn, setShowLogIn] = useState<boolean>(false);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("stocks", JSON.stringify(stocks));
    }
  }, [stocks, isClient]);

  // Fetch and update stock prices

  // Poll for updates to stock prices every second
  useEffect(() => {
    const fetchStockPrices = async () => {
      if (stocks.length > 0) {
        for (const stock of stocks) {
          await updateStockPrice(stock);
        }
      }
    };
    const updateStockPrice = async (stock: Stock): Promise<void> => {
      try {
        const checkStockPrice = await checkPrice(stock.name);
        if (checkStockPrice != null && checkStockPrice !== stock.price) {
          setStocks((prevStocks) =>
            prevStocks.map((s) =>
              s.name === stock.name ? { ...s, price: checkStockPrice } : s,
            ),
          );
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      }
    };
    fetchStockPrices(); // Initial fetch to populate data
    const intervalId = setInterval(() => {
      stocks.forEach((stock) => {
        updateStockPrice(stock);
      });
    }, 10000); // Poll every 1 second

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [stocks]);

  // Handle change in stock input field
  function handleStockChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setStockName(event.target.value);
  }

  function handleTargetPriceChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    setTargetPrice(Number(event.target.value));
  }

  // Add a stock to the list
  async function addToList(): Promise<void> {
    if (!loggedIn) {
      setShowLogIn(true);
      return;
    }
    if (!stockName) return;
    try {
      const { regularMarketPrice, symbol } = await getStock(stockName);
      const stock = { name: symbol, price: regularMarketPrice };
      setStocks((prevStocks) => [...prevStocks, stock as Stock]);
      setStockName("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }

  // Remove a stock from the list
  async function removeFromList(stock: Stock): Promise<void> {
    try {
      setStocks((prevStocks) =>
        prevStocks.filter((s) => s.name !== stock.name),
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }

  // Close the alert component
  function closeAlert(): void {
    setError(null);
  }

  // Handle user login
  function handleLogin(): void {
    setShowLogIn(false);
  }

  // Set the target price for a stock
  function updateTargetPrice(stock: Stock, targetPrice: number): void {
    if (targetPrice <= 0) return;
    try {
      setStocks((prevStocks) =>
        prevStocks.map((s) =>
          s.name === stock.name ? { ...s, targetPrice: targetPrice } : s,
        ),
      );
      //stock.targetPrice = targetPrice;
      setTargetPrice(0);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }

  // Check the price of a stock using Yahoo Finance API
  const checkPrice = async (ticker: string) => {
    try {
      const checkStock = await getStock(ticker);
      return checkStock?.regularMarketPrice;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  // Update the price of a stock

  return (
    <div className="flex space-evenly flex-col space-y-4">
      <div className="h-16 flex flex-col items-center">
        {error && (
          <AlertComponent
            alertTitle="Error"
            alertDescription={error}
            onClose={closeAlert}
          />
        )}
      </div>

      <br />
      <br />
      <div className="flex items-center justify-center">
        <label>STOCK:</label>
        &nbsp;
        <Input
          className="w-3/4"
          id="stockName"
          type="text"
          placeholder="Ex: NVDA"
          name="stockName"
          value={stockName}
          onChange={handleStockChange}
          maxLength={10}
        />
        &nbsp;
        <Button onClick={addToList} type="submit">
          Add
        </Button>
      </div>
      {showLogIn && (
        <div className="h-16 flex flex-col items-center">
          <UserAuthForm onSubmit={handleLogin} />
        </div>
      )}

      {isClient && stocks.length > 0 && (
        <Table>
          <TableHeader className="">
            <TableRow className="w-full">
              <TableHead className="w-1/4 text-center">Stock</TableHead>
              <TableHead className="w-1/4 text-center">Current Price</TableHead>
              <TableHead className="w-1/4 text-center">Target price</TableHead>
              <TableHead className="w-1/4 text-center">Adjust</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stocks.map((stock, index) => (
              <TableRow className="" key={index}>
                <TableCell className="font-medium w-1/4 text-center">
                  {stock.name}
                </TableCell>
                <TableCell className="w-1/4 text-center">
                  ${Number(stock.price).toFixed(2)}
                </TableCell>
                <TableCell className="w-1/4 text-center">
                  {typeof stock.targetPrice === "number"
                    ? `$${Number(stock.targetPrice).toFixed(2)}`
                    : "--"}
                </TableCell>
                <TableCell className="w-1/4 text-center">
                  <Button
                    variant="destructive"
                    onClick={() => removeFromList(stock)}
                    className="w-1/6"
                  >
                    X
                  </Button>
                  &nbsp;
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Edit Price</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Target Price</DialogTitle>

                        <DialogDescription>
                          Set the target price for the stock here
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-center">
                        <Input
                          type="number"
                          placeholder="Enter target price"
                          value={stock.targetPrice || targetPrice}
                          onChange={handleTargetPriceChange}
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button
                            onClick={() =>
                              updateTargetPrice(stock, targetPrice)
                            }
                            type="submit"
                          >
                            Submit
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default StockList;

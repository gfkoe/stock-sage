"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getStock } from "@/actions/YahooFetch";
import AlertComponent from "@/components/Alert";
import { sendNotificationOfStockPriceChange } from "@/actions/Notifications";
import { useSubscription } from "@/components/SubscriptionProvider";
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
  targetPrice?: string;
  currentPriceIsHigher?: boolean;
};

function StockList() {
  const { status } = useSession();
  const loggedIn = status === "authenticated";

  const { subscription } = useSubscription();

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
        console.log(stock.price, stock.targetPrice);
        if (
          stock.currentPriceIsHigher &&
          stock.targetPrice &&
          stock.price <= parseFloat(stock.targetPrice)
        ) {
          if (subscription) {
            sendNotificationOfStockPriceChange(
              subscription,
              stock.name,
              parseFloat(stock.targetPrice),
            );
          }
        }
        if (
          !stock.currentPriceIsHigher &&
          stock.targetPrice &&
          stock.price >= parseFloat(stock.targetPrice)
        ) {
          if (subscription) {
            sendNotificationOfStockPriceChange(
              subscription,
              stock.name,
              parseFloat(stock.targetPrice),
            );
          }
        }
      });
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [stocks]);

  // Handle change in stock input field
  function handleStockChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setStockName(event.target.value);
  }

  function handleTargetPriceChange(
    event: React.ChangeEvent<HTMLInputElement>,
    stockName: string,
  ): void {
    const value = event.target.value;

    // Regex to allow only valid dollar amounts with up to two decimal places
    const validDollarAmount = /^\d+(\.\d{0,2})?$/;

    if (validDollarAmount.test(value)) {
      const parsedValue = parseFloat(value) || 0;
      setTargetPrice(parsedValue);

      // Update the target price for the corresponding stock
      setStocks((prevStocks) =>
        prevStocks.map((stock) =>
          stock.name === stockName ? { ...stock, targetPrice: value } : stock,
        ),
      );

      // Save updated stocks to localStorage (if necessary)
      if (typeof window !== "undefined") {
        localStorage.setItem("stocks", JSON.stringify(stocks));
      }
    }
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
  function updateTargetPrice(stock: Stock): void {
    if (targetPrice <= 0) return;
    try {
      setStocks((prevStocks) =>
        prevStocks.map((s) =>
          s.name === stock.name
            ? { ...s, targetPrice: targetPrice.toString() }
            : s,
        ),
      );
      if (stock.price < targetPrice) {
        stock.currentPriceIsHigher = false;
      } else if (stock.price > targetPrice) {
        stock.currentPriceIsHigher = true;
      }
      //stock.targetPrice = targetPrice;
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
  const sendNotiticationOfStock = async (stock: Stock) => {
    try {
      await fetch("/api/notification", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          subscription: subscription,
          text:
            stock.name + " has reached target value of " + stock.targetPrice,
        }),
        signal: AbortSignal.timeout(10000),
      });
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "TimeoutError") {
          console.error("Timeout: It took too long to get the result.");
        } else if (err.name === "AbortError") {
          console.error(
            "Fetch aborted by user action (browser stop button, closing tab, etc.)",
          );
        } else if (err.name === "TypeError") {
          console.error("The AbortSignal.timeout() method is not supported.");
        } else {
          // A network error, or some other problem.
          console.error(`Error: type: ${err.name}, message: ${err.message}`);
        }
      } else {
        console.error(err);
      }
      alert("An error happened.");
    }
  };

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
                  {typeof stock.targetPrice
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
                      <div className="flex justify-center items-center">
                        <label>$</label>
                        &nbsp; &nbsp;
                        <Input
                          type="text"
                          inputMode="decimal"
                          placeholder="Enter target price"
                          value={stock.targetPrice}
                          onChange={(e) =>
                            handleTargetPriceChange(e, stock.name)
                          }
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button
                            onClick={() => updateTargetPrice(stock)}
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

"use client";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getStock } from "@/actions/YahooFetch";
import AlertComponent from "@/components/Alert";
import { UserAuthForm } from "@/components/UserAuthForm";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Stock = {
  name: string;
  price: number;
  targetPrice?: number;
};

function StockList() {
  const { data: session, status } = useSession();

  const [stocks, setStocks] = useState<Stock[]>(() => {
    if (typeof window !== "undefined") {
      const savedStocks = localStorage.getItem("stocks");
      return savedStocks ? JSON.parse(savedStocks) : [];
    }
  });

  const [stockName, setStockName] = useState<string>("");

  const [error, setError] = useState<string | null>(null);

  //  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const [showLogIn, setShowLogIn] = useState<boolean>(false);

  const [showList, setShowList] = useState<boolean>(stocks?.length > 0);

  const loggedIn = status === "authenticated";

  useEffect(() => {
    localStorage.setItem("stocks", JSON.stringify(stocks));
  }, [stocks]);

  function handleChange(event: React.ChangeEvent<any>): void {
    setStockName(event.target.value);
  }

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
      setShowList(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }

  async function removeFromList(stock: Stock): Promise<void> {
    try {
      setStocks((prevStocks) => [...prevStocks, stock as Stock]);

      const newStocks = stocks.filter((s: Stock) => s.name !== stock.name);

      setStocks(newStocks);

      if (newStocks?.length === 0) {
        setShowList(false);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }

  function closeAlert(): void {
    setError(null);
  }

  function handleLogin(): void {
    setShowLogIn(false);
  }

  function setTargetPrice(stock: Stock, targetPrice: number): void {
    if (targetPrice != null) {
      stock.targetPrice = targetPrice;
    }
  }

  function updateStockPrice(stock: Stock, newPrice: number): void {
    if (newPrice != null && newPrice != stock.price) {
      stock.price = newPrice;
    }
  }

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
          onChange={handleChange}
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

      {showList && (
        <Table>
          <TableHeader className="">
            <TableRow className="">
              <TableHead className="text-left">Stock</TableHead>
              <TableHead className="text-center">Current Price</TableHead>
              <TableHead className="text-center">Target price</TableHead>
              <TableHead className="text-right w-[100px]">Adjust</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stocks.map((stock, index) => (
              <TableRow className="" key={index}>
                <TableCell className="font-medium text-left">
                  {stock.name}
                </TableCell>
                <TableCell className="text-center">
                  ${Number(stock.price).toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  {typeof stock.targetPrice === "number"
                    ? `${Number(stock.targetPrice).toFixed(2)}`
                    : "--"}
                </TableCell>
                <TableCell className="flex flex-row text-right w-50%">
                  <Button
                    variant="destructive"
                    onClick={() => removeFromList(stock)}
                  >
                    Remove
                  </Button>
                  &nbsp;
                  <Button>Adjust Price</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/*<ul className="block items-center justify-evenly">
        {stocks.map((stock, index) => (
          <li className="flex justify-between text-4xl" key={index}>
            <span className="text-left">{stock.name}:</span>
            <span className="text-right">
              ${Number(stock.price).toFixed(2)}
            </span>
          </li>
        ))}
      </ul> */}
    </div>
  );
}
export default StockList;

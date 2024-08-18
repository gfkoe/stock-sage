import Link from "next/link";
import { ModeToggle } from "@/components/ModeToggle";
import SendNotification from "@/components/SendNotification";
import React from "react";
type Text = {
  text: string;
};
export default function Header({ text }: Text) {
  return (
    <header className="header-component flex items-center justify-center">
      &nbsp;
      <h1 className="text-4xl">{text}</h1>
      &nbsp;
      <ModeToggle />
      &nbsp;
      <SendNotification />
    </header>
  );
}

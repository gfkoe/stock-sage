"use client";

import React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/Icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignIn } from "@/actions/GithubOath";
import { providerMap } from "../../auth";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {

}
const GitHubProvider = providerMap.find((provider) => provider.id === "github");

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {

  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    try {
      if (GitHubProvider) {
        await SignIn({ provider: GitHubProvider });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
    //setTimeout(() => {
    //  setIsLoading(false);
    //}, 3000);
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {/* <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In with Email
          </Button>
        </div>
      </form> */}
      { /* <div className="flex items-center">
        <div className="flex-1 border-t"></div>
        <div className="px-4 text-muted-foreground text-xs uppercase">
          Or continue with
        </div>
        <div className="flex-1 border-t"></div>
      </div > */}
      <form onSubmit={onSubmit}>
        <Button variant="outline" type="submit" disabled={isLoading}>
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.gitHub className="mr-2 h-4 w-4" />
          )}{" "}
          <span>Sign in with GitHub</span>
        </Button>
      </form>
    </div >
  );
}

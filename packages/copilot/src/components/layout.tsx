// @ts-ignore
import { cn } from "common-utils";
import { SiteHeader } from "./SiteHeader";
import Head from "next/head";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "min-h-screen bg-white font-sans text-slate-900 antialiased flex flex-col",
      )}
    >
      <Head>
        <title>nmcopilot</title>
        <meta name="description" content="Gen.AI enabled flowcharting tool" />
        <link rel="icon" href="/favicon.ico" />
        <meta charSet="utf-8" />
      </Head>
      <SiteHeader />
      {children}
    </div>
  );
}

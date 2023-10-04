// Import necessary types and libraries
import type { AppProps } from "next/app";
import "../styles/globals.css";
import "reactflow/dist/style.css";
import { RootLayout } from "@/components/layout";
import dotenv from "dotenv";
import debug from "debug";

dotenv.config();
const log = debug("app:log");

if (process.env.NODE_ENV !== "production") {
  debug.enable("*");
  log("Logging is enabled!");
} else {
  debug.disable();
}

/**
 * The NMCopilot component serves as a wrapper around every page in the Next.js application.
 * It is a good place for global configurations, like global state providers and styles.
 *
 * @returns {JSX.Element} Returns the current Next.js page with its props spread onto it.
 */
function NMCopilot({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <RootLayout>
      <Component {...pageProps} />
    </RootLayout>
  );
}

export default NMCopilot;

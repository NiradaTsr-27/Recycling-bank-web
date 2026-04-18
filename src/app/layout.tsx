import Script from "next/script";
import type { ReactNode } from "react";


import "../styles/globals.css";
import "../styles/layout.css";
import "../styles/navbar.css";
import "../styles/components/footer.module.css";
import "../styles/card.css";
import "../styles/table.css";
import "../styles/form.css";
import "../styles/button.css";
import "../styles/badge.css";

import { Prompt } from "next/font/google";

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
});

import Providers from "./providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <head>
        {/* Thailand CSS */}
        <link
          rel="stylesheet"
          href="https://earthchie.github.io/jquery.Thailand.js/jquery.Thailand.js/dist/jquery.Thailand.min.css"
        />
      </head>

      <body className={prompt.className}>
        <Providers>{children}</Providers>

        {/* 1. jQuery */}
        <Script
          src="https://code.jquery.com/jquery-3.2.1.min.js"
          strategy="beforeInteractive"
        />

        {/* 2. Dependencies */}
        <Script
          src="https://earthchie.github.io/jquery.Thailand.js/jquery.Thailand.js/dependencies/JQL.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://earthchie.github.io/jquery.Thailand.js/jquery.Thailand.js/dependencies/typeahead.bundle.js"
          strategy="afterInteractive"
        />

        {/* 3. Thailand Plugin */}
        <Script
          src="https://earthchie.github.io/jquery.Thailand.js/jquery.Thailand.js/dist/jquery.Thailand.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

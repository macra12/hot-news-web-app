import localFont from "next/font/local";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import logo from "@/assets/images/logo.png";

// English UI font (Latin) — Inter variable
const inter = localFont({
  src: "./fonts/Inter.ttf",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

// Khmer font — Hanuman variable. Used as fallback for Khmer glyphs everywhere,
// and as the primary font when the document language is Khmer (lang="km").
const hanuman = localFont({
  src: "./fonts/Hanuman.ttf",
  variable: "--font-hanuman",
  weight: "100 900",
  display: "swap",
});

export const metadata = {
  title: "GenZFlash News — Cambodia's New Generation News Platform",
  description:
    "Stay informed with the latest breaking news, sports, entertainment, technology, politics, and education news from Cambodia and around the world.",
  keywords:
    "Cambodia news, Khmer news, sports, entertainment, technology, politics, education, GenZ",
  icons: {
    icon:     logo.src,
    shortcut: logo.src,
    apple:    logo.src,
  },
};

/* Inline script prevents flash of wrong theme before JS hydrates */
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('gzf-theme');
    var sys = window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
    if ((t || sys) === 'dark') document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${hanuman.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white transition-colors duration-200">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

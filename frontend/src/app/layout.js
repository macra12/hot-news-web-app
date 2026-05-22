import "./globals.css";
import ClientLayout from "./components/ClientLayout";

export const metadata = {
  title: "GenZFlash News — Cambodia's New Generation News Platform",
  description:
    "Stay informed with the latest breaking news, sports, entertainment, technology, politics, and education news from Cambodia and around the world.",
  keywords:
    "Cambodia news, Khmer news, sports, entertainment, technology, politics, education, GenZ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-950 text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

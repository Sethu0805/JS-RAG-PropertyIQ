import "./globals.css";
import Link from "next/link";

export const metadata = { title: "PropertyIQ", description: "Evidence-led property intelligence" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="nav">
          <Link href="/" className="logo"><span className="mark">P</span>PropertyIQ</Link>
          <Link href="/" className="navlink">Properties.</Link>
        </header>
        {children}
      </body>
    </html>
  );
}

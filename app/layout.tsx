import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ToastContainer } from "react-toastify";
import Providers from "./providers";
import { UserProvider } from "./context/UserContext";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">
        <UserProvider>        
          <Providers>
            {children}
          </Providers>
      </UserProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />  
      </body>
    </html>
  );
}

import type { AppProps } from 'next/app';
import "../styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/use-toast";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      <AuthProvider>
        <ToastProvider>
          <main className="antialiased min-h-screen bg-[#F3F3E0]">
            <Component {...pageProps} />
            <Toaster />
          </main>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 
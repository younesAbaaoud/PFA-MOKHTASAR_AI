import type { AppProps } from 'next/app';
import { GeistProvider, CssBaseline } from '@geist-ui/core';
import "../styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <GeistProvider>
        <CssBaseline />
        <main className="antialiased">
          <Component {...pageProps} />
        </main>
      </GeistProvider>
    </AuthProvider>
  );
} 
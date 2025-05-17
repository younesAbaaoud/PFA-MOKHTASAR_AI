import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Image
          src="/images/logo.png"
          alt="MOKHTASAR AI Logo"
          width={200}
          height={200}
          className="mx-auto mb-8"
        />
        <h1 className="text-4xl font-bold mb-4">Welcome to MOKHTASAR AI</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Your intelligent course summarization platform
        </p>
        <div className="space-x-4">
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
} 
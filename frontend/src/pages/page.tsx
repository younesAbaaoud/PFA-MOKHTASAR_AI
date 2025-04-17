import Image from "next/image";
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>Welcome to PFA</h1>
        <img src="full_logo.png"/>
        <Button 
  className="bg-primary text-primary-foreground hover:bg-primary/90"
  variant="default" // Explicitly set variant
>
  Primary Button
</Button>
        <div className="p-4 bg-secondary rounded-md text-white">
          Medium Blue Card (#608BC1)
        </div>
        
        <div className="p-4 bg-primary-pale rounded-md border border-primary">
          Light Blue Card (#CBDCEB)
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        
      </footer>
    </div>
  );
}

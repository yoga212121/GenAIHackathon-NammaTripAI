import { Map } from "lucide-react";

export function Header() {
  return (
    <header className="w-full border-b bg-card">
      <div className="container mx-auto flex items-center h-16 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Map className="h-7 w-7 text-primary" />
          <span className="font-headline text-xl font-semibold tracking-wide">
            WanderWise AI
          </span>
        </div>
      </div>
    </header>
  );
}

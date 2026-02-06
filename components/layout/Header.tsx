import { Navigation } from "@/components/layout/Navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#020b19]/80 px-4 py-4 backdrop-blur md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Tampa • Rocky Point</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            MAA Apartment Tracker
          </h1>
        </div>
        <Navigation />
      </div>
    </header>
  );
}

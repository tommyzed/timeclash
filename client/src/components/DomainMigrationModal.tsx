import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Rocket,
  Sparkles,
  Bookmark,
  ArrowRight,
  ExternalLink,
  Zap,
} from "lucide-react";

const NEW_DOMAIN = "timeclash.egodevnull.com";
const NEW_ORIGIN = `https://${NEW_DOMAIN}`;

export default function DomainMigrationModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hostname = window.location.hostname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const isTestMode =
      searchParams.get("redirect") === "1" ||
      searchParams.get("redirect") === "true" ||
      searchParams.get("test_migration") === "true" ||
      searchParams.get("test_migration") === "1";

    const isOldDomain =
      hostname === "timeclash.up.railway.app" ||
      (hostname.endsWith(".railway.app") && hostname !== NEW_DOMAIN);

    if (isOldDomain || isTestMode) {
      setIsOpen(true);
      // Trigger celebratory confetti if library is loaded
      if (typeof (window as any).confetti === "function") {
        try {
          (window as any).confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.5 },
            colors: ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#f59e0b"],
          });
        } catch (_) {}
      }
    }
  }, []);

  const handleRedirect = () => {
    if (typeof window === "undefined") return;
    const targetUrl = `${NEW_ORIGIN}${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.href = targetUrl;
  };

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md p-0 overflow-hidden bg-white dark:bg-zinc-950 border-2 border-indigo-200 dark:border-indigo-900/60 shadow-2xl rounded-3xl">
        {/* Top vibrant header banner */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 pt-8 pb-7 text-white text-center overflow-hidden">
          {/* Subtle background glow circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/15 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-yellow-300/20 rounded-full blur-lg pointer-events-none" />

          {/* Floating animated icon badge */}
          <div className="relative mx-auto mb-3 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg shadow-black/10 transition-transform duration-300 hover:scale-105">
            <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-yellow-950 rounded-full p-1 shadow-sm animate-bounce">
              <Sparkles className="w-3.5 h-3.5 fill-yellow-400" />
            </div>
            <Rocket className="w-8 h-8 text-white animate-pulse" />
          </div>

          <AlertDialogTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm flex items-center justify-center gap-2">
            <span>TimeClash Has Moved!</span>
          </AlertDialogTitle>

          <p className="mt-1 text-xs sm:text-sm font-medium text-white/90">
            We upgraded to a faster, permanent home 🏰
          </p>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4">
          <AlertDialogDescription className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed text-center">
            The old Railway address is retiring. Head over to our brand new domain to keep clashing through history!
          </AlertDialogDescription>

          {/* New URL Showcase Card */}
          <div className="relative group overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/40 border-2 border-indigo-100 dark:border-indigo-900/60 transition-all hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-100/80 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                Fresh New Address
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Now
              </span>
            </div>

            <a
              href={NEW_ORIGIN}
              className="mt-1 flex items-center justify-between text-indigo-950 dark:text-indigo-200 font-mono font-bold text-sm sm:text-base hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors break-all"
            >
              <span>https://timeclash.egodevnull.com/</span>
              <ExternalLink className="w-4 h-4 ml-1 shrink-0 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
            </a>
          </div>

          {/* Bookmark Reminder Pill */}
          <div className="flex items-center gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/80 dark:border-amber-900/50 text-amber-900 dark:text-amber-300 text-xs">
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center shrink-0">
              <Bookmark className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="font-medium leading-tight">
              <strong>Quick Tip:</strong> Update your browser bookmarks to make sure you land on the right timeline next time!
            </span>
          </div>

          {/* Action CTA button */}
          <AlertDialogFooter className="pt-2 sm:justify-center">
            <AlertDialogAction
              onClick={handleRedirect}
              className="w-full relative group overflow-hidden h-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-base rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-0"
            >
              {/* Shimmer light pass */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Rocket className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              <span>Go to the Fresh Site!</span>
              <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

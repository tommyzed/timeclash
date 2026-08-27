import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Globe, ArrowRight, Bookmark } from "lucide-react";

const NEW_DOMAIN = "timeclash.egodevnull.com";
const NEW_ORIGIN = `https://${NEW_DOMAIN}`;

export default function DomainMigrationModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hostname = window.location.hostname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const isTestMode =
      searchParams.get("test_migration") === "true" ||
      searchParams.get("test_migration") === "1";

    const isOldDomain =
      hostname === "timeclash.up.railway.app" ||
      (hostname.endsWith(".railway.app") && hostname !== NEW_DOMAIN);

    if (isOldDomain || isTestMode) {
      setIsOpen(true);
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
      <AlertDialogContent className="max-w-md p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-2xl">
        <AlertDialogHeader className="flex flex-col items-center text-center sm:text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 shadow-sm">
            <Globe className="w-7 h-7" />
          </div>
          <AlertDialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            We've Moved!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed flex flex-col items-center">
            <span>
              TimeClash has officially moved to our new domain. Please update your bookmarks and use our new address going forward.
            </span>
            <div className="w-full p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 rounded-xl text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                New Address
              </span>
              <a
                href={NEW_ORIGIN}
                className="font-mono font-semibold text-sm text-blue-700 dark:text-blue-300 hover:underline break-all"
              >
                https://timeclash.egodevnull.com/
              </a>
            </div>
            <div className="w-full flex items-center justify-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 py-2 px-3 rounded-lg border border-amber-200/60 dark:border-amber-900/50">
              <Bookmark className="w-3.5 h-3.5 shrink-0" />
              <span>Don't forget to update your bookmarks!</span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 sm:justify-center">
          <AlertDialogAction
            onClick={handleRedirect}
            className="w-full sm:w-auto min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>OK</span>
            <ArrowRight className="w-4 h-4" />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

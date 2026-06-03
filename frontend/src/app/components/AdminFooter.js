import { memo } from "react";
import Link from "next/link";

const ADMIN_VERSION = "v1.0.0";

function AdminFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="shrink-0 border-t border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-3">
      <div className="flex flex-col items-center justify-between gap-1.5 text-xs text-slate-400 dark:text-gray-500 sm:flex-row">
        <p>
          Copyright &copy; {year}{" "}
          <span className="font-semibold text-red-500">GenZFlash News</span>
          {" "}&middot; All rights reserved.
        </p>
        <ul className="flex items-center gap-4">
          <li>
            <Link
              href="/terms"
              className="transition-colors hover:text-red-400 focus-visible:text-red-400 focus-visible:outline-none"
            >
              Terms
            </Link>
          </li>
          <li>
            <Link
              href="/privacy"
              className="transition-colors hover:text-red-400 focus-visible:text-red-400 focus-visible:outline-none"
            >
              Privacy
            </Link>
          </li>
          <li>
            <Link
              href="/help"
              className="transition-colors hover:text-red-400 focus-visible:text-red-400 focus-visible:outline-none"
            >
              Help
            </Link>
          </li>
          <li className="flex items-center gap-1.5 text-slate-400 dark:text-gray-600">
            <span
              className="h-1.5 w-1.5 rounded-full bg-green-500"
              aria-hidden="true"
            />
            Admin {ADMIN_VERSION}
          </li>
        </ul>
      </div>
    </footer>
  );
}

export default memo(AdminFooter);

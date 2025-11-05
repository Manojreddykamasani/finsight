"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, Newspaper,User2 } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: <BarChart3 size={18} /> },
  { href: "/admin", label: "admin", icon: <Users size={18} /> },
  { href: "/news", label: "News", icon: <Newspaper size={18} /> },
  { href: "/portfolio", label: "Portfolio", icon: <User2 size={18} /> },
  {href: "/leaderboard", label: "Leaderboard", icon: <Users size={18} /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-60 flex flex-col border-r border-gray-200 dark:border-gray-800 
      bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 transition-colors">
      
      {/* Navigation */}
      <nav className="flex flex-col gap-1 mt-6">
        {links.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium rounded-lg transition-all
                ${active 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" 
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}

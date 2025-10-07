"use client";

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

// Define the routes where you want to hide the sidebar
const HIDE_SIDEBAR_ROUTES = ['/login', '/signup', '/forgot-password' ,'/landing'];

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // Check if the current route is in our list of routes to hide the sidebar on
  const shouldHideSidebar = HIDE_SIDEBAR_ROUTES.includes(pathname);

  if (shouldHideSidebar) {
    // If the sidebar should be hidden, render the main content to take up the full width
    return (
      <main className="flex-1 p-6 w-full">{children}</main>
    );
  }

  // Otherwise, render the standard layout with the sidebar
  return (
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

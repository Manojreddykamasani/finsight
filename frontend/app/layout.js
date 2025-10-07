import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// Import the new LayoutWrapper component
import LayoutWrapper from "@/components/LayoutWrapper";
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: "Finsight — LLM-Driven Market Simulation",
  description: "Finsight is a modern trading research UI with authentication and dark/light mode.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-100">
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <Toaster
              position="bottom-center"
              toastOptions={{
                className: '',
                style: {
                  background: '#333',
                  color: '#fff',
                },
              }}
            />
              <div className="flex min-h-screen flex-col">
                <Navbar />
                {/* Use the LayoutWrapper to conditionally render the sidebar and main content */}
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
                <Footer />
              </div>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

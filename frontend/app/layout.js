import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
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
                <div className="flex flex-1">
                  <Sidebar />   
                  <main className="flex-1 p-6">{children}</main>
                </div>
                <Footer />
              </div>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

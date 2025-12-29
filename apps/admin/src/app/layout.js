import './globals.css';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'),
  title: 'GPS Admin Portal',
  description: 'Ghana Police Service Recruitment - Admin Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AdminAuthProvider>
          <SocketProvider>
            {children}
            <Toaster position="top-right" />
          </SocketProvider>
        </AdminAuthProvider>
      </body>
    </html>
  );
}

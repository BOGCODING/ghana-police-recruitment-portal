import './globals.css';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
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

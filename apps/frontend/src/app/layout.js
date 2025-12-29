import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Ghana Police Service Recruitment Portal',
  description: 'Official recruitment portal for the Ghana Police Service',
};

import MaintenanceCheck from '@/components/MaintenanceCheck';
import AnnouncementBanner from '@/components/AnnouncementBanner';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#006B3F" />
      </head>
      <body>
        <AuthProvider>
          <SocketProvider>
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            <MaintenanceCheck>
              <AnnouncementBanner />
              {children}
            </MaintenanceCheck>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

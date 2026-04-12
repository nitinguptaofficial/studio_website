import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Verma Studio',
  description: 'Manage Verma Studio content and contacts.',
};

import AdminGuard from '../components/AdminGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--color-gray-100)',
      }}>
        {/* Sidebar will go here, currently using dynamic import or directly in Next.js 13+ it's better to render it in layout if it's static */}
        {/* Since the Sidebar uses 'use client' for active links, we should create a separate client component */}
        <Sidebar />
        <main style={{
          flex: 1,
          padding: '32px',
          overflowY: 'auto',
        }}>
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}

// Importing sidebar component
import Sidebar from './components/Sidebar';

'use client';

import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        {children}
      </main>
      <ToastContainer />
    </>
  );
}

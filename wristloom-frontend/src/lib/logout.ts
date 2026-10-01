'use client';

import { signOut } from 'next-auth/react';

export async function handleCompleteSignOut(callbackUrl: string = '/') {
  try {
    // 1. Clear local user-specific caches
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('wristloom-cart');
        localStorage.removeItem('wristloom-wishlist');
        localStorage.removeItem('user');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authUser');
        localStorage.removeItem('userData');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        localStorage.removeItem('auth');
        localStorage.removeItem('session');
        sessionStorage.clear();
      } catch (storageErr) {
        console.warn('[logout] Storage clear note:', storageErr);
      }
    }

    // 2. Call NextAuth sign out to clear session cookies
    await signOut({ callbackUrl, redirect: true });
  } catch (err) {
    console.error('[logout] SignOut error:', err);
    if (typeof window !== 'undefined') {
      window.location.href = callbackUrl;
    }
  }
}

import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Wristloom account to manage your collection, track services, and access your Watch Vault.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#14110F] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link href="/" className="mb-10">
        <span className="font-display text-2xl text-[#EDE6D6] tracking-tight">Wristloom</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-[#EDE6D6] mb-2">Welcome back</h1>
          <p className="text-sm text-[rgba(237,230,214,0.50)]">Sign in to your Wristloom account</p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-[rgba(237,230,214,0.40)] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#B08D57] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

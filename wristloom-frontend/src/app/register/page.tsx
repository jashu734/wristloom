import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join Wristloom — the definitive platform for luxury watch ownership, care, and authentication.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#14110F] flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-10">
        <span className="font-display text-2xl text-[#EDE6D6] tracking-tight">Wristloom</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-[#EDE6D6] mb-2">Create your account</h1>
          <p className="text-sm text-[rgba(237,230,214,0.50)]">Start your watch ownership journey</p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-[rgba(237,230,214,0.40)] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#B08D57] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

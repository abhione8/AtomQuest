import Link from 'next/link';
import { Button } from '@/components/ui';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-red-600 mb-4">403 - Forbidden</h1>
        <p className="text-gray-700 mb-6">
          You don't have permission to access this page. This action is restricted to your assigned role.
        </p>
        <div className="space-y-3">
          <Link href="/dashboard" className="block">
            <Button variant="primary" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/login" className="block">
            <Button variant="secondary" className="w-full">
              Sign In with Different Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

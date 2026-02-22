import { AuthPanel } from '@/components/auth/AuthPanel';

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const initialTab = params.tab === 'register' ? 'register' : 'login';

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] flex items-center justify-center py-10">
      <AuthPanel initialTab={initialTab} />
    </div>
  );
}

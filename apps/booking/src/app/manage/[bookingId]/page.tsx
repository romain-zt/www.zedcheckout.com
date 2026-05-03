import { ManageBookingClient } from './client';

interface PageProps {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function ManageBookingPage({ params, searchParams }: PageProps) {
  const { bookingId } = await params;
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-beige p-4">
        <div className="w-full max-w-md rounded-xl border border-navy/10 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-navy">Invalid Link</h1>
          <p className="mt-2 text-sm text-navy/60">
            This link is missing a required token. Please use the link from your confirmation or reminder email.
          </p>
        </div>
      </main>
    );
  }

  return <ManageBookingClient bookingId={bookingId} token={token} />;
}

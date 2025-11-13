import { redirect } from 'next/navigation';

// Fallback redirect for root path to the default locale.
// This complements next-intl middleware and prevents 404s when the middleware
// is not applied (e.g., certain hosting configurations or bots skipping it).
export default function RootRedirect() {
  redirect('/cs');
}

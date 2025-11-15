import { redirect } from 'next/navigation';

// Redirect root path to default locale
// This ensures users are always directed to a locale-prefixed URL
export default function RootRedirect() {
  redirect('/cs');
}

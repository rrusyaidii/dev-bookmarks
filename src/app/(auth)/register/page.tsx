import { redirect } from 'next/navigation';

/** Registration disabled — single-user private app. */
export default function RegisterPage() {
  redirect('/login');
}

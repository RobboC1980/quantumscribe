import { useMutation } from '@tanstack/react-query';
import { post } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function Billing() {
  const nav = useNavigate();

  const checkout = useMutation({
    mutationFn: () => post('/billing/checkout', {}),
    onSuccess: ({ url }) => (window.location.href = url)
  });

  const portal = useMutation({
    mutationFn: () => post('/billing/portal', {}),
    onSuccess: ({ url }) => (window.location.href = url)
  });

  return (
    <main>
      <h1>Subscription & Billing</h1>
      <button onClick={() => checkout.mutate()} disabled={checkout.isPending}>
        {checkout.isPending ? 'Redirecting...' : 'Subscribe'}
      </button>
      <button onClick={() => portal.mutate()} style={{ marginLeft: 16 }}>
        Manage Subscription
      </button>
      <p style={{ marginTop: 24 }}>
        You'll be taken to Stripe Checkout / Customer Portal to complete your purchase or manage
        your plan.
      </p>
    </main>
  );
} 
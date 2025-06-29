"use client";

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../../lib/stripe';

interface StripeProviderProps {
  children: React.ReactNode;
}

export default function StripeProvider({ children }: StripeProviderProps) {
  const stripePromise = getStripe();

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CheckoutFormProps {
  amount: number;
  title: string;
  onSuccess?: () => void;
}

export function CheckoutForm({ amount, title, onSuccess }: CheckoutFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      console.log('🚀 Starting Stripe checkout...');
      
      const response = await apiRequest('POST', '/create-checkout-session', {
        amount,
        description: title,
        fundraiser: new URLSearchParams(window.location.search).get('fundraiser') || ''
      });
      
      const data = await response.json();
      console.log('📋 Data received from backend:', data);
      
      if (data.url) {
        console.log('✅ Redirecting to Stripe Checkout:', data.url);
        // Redirect to Stripe secure checkout
        window.location.href = data.url;
      } else {
        console.log('❌ URL not found in response:', data);
        throw new Error('Could not create checkout - URL not received');
      }
      
    } catch (error: any) {
      console.log('❌ Checkout error:', error);
      toast({
        title: "Checkout error",
        description: "Please try again in a few moments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🐾</span>
        </div>
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <div className="text-3xl font-bold">
          ${(amount / 100).toFixed(2)}
        </div>
        <p className="text-blue-100 text-sm mt-1">
          Your donation makes a difference! 💙
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Donation summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs mr-2">✓</span>
            Donation Summary
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex justify-between">
              <span>Cause:</span>
              <span className="font-medium">{title}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-bold text-green-600">${(amount / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Security information */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center">
            <span className="text-green-600 mr-2">🔐</span>
            100% Secure Payment
          </h3>
          <div className="space-y-2 text-sm text-green-800">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>Processed by Stripe (global standard)</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>Credit and debit cards accepted</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>Bank-level encryption</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>Instant email confirmation</span>
            </div>
          </div>
        </div>

        {/* Main button */}
        <Button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full py-4 text-lg font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
              Redirecting to secure checkout...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2">💝</span>
              Donate ${(amount / 100).toFixed(2)}
              <span className="ml-2">→</span>
            </div>
          )}
        </Button>

        {/* Additional information */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <span className="mr-1">🔒</span>
            Redirecting to the official Stripe page
          </p>
          <p className="text-xs text-gray-400">
            Your data is never stored on our servers
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex justify-center space-x-4 pt-2">
          <div className="flex items-center text-xs text-gray-500">
            <span className="w-4 h-4 bg-blue-500 rounded text-white flex items-center justify-center mr-1 text-[10px]">S</span>
            Stripe
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <span className="text-green-500 mr-1">🔐</span>
            SSL
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <span className="text-blue-500 mr-1">✓</span>
            PCI Compliant
          </div>
        </div>
      </div>
    </div>
  );
}
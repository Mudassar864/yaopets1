import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle, Heart, Home } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [, navigate] = useLocation();
  const [paymentDetails, setPaymentDetails] = useState({
    amount: '',
    title: 'YaoPets Donation'
  });
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Extract payment details from URL
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get('amount');
    const title = urlParams.get('title');

    if (amount) {
      setPaymentDetails({
        amount: `R$ ${(parseInt(amount) / 100).toFixed(2)}`,
        title: title || 'YaoPets Donation'
      });
    }

    // Countdown and auto-redirect after 10 seconds
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          navigate('/');
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <div className="flex justify-center space-x-2 mb-4">
            <Heart className="w-6 h-6 text-red-500 animate-pulse" />
            <Heart className="w-6 h-6 text-red-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <Heart className="w-6 h-6 text-red-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        {/* Main message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Your donation was processed successfully and is already helping our four-legged friends! 🐾
          </p>

          {/* Donation details */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Donation Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Cause:</span>
                <span className="font-medium">{paymentDetails.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount donated:</span>
                <span className="text-2xl font-bold text-green-600">
                  {paymentDetails.amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">✓ Confirmed</span>
              </div>
            </div>
          </div>

          {/* Thank you message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 font-medium">
              Thank you for making a difference! 💙
            </p>
            <p className="text-blue-700 text-sm mt-1">
              Your generosity saves lives and helps find loving homes for our pets.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <button
            onClick={() => navigate('/vet-help')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
          >
            See Other Causes
          </button>
        </div>

        {/* Redirect countdown */}
        <div className="mt-8 text-sm text-gray-500">
          <p>You will be redirected automatically in {countdown} second{countdown !== 1 ? 's' : ''}...</p>
        </div>

        {/* Social sharing (optional) */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">
            Share your good deed and inspire others!
          </p>
          <div className="flex justify-center space-x-4">
            <button className="text-blue-600 hover:text-blue-800 text-sm">
              Share on WhatsApp
            </button>
            <button className="text-blue-600 hover:text-blue-800 text-sm">
              Share on Instagram
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
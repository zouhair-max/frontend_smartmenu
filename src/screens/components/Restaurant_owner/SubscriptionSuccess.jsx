import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { subscriptionService } from '../../../services/subscriptionService';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Verify the session and fetch subscription details
    const verifySubscription = async () => {
      try {
        setLoading(true);
        
        // Fetch updated subscription data
        const result = await subscriptionService.getSubscription();
        
        if (result.success) {
          // Success - subscription should now be active
          setError(null);
        } else {
          setError('Unable to verify subscription. Please contact support if the issue persists.');
        }
      } catch (err) {
        console.error('Error verifying subscription:', err);
        setError('An error occurred while verifying your subscription.');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      verifySubscription();
    } else {
      setError('Invalid session. Please contact support.');
      setLoading(false);
    }

    // Auto-redirect after 5 seconds
    const redirectTimer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);

    return () => clearTimeout(redirectTimer);
  }, [sessionId, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {loading ? (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Subscription...
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your subscription.
            </p>
          </>
        ) : error ? (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/subscription')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Back to Plans
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Subscription Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for subscribing! Your subscription is now active and you can start using
              all the features of your plan.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Go to Dashboard
              </button>
              <p className="text-sm text-gray-500">
                Redirecting automatically in a few seconds...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSuccess;



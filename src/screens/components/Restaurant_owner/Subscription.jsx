import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle2, AlertCircle, Loader2, Crown, Zap, Building2 } from 'lucide-react';
import { subscriptionService } from '../../../services/subscriptionService';
import { useAuth } from '../../../contexts/AuthContext';

const Subscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock plans - In production, these should be fetched from an API endpoint
  // For now, you'll need to create these plans in your database
  const plans = [
    {
      id: 1,
      name: 'Basic',
      price: 200,
      description: 'Perfect for small restaurants',
      features: [
        'Up to 10 tables',
        'Basic menu management',
        'Order tracking',
        'Email support',
      ],
      popular: false,
    },
    {
      id: 2,
      name: 'Professional',
      price: 350,
      description: 'For growing restaurants',
      features: [
        'Unlimited tables',
        'Advanced menu management',
        'Real-time analytics',
        'Staff management',
        'Priority support',
      ],
      popular: true,
    },
    {
      id: 3,
      name: 'Enterprise',
      price: 600,
      description: 'For large restaurant chains',
      features: [
        'Multiple locations',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated support',
        'Custom features',
      ],
      popular: false,
    },
  ];

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoadingSubscription(true);
      const result = await subscriptionService.getSubscription();
      if (result.success) {
        setSubscriptionData(result.data);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      setLoading(true);
      setError(null);

      // Create checkout session
      const result = await subscriptionService.createCheckoutSession(planId);

      if (result.success && result.checkout_url) {
        // Redirect to Stripe Checkout
        subscriptionService.redirectToCheckout(result.checkout_url);
      } else {
        setError(result.message || 'Failed to create checkout session. Please try again.');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planName) => {
    switch (planName.toLowerCase()) {
      case 'basic':
        return <Zap className="w-6 h-6" />;
      case 'professional':
        return <Crown className="w-6 h-6" />;
      case 'enterprise':
        return <Building2 className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  if (loadingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Plans</h1>
        <p className="text-gray-600">
          Choose the perfect plan for your restaurant. All plans include a 14-day free trial.
        </p>
      </div>

      {/* Payment Alert - Unpaid Subscription Warning */}
      {subscriptionData?.alert?.show && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-6 shadow-lg animate-pulse">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-900 mb-2">
                Payment Required - Subscription Unpaid
              </h3>
              <p className="text-red-800 mb-3">
                Your subscription payment is overdue. Please renew your subscription to continue using our services.
              </p>
              {subscriptionData.alert.days_remaining !== null && subscriptionData.alert.days_remaining > 0 && (
                <div className="bg-white/50 rounded-lg p-3 mb-3">
                  <p className="text-sm font-semibold text-red-900">
                    <span className="text-lg font-bold">{subscriptionData.alert.days_remaining}</span> day{subscriptionData.alert.days_remaining !== 1 ? 's' : ''} remaining
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Your restaurant will be deactivated if payment is not received within {subscriptionData.alert.days_remaining} day{subscriptionData.alert.days_remaining !== 1 ? 's' : ''}.
                  </p>
                </div>
              )}
              {subscriptionData.alert.days_remaining === 0 && (
                <div className="bg-white/50 rounded-lg p-3 mb-3">
                  <p className="text-sm font-semibold text-red-900">
                    ⚠️ Final Day - Payment Required Immediately
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Your restaurant will be deactivated today if payment is not received.
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {subscriptionData.plan && (
                  <button
                    onClick={() => handleSubscribe(subscriptionData.plan.id)}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </span>
                    ) : (
                      `Renew ${subscriptionData.plan.name} Plan`
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Subscription Status */}
      {subscriptionData?.has_subscription && subscriptionData?.subscription?.is_active && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-1">
                Active Subscription
              </h3>
              {subscriptionData.plan && (
                <div className="space-y-1">
                  <p className="text-green-800">
                    <span className="font-medium">Plan:</span> {subscriptionData.plan.name}
                  </p>
                  <p className="text-green-800">
                    <span className="font-medium">Price:</span> {subscriptionData.plan.price} MAD/month
                  </p>
                  {subscriptionData.subscription?.expires_at && (
                    <p className="text-green-800">
                      <span className="font-medium">Expires:</span>{' '}
                      {new Date(subscriptionData.subscription.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan =
            subscriptionData?.plan?.id === plan.id &&
            subscriptionData?.subscription?.is_active;
          const isSubscribed = subscriptionData?.has_subscription;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg ${
                plan.popular
                  ? 'border-yellow-400 ring-2 ring-yellow-200'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isCurrentPlan ? 'ring-2 ring-green-300 border-green-400' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="p-6">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white mb-4">
                    {getPlanIcon(plan.name)}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">{plan.price} MAD</span>
                    <span className="text-gray-600 ml-2">/month</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Subscribe Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading || isCurrentPlan}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                      : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg'
                  } ${loading ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </span>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    'Subscribe Now'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <CreditCard className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Secure Payment Processing
            </h3>
            <p className="text-sm text-gray-600">
              All payments are securely processed by Stripe. We never store your payment
              information. You can cancel your subscription at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;



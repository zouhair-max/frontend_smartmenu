import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

const SubscriptionCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Subscription Cancelled
        </h2>
        <p className="text-gray-600 mb-6">
          Your subscription checkout was cancelled. No charges have been made. If you'd like to
          subscribe, you can return to our plans anytime.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/subscription')}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Plans</span>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancel;



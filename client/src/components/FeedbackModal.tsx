import { Check, X } from "lucide-react";

interface FeedbackModalProps {
  isVisible: boolean;
  isCorrect: boolean;
  message: string;
  onClose: () => void;
}

export default function FeedbackModal({ isVisible, isCorrect, message, onClose }: FeedbackModalProps) {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      data-testid="feedback-modal"
    >
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isCorrect ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isCorrect ? (
              <Check className="h-8 w-8 text-green-600" />
            ) : (
              <X className="h-8 w-8 text-red-600" />
            )}
          </div>
          <h3 className="text-xl font-semibold mb-2" data-testid="feedback-title">
            {isCorrect ? 'Correct!' : 'Not Quite Right'}
          </h3>
          <p className="text-gray-600 mb-6" data-testid="feedback-message">
            {message}
          </p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            onClick={onClose}
            data-testid="button-continue"
          >
            Continue Playing
          </button>
        </div>
      </div>
    </div>
  );
}

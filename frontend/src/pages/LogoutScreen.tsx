import { Link } from "react-router-dom";

export default function LogoutScreen() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-[#9B2335] rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">S</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              You've Been Logged Out
            </h1>
            <p className="text-gray-500">
              Thank you for visiting Stevens Senior Design Marketplace
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Link
              to="/login"
              className="block w-full py-3 px-4 bg-[#9B2335] text-white font-medium rounded-lg text-center
                hover:bg-[#7a1c2a] hover:shadow-lg
                focus:ring-2 focus:ring-[#9B2335] focus:ring-offset-2 focus:outline-none
                transition-all duration-200 ease-in-out"
            >
              Sign In Again
            </Link>

            <Link
              to="/signup"
              className="block w-full py-3 px-4 bg-white text-[#9B2335] font-medium rounded-lg text-center
                border border-gray-200
                hover:bg-gray-50 hover:shadow-lg
                focus:ring-2 focus:ring-[#9B2335] focus:ring-offset-2 focus:outline-none
                transition-all duration-200 ease-in-out"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

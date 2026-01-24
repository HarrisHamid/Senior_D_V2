import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/logout');
  };

  return (
    <nav className="bg-[#9B2335] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-3
              hover:opacity-90
              transition-all duration-200 ease-in-out"
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#9B2335] text-sm font-bold">S</span>
            </div>
            <span className="text-lg font-semibold">Stevens Marketplace</span>
          </Link>

          <button
            onClick={handleLogout}
            className="py-2 px-6 bg-white text-[#9B2335] font-medium rounded-lg
              hover:bg-gray-100 hover:shadow-lg
              focus:ring-2 focus:ring-white focus:outline-none
              transition-all duration-200 ease-in-out"
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
}

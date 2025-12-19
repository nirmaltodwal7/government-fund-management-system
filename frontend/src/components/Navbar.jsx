import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  // State to manage mobile menu toggle
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Get authentication state and functions from context
  const { user, userType, faceVerified, logout } = useAuth();
  const navigate = useNavigate();

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  // Routes that should be visible when logged in
  const protectedRoutes = [
    { path: '/about', name: 'About' },
  ];

  // Get the appropriate dashboard route based on user type
  const getDashboardRoute = () => {
    if (userType === 'nominee') {
      return { path: '/nominee-dashboard', name: 'Nominee Dashboard' };
    } else {
      return { path: '/dashboard', name: 'Dashboard' };
    }
  };

  // Check if dashboard should be shown based on user type and face verification
  const shouldShowDashboard = () => {
    if (!user) return false;
    
    // Nominee users can always see their dashboard
    if (userType === 'nominee') return true;
    
    // Normal users need face verification to see dashboard
    return faceVerified;
  };

  // Routes visible to all users
  const publicRoutes = [
    { path: '/contact', name: 'Contact' }
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <NavLink to="/" className="text-xl font-bold text-gray-800 hover:text-blue-600">
              NidhiSetu
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {/* Home is always visible */}
              <NavLink
                to="/"
                className={({ isActive }) => 
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                Home
              </NavLink>

              {/* Public routes - visible to all users */}
              {publicRoutes.map((route) => (
                <NavLink
                  key={route.path}
                  to={route.path}
                  className={({ isActive }) => 
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {route.name}
                </NavLink>
              ))}

              {/* Dashboard route - show based on user type and face verification */}
              {shouldShowDashboard() && (
                <NavLink
                  to={getDashboardRoute().path}
                  className={({ isActive }) => 
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {getDashboardRoute().name}
                </NavLink>
              )}

              {/* Other protected routes - only show when logged in */}
              {user && protectedRoutes.map((route) => (
                <NavLink
                  key={route.path}
                  to={route.path}
                  className={({ isActive }) => 
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {route.name}
                </NavLink>
              ))}

              {/* Auth buttons for desktop */}
              {!user ? (
                <div className="flex space-x-2">
                  <NavLink
                    to="/auth"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Login / Sign Up
                  </NavLink>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {/* Home is always visible in mobile */}
              <NavLink
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => 
                  `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                Home
              </NavLink>

              {/* Public routes - visible to all users in mobile */}
              {publicRoutes.map((route) => (
                <NavLink
                  key={route.path}
                  to={route.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => 
                    `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {route.name}
                </NavLink>
              ))}

              {/* Dashboard route - show based on user type and face verification */}
              {shouldShowDashboard() && (
                <NavLink
                  to={getDashboardRoute().path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => 
                    `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {getDashboardRoute().name}
                </NavLink>
              )}

              {/* Other protected routes - only show when logged in */}
              {user && protectedRoutes.map((route) => (
                <NavLink
                  key={route.path}
                  to={route.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => 
                    `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {route.name}
                </NavLink>
              ))}

              {/* Auth section in mobile menu */}
              <div className="pt-4 border-t border-gray-200">
                {!user ? (
                  <div className="space-y-2">
                    <NavLink
                      to="/auth"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      Login / Sign Up
                    </NavLink>
                  </div>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
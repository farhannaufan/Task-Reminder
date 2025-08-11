import React, { useState } from "react";
import { ChevronDown, Bell, Settings, Menu, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  isActive?: boolean;
}

interface UserProfile {
  name: string;
  initials: string;
}

interface NavbarProps {
  logo?: string;
  navItems?: NavItem[];
  userProfile?: UserProfile;
  onNavigate?: (href: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  logo = "ceibe",
  navItems = [
    { label: "Categories", href: "/categories", hasDropdown: true },
    { label: "Dashboard", href: "/dashboard", isActive: true },
    { label: "My courses", href: "/my-courses" },
    { label: "Help Center", href: "/help", hasDropdown: true },
    { label: "Courses", href: "/courses", hasDropdown: true },
  ],
  userProfile = { name: "FN", initials: "FN" },
  onNavigate = (href) => console.log(`Navigate to: ${href}`),
}) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleNavClick = (item: NavItem) => {
    if (item.hasDropdown) {
      setActiveDropdown(activeDropdown === item.label ? null : item.label);
    } else {
      onNavigate(item.href);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogoClick = () => {
    router.push("/");
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActiveDropdown(null);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-auto">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-2 transition-opacity duration-200"
            >
              <Image
                src="/images/celoe.png"
                alt="Logo"
                width={150}
                height={150}
              />
            </button>
          </div>

          <div className="hidden md:flex items-start space-x-8">
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                <button
                  onClick={() => handleNavClick(item)}
                  className={`flex items-center space-x-1 px-3 py-7 text-base font-medium transition-colors duration-200 ${
                    item.isActive
                      ? "text-red-800 bg-transparent border-b-3 border-red-800"
                      : "text-gray-700 hover:text-red-800 "
                  }`}
                >
                  <span>{item.label}</span>
                  {item.hasDropdown && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        activeDropdown === item.label ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Dropdown Menu */}
                {item.hasDropdown && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Option 1
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Option 2
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Option 3
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 rounded-md">
              <span>Recent</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-800 rounded-full"></span>
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full border-1 border-gray-300 flex items-center justify-center">
                <span className="text-base font-black text-slate-500">
                  {userProfile.initials}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600 font-bold" />
            </div>

            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              <Settings className="w-5 h-5" />
            </button>

            <div className="flex items-center">
              <div className="relative">
                <input type="checkbox" className="sr-only" id="theme-toggle" />
                <label
                  htmlFor="theme-toggle"
                  className="flex items-center cursor-pointer"
                >
                  <div className="relative">
                    <div className="w-10 h-6 bg-gray-300 rounded-full shadow-inner"></div>
                    <div className="absolute inset-y-0 left-0 w-4 h-4 m-1 bg-white rounded-full shadow transform transition-transform duration-300"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <div key={item.label}>
                <button
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium ${
                    item.isActive
                      ? "text-red-600 bg-red-50"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.hasDropdown && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        activeDropdown === item.label ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {item.hasDropdown && activeDropdown === item.label && (
                  <div className="pl-4 space-y-1">
                    <a
                      href="#"
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      Option 1
                    </a>
                    <a
                      href="#"
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      Option 2
                    </a>
                    <a
                      href="#"
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      Option 3
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="px-2 pt-2 pb-3 border-t border-gray-200">
            <div className="space-y-1">
              <button className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                <span>Recent</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {userProfile.initials}
                    </span>
                  </div>
                  <span className="text-base font-medium text-gray-700">
                    Profile
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <Settings className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

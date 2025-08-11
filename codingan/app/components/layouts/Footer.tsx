import React from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaGooglePlusG,
  FaYoutube,
  FaInstagram,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import Image from "next/image";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer className={`bg-slate-950 text-white py-12 ${className}`}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Image
                src="/images/celoe.png"
                alt="Logo"
                width={250}
                height={250}
              ></Image>
            </div>
            <p className="text-white text-lg text-center leading-relaxed">
              Center of e-Learning and Open Education
            </p>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Address</h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>
                Gedung Panehan Pasca Sarjana Lantai 1,
                <br />
                Jl. Telekomunikasi Terusan Buah Batu,
                <br />
                Bandung - 40257, Indonesia
              </p>
              <div className="flex items-center space-x-2 mt-4">
                <FaEnvelope className="text-red-500" />
                <span>E-Mail: clove@telkomuniversity.ac.id</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaPhone className="text-red-500" />
                <span>Khusus Dosen: +62 821-1666-3563</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaPhone className="text-red-500" />
                <span>Khusus Mahasiswa: +62 812-2200-1813</span>
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Related Links</h3>
            <div className="flex space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">🦉</span>
              </div>
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">CAE</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Social Media</h3>
            <div className="flex space-x-3">
              <Link
                href="#"
                className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <FaFacebookF className="text-white text-sm" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-blue-400 rounded flex items-center justify-center hover:bg-blue-500 transition-colors"
              >
                <FaTwitter className="text-white text-sm" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-blue-700 rounded flex items-center justify-center hover:bg-blue-800 transition-colors"
              >
                <FaLinkedinIn className="text-white text-sm" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-red-600 rounded flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                <FaGooglePlusG className="text-white text-sm" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-red-600 rounded flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                <FaYoutube className="text-white text-sm" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-purple-600 rounded flex items-center justify-center hover:bg-purple-700 transition-colors"
              >
                <FaInstagram className="text-white text-sm" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-blue-950 mt-14 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6 text-base text-white underline">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms-conditions">Terms & Conditions</Link>
            </div>

            {/* Scroll to Top Button */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

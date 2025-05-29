"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, ShoppingCart, Menu, X, Laptop } from 'lucide-react';

export const EduportHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-sm py-2">
      {/* Desktop Header */}
      <div className="container mx-auto px-4 hidden md:flex justify-between items-center h-16">
        {/* Logo */}
        <Link href="https://eduport.app/" className="flex items-center">
          <div className="relative">
            <Image 
              src="https://eduport.app/wp-content/uploads/2024/09/Eduport-Logo1.svg.png"
              alt="Eduport Logo"
              width={180}
              height={75}
              priority
            />
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-6">
          <Link href="https://eduport.app/" className="text-gray-700 hover:text-[#FF6B00] font-medium">
            Home
          </Link>
          <Link href="https://eduport.app/about/" className="text-gray-700 hover:text-[#FF6B00] font-medium">
            About
          </Link>
          <Link href="https://eduport.app/our-courses/" className="text-gray-700 hover:text-[#FF6B00] font-medium">
            Our Courses
          </Link>
          <Link href="https://eduport.app/eduport-residential-campus/" className="text-gray-700 hover:text-[#FF6B00] font-medium">
            NEET JEE Campus
          </Link>
          <Link href="https://eduport.app/careers/" className="text-gray-700 hover:text-[#FF6B00] font-medium">
            Careers
          </Link>
          <Link href="https://eduport.app/contact/" className="text-gray-700 hover:text-[#FF6B00] font-medium">
            Contact Us
          </Link>
        </nav>

        {/* Contact & Buy Courses */}
        <div className="flex items-center space-x-4">
          <Link href="tel:919048899553" className="flex items-center group">
            <div className="mr-2 text-[#FF6B00] group-hover:text-[#e05a00]">
              <Phone size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">+91 90 48 89 95 53</span>
              <span className="text-xs text-gray-500">For Admission</span>
            </div>
          </Link>
          <Link href="https://shop.eduport.app" className="flex items-center group">
            <div className="mr-2 text-[#FF6B00] group-hover:text-[#e05a00]">
              <ShoppingCart size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">Buy Courses</span>
              <span className="text-xs text-gray-500">On Eduport Store</span>
            </div>
          </Link>
          <Link href="https://web.eduport.app" className="flex items-center group">
            <div className="mr-2 text-[#FF6B00] group-hover:text-[#e05a00]">
              <Laptop size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">Access Eduport App</span>
              <span className="text-xs text-gray-500">On Web</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center px-4 h-16">
        {/* Logo */}
        <Link href="https://eduport.app/" className="flex items-center">
          <div className="relative">
            <Image 
              src="https://eduport.app/wp-content/uploads/2024/09/Eduport-Logo1.svg.png"
              alt="Eduport Logo"
              width={140}
              height={58}
              priority
            />
          </div>
        </Link>

        {/* Mobile Actions */}
        <div className="flex items-center space-x-4">
          <Link href="tel:+919048899553" className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FF6B00] text-white">
            <Phone size={18} />
          </Link>
          <Link href="https://shop.eduport.app" className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FF6B00] text-white">
            <ShoppingCart size={18} />
          </Link>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <Link href="https://eduport.app/" className="flex items-center">
              <div className="relative">
                <Image 
                  src="https://eduport.app/wp-content/uploads/2024/09/Eduport-Logo1.svg.png"
                  alt="Eduport Logo"
                  width={140}
                  height={58}
                  priority
                />
              </div>
            </Link>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col p-4">
            <Link 
              href="https://eduport.app/" 
              className="py-3 px-4 text-[#FF6B00] font-medium border-l-4 border-[#FF6B00]"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="https://eduport.app/about/" 
              className="py-3 px-4 text-gray-700 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="https://eduport.app/our-courses/" 
              className="py-3 px-4 text-gray-700 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Our Courses
            </Link>
            <Link 
              href="https://eduport.app/eduport-residential-campus/" 
              className="py-3 px-4 text-gray-700 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              NEET JEE Campus
            </Link>
            <Link 
              href="https://eduport.app/careers/" 
              className="py-3 px-4 text-gray-700 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Careers
            </Link>
            <Link 
              href="https://eduport.app/contact/" 
              className="py-3 px-4 text-gray-700 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact Us
            </Link>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center py-3 px-4">
                <Link href="tel:+919048899553" className="flex items-center">
                  <div className="mr-2 text-[#FF6B00]">
                    <Phone size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">+91 90 48 89 95 53</span>
                    <span className="text-xs text-gray-500">For Admission</span>
                  </div>
                </Link>
              </div>
              <div className="flex items-center py-3 px-4">
                <Link href="https://shop.eduport.app" className="flex items-center">
                  <div className="mr-2 text-[#FF6B00]">
                    <ShoppingCart size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Buy Courses</span>
                    <span className="text-xs text-gray-500">On Eduport Store</span>
                  </div>
                </Link>
              </div>
              <div className="flex items-center py-3 px-4">
                <Link href="https://web.eduport.app" className="flex items-center">
                  <div className="mr-2 text-[#FF6B00]">
                    <Laptop size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Access Eduport App</span>
                    <span className="text-xs text-gray-500">On Web</span>
                  </div>
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

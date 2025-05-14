"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, ShoppingCart, Laptop } from 'lucide-react';

export const NewEduportHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-sm">
      {/* Desktop Header */}
      <div className="container mx-auto px-4 hidden md:flex justify-between items-center h-20">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link href="https://eduport.app/" className="flex items-center">
            <Image 
              src="https://eduport.app/wp-content/uploads/2024/09/Eduport-Logo1.svg.png"
              alt="Eduport Logo"
              width={180}
              height={75}
              priority
            />
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 mx-8">
          <nav className="flex items-center justify-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-[#FF6B00] font-medium">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-[#FF6B00] font-medium">
              About
            </Link>
            <Link href="/our-courses" className="text-gray-700 hover:text-[#FF6B00] font-medium">
              Our Courses
            </Link>
            <Link href="/eduport-residential-campus" className="text-gray-700 hover:text-[#FF6B00] font-medium">
              NEET JEE Campus
            </Link>
            <Link href="/careers" className="text-gray-700 hover:text-[#FF6B00] font-medium">
              Careers
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-[#FF6B00] font-medium">
              Contact Us
            </Link>
          </nav>
        </div>

        {/* Contact & Action Buttons */}
        <div className="flex items-center space-x-6">
          {/* Phone */}
          <Link href="tel:919048899553" className="flex items-center group">
            <div className="mr-2 text-[#FF6B00] group-hover:text-[#e05a00] transition-colors">
              <Phone size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">+91 90 48 89 95 53</span>
              <span className="text-xs text-gray-500">For Admission</span>
            </div>
          </Link>
          
          {/* Shop */}
          <Link href="https://shop.eduport.app" className="flex items-center group">
            <div className="mr-2 text-[#FF6B00] group-hover:text-[#e05a00] transition-colors">
              <ShoppingCart size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">Buy Courses</span>
              <span className="text-xs text-gray-500">On Eduport Store</span>
            </div>
          </Link>
          
          {/* Web App */}
          <Link href="https://web.eduport.app" className="flex items-center group">
            <div className="mr-2 text-[#FF6B00] group-hover:text-[#e05a00] transition-colors">
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
          <Image 
            src="https://eduport.app/wp-content/uploads/2024/09/Eduport-Logo1.svg.png"
            alt="Eduport Logo"
            width={140}
            height={58}
            priority
          />
        </Link>

        {/* Mobile Actions */}
        <div className="flex items-center space-x-3">
          <Link href="tel:+919048899553" className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
            <Phone size={18} className="text-[#FF6B00]" />
          </Link>
          <Link href="https://shop.eduport.app" className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
            <ShoppingCart size={18} className="text-[#FF6B00]" />
          </Link>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 6H21" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 18H21" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <Link href="https://eduport.app/" className="flex items-center">
              <Image 
                src="https://eduport.app/wp-content/uploads/2024/09/Eduport-Logo1.svg.png"
                alt="Eduport Logo"
                width={140}
                height={58}
                priority
              />
            </Link>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2"
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <nav className="flex flex-col p-4">
            <Link 
              href="/" 
              className="py-3 px-4 text-gray-700 hover:text-[#FF6B00] font-medium border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className="py-3 px-4 text-gray-700 hover:text-[#FF6B00] font-medium border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/our-courses" 
              className="py-3 px-4 text-gray-700 hover:text-[#FF6B00] font-medium border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Our Courses
            </Link>
            <Link 
              href="/eduport-residential-campus" 
              className="py-3 px-4 text-gray-700 hover:text-[#FF6B00] font-medium border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              NEET JEE Campus
            </Link>
            <Link 
              href="/careers" 
              className="py-3 px-4 text-gray-700 hover:text-[#FF6B00] font-medium border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Careers
            </Link>
            <Link 
              href="/contact" 
              className="py-3 px-4 text-gray-700 hover:text-[#FF6B00] font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact Us
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

import { ChevronDown, ChevronUp } from 'lucide-react'
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'
import { useState } from 'react'

type FooterGroup = {
  heading: string
  links: string[]
}

const footerData: FooterGroup[] = [
  {
    heading: 'Support',
    links: [
      'Help Center',
      'Get help with safety issues',
      'Erranzacover',
      'Travel insurance',
      'Anti-discrimination',
      'Disability support',
    ],
  },
  {
    heading: 'Products',
    links: [
      'Safari',
      'Hotels & Stays',
      'Service delivery',
      'Market Place',
      'Erranza Premier',
    ],
  },
  {
    heading: 'Hosting',
    links: [
      'Rent your home',
      'Rent your services',
      'ErranzaCover for hosts',
      'Hosting resources',
    ],
  },
  {
    heading: 'The Erranza',
    links: [
      'Newsroom',
      'Careers',
      'Investors',
      'Gift cards',
    ],
  },
]

// Replace the FooterGroup function with this — always expanded, no toggle
function FooterGroup({ heading, links }: FooterGroup) {
  return (
    <div className="border-b border-[#e0d9cc] shadow-sm px-4 sm:px-6 py-5">
      <h3 className="text-sm font-bold text-[#1a1a1a] mb-3">{heading}</h3>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link}>
            <button className="text-sm text-gray-500 hover:text-[#2c4a1e]
                               transition-colors text-left w-full">
              {link}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function FooterSection() {
  return (
    <footer className="bg-[#f5f6f4] mt-6 w-full pb-20 sm:pb-0">
      {/* Grid layout */}
      <div className="sm:grid sm:grid-cols-4 sm:gap-6 px-6 py-6">
        {footerData.map((group) => (
          <FooterGroup key={group.heading} {...group} />
        ))}
      </div>

      {/* Bottom strip */}
      <div className="px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Erranza, Inc. · All rights reserved
        </p>
        <div className="flex items-center gap-4">
          <button className="text-xs text-gray-400 hover:text-[#2c4a1e]">Privacy</button>
          <button className="text-xs text-gray-400 hover:text-[#2c4a1e]">Terms</button>
          <button className="text-xs text-gray-400 hover:text-[#2c4a1e]">Sitemap</button>
          {/* Social icons */}
          <div className="flex items-center gap-3 ml-4">
            <FaFacebook className="text-gray-400 hover:text-[#2c4a1e]" />
            <FaTwitter className="text-gray-400 hover:text-[#2c4a1e]" />
            <FaInstagram className="text-gray-400 hover:text-[#2c4a1e]" />
            <FaLinkedin className="text-gray-400 hover:text-[#2c4a1e]" />
          </div>
        </div>
      </div>

      {/* Bottom margin so it clears the fixed bottom nav */}
      <div className="h-24 sm:h-6" /> 
      

    </footer>
  )
}

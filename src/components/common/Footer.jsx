import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Fashion Forward</h3>
            <p className="text-sm leading-relaxed">
              Your destination for trendy, high-quality fashion at unbeatable prices.
              We bring the latest styles from around the world right to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white">Home</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white">Shop</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/shipping" className="hover:text-white">Shipping Info</Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-white">Returns &amp; Exchanges</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white">Contact Us</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Connect With Us</h3>
            <div className="flex gap-4">
              <a href="#" aria-label="Facebook" className="hover:text-white">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-white">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-white">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" aria-label="YouTube" className="hover:text-white">
                <Globe className="h-5 w-5" />
              </a>
            </div>
            <p className="mt-4 text-sm">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm">
          &copy; 2026 Fashion Forward. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

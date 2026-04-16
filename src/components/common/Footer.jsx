import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import useSettingsStore from '../../store/settingsStore';
import Logo from './Logo';

const Footer = () => {
  const { settings } = useSettingsStore();
  const storeName = settings?.storeName || 'Fashion Forward';
  const tagline   = settings?.tagline   || 'Curating your style';
  const contact   = settings?.contact   || {};
  const social    = settings?.social    || {};
  const year      = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <div className="mb-4">
              <Logo to="/" size="md" variant="dark" />
            </div>
            <p className="text-sm leading-relaxed">
              {tagline}. Your destination for trendy, high-quality fashion at unbeatable prices.
            </p>
            {contact.address && (
              <p className="mt-3 flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{contact.address}</span>
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/shop" className="hover:text-white">Shop</Link></li>
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/return-policy" className="hover:text-white">Returns &amp; Exchanges</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              {contact.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${contact.phone}`} className="hover:text-white">{contact.phone}</a>
                </li>
              )}
              {contact.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${contact.email}`} className="hover:text-white">{contact.email}</a>
                </li>
              )}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Connect With Us</h3>
            <div className="flex gap-4">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-white">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-white">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noreferrer" aria-label="Twitter" className="hover:text-white">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:text-white">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
            <p className="mt-4 text-sm">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm">
          &copy; {year} {storeName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

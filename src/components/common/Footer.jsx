import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
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
                <a href={social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noreferrer" aria-label="X / Twitter" className="hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
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

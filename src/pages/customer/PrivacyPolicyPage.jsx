import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: '1. Information We Collect',
    content: `When you use Fashion Forward, we may collect the following personal information:

- Full name
- Email address
- Phone number
- Shipping and billing address
- Order history and transaction details
- Device and browser information (for analytics)
- Payment information (processed securely through our payment partners)`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information we collect to:

- Process and fulfill your orders
- Send order confirmations, shipping updates, and delivery notifications
- Communicate important account or service-related announcements
- Improve our website, products, and customer experience
- Provide personalized product recommendations
- Handle returns, exchanges, and customer support inquiries`,
  },
  {
    title: '3. Data Security',
    content: `We take the security of your personal data seriously. All sensitive information is encrypted using industry-standard SSL/TLS encryption. Your data is stored on secure servers with restricted access. We regularly review our security practices and update them to stay aligned with current standards.`,
  },
  {
    title: '4. Cookies',
    content: `Our website uses cookies to enhance your browsing experience. Cookies help us remember your preferences, keep items in your shopping cart, and understand how you interact with our site. You can manage your cookie preferences through your browser settings. Disabling cookies may affect certain features of the website.`,
  },
  {
    title: '5. Third-Party Sharing',
    content: `We do not sell, trade, or rent your personal information to third parties. We only share your data with trusted courier and logistics partners solely for the purpose of delivering your orders. Our payment processing partners receive only the information necessary to complete your transactions securely.`,
  },
  {
    title: '6. Your Rights',
    content: `You have the right to:

- Access the personal information we hold about you
- Request corrections to inaccurate or outdated data
- Request deletion of your personal data (subject to legal obligations)
- Opt out of promotional communications at any time
- Download a copy of your data

To exercise any of these rights, please contact us using the details provided below.`,
  },
  {
    title: '7. Contact Us for Privacy Concerns',
    content: `If you have any questions or concerns about this Privacy Policy or how your data is handled, please reach out to us:

- Email: privacy@fashionforward.in
- Phone: +91 98765 43210
- Address: 123, MG Road, Vijay Nagar, Indore, MP 452010`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold">Privacy Policy</h1>
          <p className="mt-4 text-lg text-indigo-100 max-w-xl mx-auto">
            Your privacy matters to us. Read how we collect, use, and protect your data.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10">
          <p className="text-sm text-gray-400 mb-8">Last updated: April 1, 2026</p>

          <p className="text-gray-600 mb-8 leading-relaxed">
            Fashion Forward is committed to protecting your privacy. This Privacy Policy explains how
            we collect, use, disclose, and safeguard your information when you visit our website or
            make a purchase.
          </p>

          <div className="space-y-8">
            {sections.map(({ title, content }) => (
              <div key={title}>
                <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                  {content}
                </div>
              </div>
            ))}
          </div>

          <hr className="my-10 border-gray-200" />

          <p className="text-sm text-gray-400 text-center">
            By using Fashion Forward, you agree to this Privacy Policy.{' '}
            <Link to="/contact" className="text-indigo-600 hover:text-indigo-500">
              Contact us
            </Link>{' '}
            if you have any questions.
          </p>
        </div>
      </section>
    </div>
  );
}

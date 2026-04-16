import { useState } from 'react';
import { RotateCcw, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    q: 'How long does it take to process a refund?',
    a: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item. The amount will be credited to your original payment method.',
  },
  {
    q: 'Can I return a sale or discounted item?',
    a: 'Items purchased on sale or with a discount code are final sale and cannot be returned or exchanged unless they arrive damaged or defective.',
  },
  {
    q: 'Who pays for return shipping?',
    a: 'If the return is due to a defective or incorrect item, we cover the shipping cost. For all other returns, the customer is responsible for return shipping charges.',
  },
  {
    q: 'Can I exchange an item for a different size?',
    a: 'Yes, exchanges for a different size are allowed within the 7-day return window, subject to availability. Contact our support team to initiate an exchange.',
  },
  {
    q: 'What if I received a damaged item?',
    a: 'If your item arrives damaged, please contact us within 48 hours of delivery with photos of the damage. We will arrange a free return pickup and send a replacement or full refund.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
      >
        <span className="font-medium text-gray-900 text-sm">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{a}</div>
      )}
    </div>
  );
}

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6">
            <RotateCcw className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold">Return & Refund Policy</h1>
          <p className="mt-4 text-lg text-indigo-100 max-w-xl mx-auto">
            We want you to be happy with your purchase. Here is everything you need to know about returns.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 space-y-10">
          {/* Return Window */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Return Window</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              You may return most items within <strong>7 days from the date of delivery</strong>. The
              item must be in its original condition to be eligible for a return.
            </p>
          </div>

          {/* Eligible Items */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Eligible Items</h2>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
              <li>Items must be unworn, unwashed, and in their original condition</li>
              <li>All original tags and labels must be attached</li>
              <li>Items must be in the original packaging</li>
              <li>A valid order receipt or proof of purchase is required</li>
            </ul>
          </div>

          {/* Non-Returnable */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Non-Returnable Items</h2>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
              <li>Innerwear, lingerie, and swimwear</li>
              <li>Customized or personalized products</li>
              <li>Items purchased during clearance or final sale</li>
              <li>Gift cards and vouchers</li>
              <li>Items that show signs of use, alteration, or damage by the customer</li>
            </ul>
          </div>

          {/* How to Return */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">How to Initiate a Return</h2>
            <ol className="list-decimal list-inside text-gray-600 text-sm space-y-2">
              <li>
                <strong>Contact Us</strong> — Reach out to our support team via email at{' '}
                <a href="mailto:support@fashionforward.in" className="text-indigo-600 hover:text-indigo-500">
                  support@fashionforward.in
                </a>{' '}
                or call +91 98765 43210 with your order number.
              </li>
              <li>
                <strong>Pack the Item</strong> — Place the item in its original packaging with all
                tags attached. Include your order receipt.
              </li>
              <li>
                <strong>Ship It Back</strong> — Our team will provide you with a return shipping
                address and instructions. Drop off the package at the nearest courier location.
              </li>
            </ol>
          </div>

          {/* Refund Process */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Refund Process</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Once we receive your returned item, our team will inspect it within 2 business days.
              If approved, your refund will be processed within{' '}
              <strong>5-7 business days</strong> to your original payment method. You will receive
              an email confirmation once the refund has been initiated.
            </p>
          </div>

          {/* Exchange */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Exchange Policy</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We offer exchanges for a different size or color of the same product, subject to
              availability. To request an exchange, follow the same steps as a return and mention
              your preferred replacement. If the requested item is out of stock, we will issue a
              full refund instead.
            </p>
          </div>

          {/* Wholesale */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Wholesale Returns</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Wholesale orders are subject to different return terms. Wholesale customers must
              contact our wholesale support team at{' '}
              <a href="mailto:wholesale@fashionforward.in" className="text-indigo-600 hover:text-indigo-500">
                wholesale@fashionforward.in
              </a>{' '}
              or speak with their assigned account manager before initiating any returns. Bulk
              returns may require prior authorization and additional inspection time.
            </p>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map(({ q, a }) => (
                <FAQItem key={q} q={q} a={a} />
              ))}
            </div>
          </div>

          <hr className="border-gray-200" />

          <p className="text-sm text-gray-400 text-center">
            Still have questions?{' '}
            <Link to="/contact" className="text-indigo-600 hover:text-indigo-500">
              Contact our support team
            </Link>{' '}
            and we will be happy to help.
          </p>
        </div>
      </section>
    </div>
  );
}

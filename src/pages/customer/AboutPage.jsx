import { Link } from 'react-router-dom';
import { ArrowRight, Gem, BadgeIndianRupee, LayoutGrid, HeadsetIcon, ShoppingBag } from 'lucide-react';

const values = [
  {
    icon: Gem,
    title: 'Premium Quality',
    desc: 'Every piece is handpicked and quality-checked to ensure you get only the best.',
  },
  {
    icon: BadgeIndianRupee,
    title: 'Affordable Prices',
    desc: 'Fashion should be accessible. We offer competitive prices without compromising quality.',
  },
  {
    icon: LayoutGrid,
    title: 'Wide Selection',
    desc: 'From ethnic wear to western outfits, find everything you need under one roof.',
  },
  {
    icon: HeadsetIcon,
    title: 'Customer First',
    desc: 'Our dedicated support team is always ready to help with any query or concern.',
  },
];

const stats = [
  { value: '5+', label: 'Years in Business' },
  { value: '50K+', label: 'Happy Customers' },
  { value: '10K+', label: 'Products' },
  { value: '500+', label: 'Cities Served' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">About Fashion Forward</h1>
          <p className="mt-4 text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto">
            Your trusted destination for trendy, quality fashion at prices you will love.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Our Story */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            Fashion Forward started as a small clothing shop in Indore, Madhya Pradesh, with a simple
            mission: make great fashion accessible to everyone. What began as a local store has now
            grown into a Pan-India brand serving customers across hundreds of cities.
          </p>
          <p className="text-gray-600 leading-relaxed text-lg mt-4">
            We believe that style should never come at the cost of affordability. Our team works
            tirelessly to source the latest trends, negotiate the best prices, and deliver a shopping
            experience that keeps our customers coming back for more.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-100 mb-4">
                  <Icon className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-gray-500 mt-2 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100"
            >
              <p className="text-3xl md:text-4xl font-extrabold text-indigo-600">{value}</p>
              <p className="text-gray-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Upgrade Your Wardrobe?</h2>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
            Browse thousands of products and find the perfect outfit for every occasion.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
          >
            Start Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

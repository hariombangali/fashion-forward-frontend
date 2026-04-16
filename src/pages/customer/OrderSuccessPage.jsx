import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, Download, ShoppingBag, ClipboardList, PartyPopper, Sparkles,
} from 'lucide-react';
import useOrderStore from '../../store/orderStore';
import { downloadBill } from '../../utils/downloadBill';
import Confetti from '../../components/common/Confetti';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const { currentOrder, fetchOrderById } = useOrderStore();

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId);
    }
  }, [orderId, fetchOrderById]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-4 py-10 overflow-hidden">
      {/* Confetti burst */}
      <Confetti />

      {/* Floating background blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-gradient opacity-20 rounded-full blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-flash-gradient opacity-20 rounded-full blur-3xl animate-float pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white"
      >
        {/* Celebration icon with spring entry + pulse ring */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
          className="relative inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 animate-pulse-ring" />
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg">
            <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          {/* Floating sparkles around icon */}
          <motion.span
            animate={{ y: [0, -8, 0], rotate: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-5 h-5 text-amber-400 fill-amber-200" />
          </motion.span>
          <motion.span
            animate={{ y: [0, 8, 0], rotate: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, delay: 0.3 }}
            className="absolute -bottom-1 -left-3"
          >
            <PartyPopper className="w-5 h-5 text-pink-500" />
          </motion.span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-indigo-600 to-pink-500 mb-2"
        >
          Order Placed! 🎉
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-600 mb-6"
        >
          Thank you for your purchase! We'll call you soon to confirm.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-4 mb-6 space-y-2.5 text-sm border border-gray-100"
        >
          {currentOrder?.orderNumber && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Order Number</span>
              <span className="font-mono font-semibold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                {currentOrder.orderNumber}
              </span>
            </div>
          )}
          {currentOrder?.total && (
            <div className="flex justify-between">
              <span className="text-gray-500">Total Amount</span>
              <span className="font-bold text-lg text-gray-900">₹{currentOrder.total}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Payment</span>
            <span className="font-medium text-gray-900">Cash on Delivery</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Est. Delivery</span>
            <span className="font-medium text-gray-900">5-7 business days</span>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={() => downloadBill(orderId, currentOrder?.orderNumber)}
          className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700 mb-6 group"
        >
          <Download className="w-4 h-4 group-hover:animate-bounce-subtle" />
          Download Bill
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link
            to="/shop"
            className="btn-magnetic flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
          </Link>
          <Link
            to="/my-orders"
            className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 hover:border-indigo-400 transition-all"
          >
            <ClipboardList className="w-5 h-5" />
            View My Orders
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

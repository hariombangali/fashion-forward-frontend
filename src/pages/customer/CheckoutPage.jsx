import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Package, CreditCard, Plus, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import useOrderStore from '../../store/orderStore';

const addressSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required').regex(/^[6-9]\d{9}$/, 'Invalid phone'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(1, 'Pincode is required').regex(/^\d{6}$/, 'Invalid pincode'),
});

const STEPS = [
  { id: 1, label: 'Address', icon: MapPin },
  { id: 2, label: 'Review', icon: Package },
  { id: 3, label: 'Payment', icon: CreditCard },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, addAddress, fetchUser } = useAuthStore();
  const { items, subtotal, shippingCharge, total, appliedCoupon, discount, finalTotal, fetchCart, removeCoupon } = useCartStore();
  const { createOrder, loading: orderLoading } = useOrderStore();

  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    fetchCart();
    // user is already loaded by App.jsx on mount; no need to re-fetch here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user?.addresses?.length > 0 && !selectedAddress) {
      const def = user.addresses.find((a) => a.isDefault);
      setSelectedAddress(def?._id || user.addresses[0]._id);
    }
  }, [user?.addresses, selectedAddress]);

  const addresses = user?.addresses || [];

  const handleAddAddress = async (data) => {
    try {
      await addAddress(data);
      setShowAddForm(false);
      reset();
    } catch {
      // handled by store
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    // Find the selected address object from user's addresses
    const addressObj = addresses.find((a) => a._id === selectedAddress);
    if (!addressObj) {
      toast.error('Invalid address. Please select again.');
      return;
    }
    try {
      const order = await createOrder({
        shippingAddress: {
          fullName: addressObj.fullName,
          phone: addressObj.phone,
          line1: addressObj.line1,
          line2: addressObj.line2 || '',
          city: addressObj.city,
          state: addressObj.state,
          pincode: addressObj.pincode,
        },
        ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
      });
      removeCoupon();
      navigate(`/order-success/${order._id}`);
    } catch {
      // handled by store
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {STEPS.map(({ id, label, icon: Icon }, idx) => (
            <div key={id} className="flex items-center">
              <button
                onClick={() => id < step && setStep(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  step === id
                    ? 'bg-indigo-600 text-white'
                    : step > id
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > id ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                <span className="hidden sm:inline">{label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className={`w-8 md:w-16 h-0.5 mx-2 ${step > id ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Address */}
        {step === 1 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Delivery Address</h2>

            {addresses.length === 0 && !showAddForm && (
              <p className="text-gray-500 mb-4">No saved addresses. Add a new one below.</p>
            )}

            <div className="space-y-3 mb-4">
              {addresses.map((addr) => (
                <label
                  key={addr._id}
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition ${
                    selectedAddress === addr._id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr._id}
                    checked={selectedAddress === addr._id}
                    onChange={() => setSelectedAddress(addr._id)}
                    className="mt-1 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{addr.fullName}</p>
                    <p className="text-sm text-gray-600">
                      {addr.addressLine1}
                      {addr.addressLine2 && `, ${addr.addressLine2}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-sm text-gray-500">Phone: {addr.phone}</p>
                  </div>
                </label>
              ))}
            </div>

            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 text-indigo-600 font-medium text-sm hover:text-indigo-500"
              >
                <Plus className="w-4 h-4" />
                Add New Address
              </button>
            ) : (
              <form onSubmit={handleSubmit(handleAddAddress)} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-gray-900">New Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input {...register('fullName')} placeholder="Full Name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <input {...register('phone')} placeholder="Phone" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                </div>
                <div>
                  <input {...register('addressLine1')} placeholder="Address Line 1" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  {errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>}
                </div>
                <input {...register('addressLine2')} placeholder="Address Line 2 (optional)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input {...register('city')} placeholder="City" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <input {...register('state')} placeholder="State" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                  </div>
                  <div>
                    <input {...register('pincode')} placeholder="Pincode" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                    Save Address
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  if (!selectedAddress) {
                    toast.error('Please select an address');
                    return;
                  }
                  setStep(2);
                }}
                className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Review</h2>
            <div className="divide-y">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-4 py-4">
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.product?.image || item.product?.images?.[0] || 'https://via.placeholder.com/200?text=No+Image'}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=No+Image'; }}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.product?.name}</p>
                    <div className="flex gap-2 text-sm text-gray-500">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">₹{item.subtotal ?? (item.pricePerPiece ?? 0) * item.quantity}</p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shippingCharge === 0 ? 'Free' : `₹${shippingCharge}`}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t pt-2"><span>Total</span><span>₹{finalTotal || total}</span></div>
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
                Back
              </button>
              <button onClick={() => setStep(3)} className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition">
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
            <label className="flex items-start gap-3 p-4 border-2 border-indigo-600 bg-indigo-50 rounded-lg cursor-pointer">
              <input type="radio" checked readOnly className="mt-1 text-indigo-600" />
              <div>
                <p className="font-medium text-gray-900">Cash on Delivery (COD)</p>
                <p className="text-sm text-gray-500 mt-1">Pay with cash when your order is delivered to your doorstep.</p>
              </div>
            </label>

            <div className="border-t mt-6 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shippingCharge === 0 ? 'Free' : `₹${shippingCharge}`}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total (COD)</span><span>₹{finalTotal || total}</span></div>
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(2)} className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
                Back
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={orderLoading}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {orderLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

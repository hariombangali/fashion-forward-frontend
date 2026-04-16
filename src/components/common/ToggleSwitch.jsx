import { Loader2 } from 'lucide-react';

/**
 * Accessible toggle switch for block/unblock or any on/off state.
 *
 * Props:
 *  - isOn: boolean (true = green "on", false = red "off")
 *  - onToggle: () => void (called when user clicks)
 *  - loading: boolean (shows spinner, disables interaction)
 *  - labelOn / labelOff: optional text labels shown beside
 *  - size: 'sm' | 'md' (default md)
 *  - confirmMessage: optional string — show confirm() dialog before toggling
 */
const ToggleSwitch = ({
  isOn,
  onToggle,
  loading = false,
  labelOn,
  labelOff,
  size = 'md',
  confirmMessage,
}) => {
  const sizes = {
    sm: { track: 'w-9 h-5', thumb: 'w-3.5 h-3.5', shift: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-4 h-4', shift: 'translate-x-5' },
  };
  const s = sizes[size];

  const handleClick = () => {
    if (loading) return;
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    onToggle();
  };

  return (
    <div className="flex items-center gap-2">
      {(labelOn || labelOff) && (
        <span
          className={`text-xs font-semibold ${
            isOn ? 'text-green-700' : 'text-red-600'
          }`}
        >
          {isOn ? labelOn : labelOff}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        onClick={handleClick}
        disabled={loading}
        className={`relative inline-flex items-center ${s.track} rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isOn
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 focus:ring-green-400'
            : 'bg-gradient-to-r from-red-500 to-rose-500 focus:ring-red-400'
        } ${loading ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
      >
        <span
          className={`${s.thumb} inline-flex items-center justify-center bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            isOn ? s.shift : 'translate-x-0.5'
          }`}
        >
          {loading && <Loader2 className="w-2.5 h-2.5 text-gray-500 animate-spin" />}
        </span>
      </button>
    </div>
  );
};

export default ToggleSwitch;

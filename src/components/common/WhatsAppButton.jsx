import { IoLogoWhatsapp } from 'react-icons/io5';
import { PHARMACIST_WHATSAPP } from '../../constants';

export default function WhatsAppButton() {
  const handleWhatsAppClick = () => {
    const message = 'Hello, I would like to inquire about your products.';
    const whatsappUrl = `https://wa.me/${PHARMACIST_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-green-500 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-all duration-300 hover:scale-110 active:scale-95"
      aria-label="Contact us on WhatsApp"
    >
      <IoLogoWhatsapp size={28} className="text-white" />
    </button>
  );
}

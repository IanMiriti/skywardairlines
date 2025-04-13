
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, ShieldCheck, Smartphone, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentFormProps {
  isProcessing: boolean;
  totalAmount: number;
  onPaymentMethodChange: (method: "mpesa" | "card") => void;
  paymentMethod: "mpesa" | "card";
  onSubmit: () => void;
  phoneNumber: string;
  onPhoneNumberChange: (phoneNumber: string) => void;
  buttonText?: string;
  validatePhoneNumber?: boolean;
}

export const PaymentForm = ({
  isProcessing,
  totalAmount,
  onPaymentMethodChange,
  paymentMethod,
  onSubmit,
  phoneNumber,
  onPhoneNumberChange,
  buttonText = "Pay Now",
  validatePhoneNumber = true
}: PaymentFormProps) => {
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const validateAndSubmit = () => {
    if (paymentMethod === "mpesa" && validatePhoneNumber) {
      // Validate Kenyan phone number format
      const phoneRegex = /^(?:254|\+254|0)?(7|1)[0-9]{8}$/;
      
      if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
        setPhoneError("Please enter a valid Kenyan phone number");
        return;
      }
    }
    
    setPhoneError(null);
    onSubmit();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPhoneNumberChange(e.target.value);
    if (phoneError) setPhoneError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="bg-safari-sunset text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-semibold">Payment Summary</h2>
      </div>
      
      <div className="p-6 bg-gradient-to-r from-white to-safari-sahara/10">
        <div className="mb-6">
          <h3 className="font-medium mb-3">Payment Method</h3>
          
          <RadioGroup 
            value={paymentMethod} 
            onValueChange={(value) => onPaymentMethodChange(value as "mpesa" | "card")}
            className="grid grid-cols-1 gap-3"
          >
            <label 
              className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer transition-all ${
                paymentMethod === "mpesa" 
                  ? "border-safari-kente bg-safari-kente/10" 
                  : "border-gray-200 bg-gray-50 hover:border-safari-kente/50"
              }`}
            >
              <RadioGroupItem value="mpesa" id="mpesa" className="mt-1" />
              <div className="flex gap-3">
                <Smartphone className="text-safari-kente mt-1" size={20} />
                <div>
                  <p className="font-medium">M-Pesa (Mobile Money)</p>
                  <p className="text-sm text-gray-500">Fast and convenient mobile payment</p>
                </div>
              </div>
            </label>
            
            <label 
              className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer transition-all ${
                paymentMethod === "card" 
                  ? "border-safari-sky bg-safari-sky/10" 
                  : "border-gray-200 bg-gray-50 hover:border-safari-sky/50"
              }`}
            >
              <RadioGroupItem value="card" id="card" className="mt-1" />
              <div className="flex gap-3">
                <CreditCard className="text-safari-sky mt-1" size={20} />
                <div>
                  <p className="font-medium">Credit/Debit Card</p>
                  <p className="text-sm text-gray-500">Secure card payment</p>
                </div>
              </div>
            </label>
          </RadioGroup>
        </div>
        
        {paymentMethod === "mpesa" && (
          <div className="mb-6">
            <Label htmlFor="phone-number" className="mb-2 block">M-PESA Phone Number</Label>
            <Input
              id="phone-number"
              type="tel"
              placeholder="07XX XXX XXX"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className={`w-full ${phoneError ? 'border-red-500' : ''}`}
            />
            {phoneError && (
              <div className="mt-1 text-red-500 text-sm flex items-center gap-1">
                <AlertCircle size={14} />
                {phoneError}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">Enter your M-PESA registered number (e.g. 0712345678)</p>
          </div>
        )}
        
        <button
          onClick={validateAndSubmit}
          disabled={isProcessing}
          className={`w-full py-3 text-white rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
            paymentMethod === "mpesa" 
              ? "bg-safari-kente hover:bg-safari-kente/90" 
              : "bg-safari-sky hover:bg-safari-sky/90"
          } transform hover:-translate-y-1 hover:shadow-lg duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-0 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              {paymentMethod === "mpesa" ? <Smartphone size={18} /> : <CreditCard size={18} />}
              {buttonText} {formatPrice(totalAmount)}
            </>
          )}
        </button>
        
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <ShieldCheck size={14} className="text-safari-kente" />
          <span>Your payment is secure and encrypted</span>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Wallet, Check, QrCode } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import QRCode from 'qrcode';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrAmount, setQrAmount] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const predefinedAmounts = [500, 1000, 2000, 5000, 10000];

  const generateQRCode = async () => {
    const amount = parseInt(qrAmount);
    
    if (!amount || amount < 100 || amount > 100000) {
      toast.error('Amount should be between ₹100 and ₹1,00,000');
      return;
    }

    setIsGeneratingQR(true);

    try {
      // Generate UPI payment string
      const upiString = `upi://pay?pa=merchant@payu&pn=Eko Shield&am=${amount}&cu=INR&tn=Credits for Eko Shield`;
      
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(upiString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(qrDataUrl);
      setShowQRCode(true);
      toast.success(`QR Code generated for ₹${amount}`);
    } catch (error) {
      toast.error('Failed to generate QR code. Please try again.');
      console.error('QR generation error:', error);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handlePayUPayment = async () => {
    const amount = customAmount ? parseInt(customAmount) : selectedAmount;
    
    if (!amount || amount < 100) {
      toast.error('Minimum amount is ₹100');
      return;
    }

    setIsProcessing(true);

    // PayU payment integration (demo implementation)
    try {
      // In a real implementation, you would:
      // 1. Create a payment request on your backend
      // 2. Get the PayU payment URL
      // 3. Redirect to PayU payment gateway
      
      // For demo purposes, we'll simulate the payment flow
      const paymentData = {
        key: 'test_key', // Your PayU merchant key
        txnid: `TXN_${Date.now()}`,
        amount: amount,
        productinfo: `Eko Shield Credits - ${amount} Credits`,
        firstname: 'User',
        email: 'user@example.com',
        phone: '9999999999',
        surl: `${window.location.origin}/payment-success`,
        furl: `${window.location.origin}/payment-failure`,
        hash: 'demo_hash' // This should be generated on your backend
      };

      // Create a form and submit to PayU (demo)
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://test.payu.in/_payment'; // Use https://secure.payu.in/_payment for live
      
      Object.keys(paymentData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = paymentData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      
      // For demo purposes, show success message instead of actual payment
      setTimeout(() => {
        setIsProcessing(false);
        toast.success(`Payment initiated for ₹${amount}. Redirecting to PayU...`);
        // form.submit(); // Uncomment for actual PayU integration
        
        // Simulate successful payment for demo
        setTimeout(() => {
          toast.success(`${amount} credits added successfully!`);
          navigate('/wallet');
        }, 2000);
      }, 1500);

    } catch (error) {
      setIsProcessing(false);
      toast.error('Payment initiation failed. Please try again.');
      console.error('Payment error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/wallet')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Wallet</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/cb6255c2-8a31-4856-b9b4-3aaf40ed7f92.png" 
                  alt="EKO Logo" 
                  className="h-10 w-auto"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-slate-900">Eko Shield</span>
                  <span className="text-lg text-slate-600">- Add Credits</span>
                </div>
              </div>
              <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                Secure Payment
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Options */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Add Credits</h2>
            </div>

            {/* Predefined Amounts */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-slate-700 mb-3 block">
                Select Amount
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {predefinedAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount ? "default" : "outline"}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className="text-sm"
                  >
                    ₹{amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Or Enter Custom Amount
              </Label>
              <Input
                type="number"
                placeholder="Enter amount (min ₹100)"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(0);
                }}
                className="w-full"
              />
            </div>

            {/* Payment Summary */}
            <div className="bg-slate-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600">Amount:</span>
                <span className="font-medium">₹{customAmount || selectedAmount}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600">Credits:</span>
                <span className="font-medium">{customAmount || selectedAmount} Credits</span>
              </div>
              <div className="flex justify-between items-center text-green-600">
                <span className="font-medium">Exchange Rate:</span>
                <span className="font-medium">1:1 (₹1 = 1 Credit)</span>
              </div>
            </div>

            {/* Payment Button */}
            <Button 
              onClick={handlePayUPayment}
              disabled={isProcessing || (!customAmount && !selectedAmount)}
              className="w-full bg-orange-600 hover:bg-orange-700 mb-4"
              size="lg"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <>
                  Pay with PayU - ₹{customAmount || selectedAmount}
                </>
              )}
            </Button>

            {/* QR Code Generation */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Or Generate QR Code</h3>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Enter amount (max ₹1,00,000)"
                  value={qrAmount}
                  onChange={(e) => setQrAmount(e.target.value)}
                  className="flex-1"
                  max="100000"
                />
                <Button 
                  onClick={generateQRCode}
                  disabled={isGeneratingQR || !qrAmount}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Generate QR</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Payment Security & Info / QR Code Display */}
          <Card className="p-6">
            {showQRCode ? (
              <div className="text-center">
                <div className="flex items-center space-x-3 mb-6">
                  <QrCode className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-slate-900">Payment QR Code</h2>
                </div>
                
                <div className="bg-white p-4 rounded-lg border-2 border-slate-200 mb-4">
                  <img src={qrCodeUrl} alt="Payment QR Code" className="mx-auto" />
                </div>
                
                <p className="text-sm text-slate-600 mb-4">
                  Scan this QR code with any UPI app to pay ₹{qrAmount}
                </p>
                
                <Button 
                  onClick={() => setShowQRCode(false)}
                  variant="outline"
                  className="w-full"
                >
                  Generate New QR Code
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3 mb-6">
                  <Wallet className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-bold text-slate-900">Payment Information</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-slate-900">Secure Payment</h3>
                      <p className="text-sm text-slate-600">
                        All payments are processed securely through PayU payment gateway
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-slate-900">Instant Credit</h3>
                      <p className="text-sm text-slate-600">
                        Credits are added to your wallet immediately after successful payment
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-slate-900">QR Code Payment</h3>
                      <p className="text-sm text-slate-600">
                        Generate dynamic QR codes for UPI payments up to ₹1,00,000
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-slate-900">Multiple Payment Options</h3>
                      <p className="text-sm text-slate-600">
                        Credit/Debit Cards, Net Banking, UPI, and Wallets supported
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-slate-900">24/7 Support</h3>
                      <p className="text-sm text-slate-600">
                        Contact support for any payment related queries
                      </p>
                    </div>
                  </div>
                </div>

                {/* PayU Logo */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-sm text-slate-500 text-center">
                    Powered by <span className="font-medium text-orange-600">PayU</span> Payment Gateway
                  </p>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

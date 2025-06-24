
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, Smartphone, QrCode, Wallet, IndianRupee } from "lucide-react";
import { Link } from 'react-router-dom';
import { toast } from "sonner";
import { EkoApiService } from "@/services/ekoApiService";

const Payment = () => {
  const [selectedMethod, setSelectedMethod] = useState('payu');
  const [amount, setAmount] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const paymentMethods = [
    {
      id: 'payu',
      name: 'PayU Gateway',
      icon: CreditCard,
      description: 'Credit/Debit Cards, Net Banking, UPI'
    },
    {
      id: 'qr',
      name: 'UPI QR Code',
      icon: QrCode,
      description: 'Generate dynamic QR code for UPI payment'
    }
  ];

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value);
    if (numValue > 100000) {
      toast.error("Amount cannot exceed ₹1,00,000");
      return;
    }
    setAmount(value);
  };

  const generateQRCode = async () => {
    if (!apiKey) {
      toast.error("Please enter your API key first");
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > 100000) {
      toast.error("Amount cannot exceed ₹1,00,000");
      return;
    }

    setIsGeneratingQR(true);
    
    try {
      const ekoService = new EkoApiService(apiKey);
      
      // Generate QR code using Eko API
      const qrData = {
        merchant_id: 'MERCHANT_ID', // This should be your actual merchant ID
        amount: parseFloat(amount),
        transaction_id: `TXN_${Date.now()}`,
        purpose_code: '00', // Person to Person transfer
        merchant_name: 'Eko Shield',
        merchant_upi_id: 'merchant@upi', // Your actual UPI ID
        expiry_minutes: 30
      };

      // Call the Eko QR generation API
      const response = await fetch('https://api.eko.in:25002/ekoicici/v3/upi/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'developer_key': apiKey,
          'secret-key': 'your-secret-key', // This should be your actual secret key
        },
        body: JSON.stringify({
          initiator_id: 7417247999,
          user_code: 32515001,
          ...qrData
        })
      });

      const result = await response.json();
      
      if (result.status === 0 && result.data?.qr_string) {
        setQrCode(result.data.qr_string);
        toast.success("QR Code generated successfully!");
      } else {
        toast.error(result.message || "Failed to generate QR code");
      }
    } catch (error) {
      console.error('QR generation error:', error);
      toast.error("Failed to generate QR code");
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handlePayment = () => {
    if (selectedMethod === 'payu') {
      // PayU integration logic here
      toast.success("Redirecting to PayU Gateway...");
    } else if (selectedMethod === 'qr') {
      generateQRCode();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <Wallet className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900">Add Credits</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* API Key Input */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">API Configuration</h3>
          <div className="space-y-2">
            <Label htmlFor="apiKey">Eko API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Eko API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="max-w-md"
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Method Selection */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Payment Method</h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full flex items-center space-x-4 p-4 rounded-lg border-2 transition-all ${
                        selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="p-2 rounded-md bg-blue-500">
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-medium text-slate-900">{method.name}</h4>
                        <p className="text-sm text-slate-600">{method.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Amount Input */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Enter Amount</h3>
              <div className="space-y-4">
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="pl-10 text-lg"
                    max={100000}
                  />
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Minimum: ₹100</span>
                  <span>Maximum: ₹1,00,000</span>
                </div>
                
                {/* Quick amount buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[500, 1000, 2500, 5000].map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="text-xs"
                    >
                      ₹{quickAmount}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Summary & QR Display */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Credits to Add:</span>
                  <span className="font-medium">{amount ? Math.floor(parseFloat(amount)) : 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Amount:</span>
                  <span className="font-medium">₹{amount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Payment Method:</span>
                  <Badge variant="outline">
                    {paymentMethods.find(m => m.id === selectedMethod)?.name}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>₹{amount || 0}</span>
                </div>
              </div>
            </Card>

            {/* QR Code Display */}
            {selectedMethod === 'qr' && qrCode && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">UPI QR Code</h3>
                <div className="text-center space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-dashed border-slate-300 inline-block">
                    <img 
                      src={`data:image/svg+xml;base64,${btoa(qrCode)}`}
                      alt="UPI QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <p className="text-sm text-slate-600">
                    Scan this QR code with any UPI app to make payment
                  </p>
                  <Badge variant="outline" className="text-orange-700 border-orange-200 bg-orange-50">
                    Expires in 30 minutes
                  </Badge>
                </div>
              </Card>
            )}

            {/* Payment Button */}
            <Card className="p-6">
              <Button
                onClick={handlePayment}
                disabled={!amount || parseFloat(amount) <= 0 || isGeneratingQR}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isGeneratingQR ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating QR...
                  </div>
                ) : selectedMethod === 'qr' ? (
                  'Generate QR Code'
                ) : (
                  'Proceed to Payment'
                )}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

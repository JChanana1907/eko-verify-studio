
import React, { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Building2, Car, Factory, FileCheck, Shield, Upload, GraduationCap, Award, CreditCard, Heart, Truck, Users, Search } from "lucide-react";
import { toast } from "sonner";
import DragDropService from "@/components/common/DragDropService";
import EmploymentVerification from "./EmploymentVerification";
import GSTINVerification from "./GSTINVerification";
import VehicleVerification from "./VehicleVerification";
import FinancialVerification from "./FinancialVerification";
import HealthcareVerification from "./HealthcareVerification";
import EducationVerification from "./EducationVerification";

interface UnifiedVerificationProps {
  apiKey: string;
  onResult: (result: any) => void;
}

const UnifiedVerification: React.FC<UnifiedVerificationProps> = ({ apiKey, onResult }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const categories = [
    { id: "all", label: "All Services", icon: Shield },
    { id: "employment", label: "Employment", icon: Building2 },
    { id: "gstin", label: "GSTIN", icon: FileCheck },
    { id: "vehicle", label: "Vehicle", icon: Car },
    { id: "financial", label: "Financial", icon: CreditCard },
    { id: "healthcare", label: "Healthcare", icon: Heart },
    { id: "education", label: "Education", icon: GraduationCap }
  ];

  const allServices = [
    // Employment Services
    { id: 'pan', name: 'PAN Verification', icon: FileCheck, color: 'bg-blue-500', category: 'employment', description: 'Verify PAN card details', fields: ['pan_number', 'holder_name', 'dob'] },
    { id: 'aadhaar', name: 'Aadhaar Verification', icon: Users, color: 'bg-green-500', category: 'employment', description: 'Verify Aadhaar card details', fields: ['aadhaar_number', 'holder_name'] },
    { id: 'bank-account', name: 'Bank Account Verification', icon: CreditCard, color: 'bg-purple-500', category: 'employment', description: 'Verify bank account details', fields: ['account_number', 'ifsc_code', 'holder_name'] },
    
    // GSTIN Services
    { id: 'gstin', name: 'GSTIN Verification', icon: Factory, color: 'bg-green-600', category: 'gstin', description: 'Verify GSTIN registration', fields: ['gstin_number', 'business_name'] },
    
    // Vehicle Services
    { id: 'vehicle-rc', name: 'Vehicle RC Verification', icon: Car, color: 'bg-orange-500', category: 'vehicle', description: 'Verify vehicle registration certificate', fields: ['registration_number', 'owner_name'] },
    { id: 'driving-licence', name: 'Driving Licence Verification', icon: Truck, color: 'bg-red-500', category: 'vehicle', description: 'Verify driving licence details', fields: ['licence_number', 'holder_name', 'date_of_birth'] },
    
    // Financial Services
    { id: 'credit-score', name: 'Credit Score Check', icon: Shield, color: 'bg-indigo-500', category: 'financial', description: 'Check credit score and history', fields: ['pan_number', 'holder_name', 'date_of_birth'] },
    { id: 'loan-eligibility', name: 'Loan Eligibility Check', icon: CreditCard, color: 'bg-teal-500', category: 'financial', description: 'Check loan eligibility', fields: ['pan_number', 'annual_income', 'employment_type'] },
    
    // Healthcare Services
    { id: 'medical-license', name: 'Medical License Verification', icon: Heart, color: 'bg-pink-500', category: 'healthcare', description: 'Verify medical practitioner license', fields: ['license_number', 'doctor_name', 'specialization'] },
    { id: 'insurance-policy', name: 'Insurance Policy Verification', icon: Shield, color: 'bg-cyan-500', category: 'healthcare', description: 'Verify insurance policy details', fields: ['policy_number', 'holder_name', 'provider_name'] },
    
    // Education Services
    { id: 'degree-verification', name: 'Degree Verification', icon: GraduationCap, color: 'bg-indigo-500', category: 'education', description: 'Verify educational degrees', fields: ['degree_number', 'university_name', 'student_name'] },
    { id: 'professional-certification', name: 'Professional Certification', icon: Award, color: 'bg-purple-500', category: 'education', description: 'Verify professional certifications', fields: ['certificate_number', 'certifying_body', 'certificate_holder'] }
  ];

  const filteredServices = useMemo(() => {
    let services = selectedCategory === "all" 
      ? allServices 
      : allServices.filter(service => service.category === selectedCategory);

    if (searchQuery.trim()) {
      services = services.filter(service => 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return services;
  }, [selectedCategory, searchQuery]);

  const handleServiceSelect = (serviceId: string) => {
    if (!selectedServices.includes(serviceId)) {
      setSelectedServices([...selectedServices, serviceId]);
      toast.success("Service added to verification queue");
    }
  };

  const getCategoryComponent = (categoryId: string) => {
    switch (categoryId) {
      case 'employment':
        return <EmploymentVerification apiKey={apiKey} onResult={onResult} />;
      case 'gstin':
        return <GSTINVerification apiKey={apiKey} onResult={onResult} />;
      case 'vehicle':
        return <VehicleVerification apiKey={apiKey} onResult={onResult} />;
      case 'financial':
        return <FinancialVerification apiKey={apiKey} onResult={onResult} />;
      case 'healthcare':
        return <HealthcareVerification apiKey={apiKey} onResult={onResult} />;
      case 'education':
        return <EducationVerification apiKey={apiKey} onResult={onResult} />;
      default:
        return null;
    }
  };

  // If "all" category is selected, show the unified service selector
  if (selectedCategory === "all") {
    return (
      <div className="space-y-6">
        {/* Category Filter */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Verification Categories</h3>
          <ToggleGroup type="single" value={selectedCategory} onValueChange={setSelectedCategory}>
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <ToggleGroupItem key={category.id} value={category.id} className="flex items-center space-x-2">
                  <IconComponent className="h-4 w-4" />
                  <span>{category.label}</span>
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </Card>

        {/* Search Input */}
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search APIs by name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            {searchQuery && (
              <Button size="sm" variant="ghost" onClick={() => setSearchQuery("")}>
                Clear
              </Button>
            )}
          </div>
        </Card>

        {/* All Services Grid */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              All Available APIs ({filteredServices.length})
            </h3>
            {selectedServices.length > 0 && (
              <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                {selectedServices.length} services selected
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <DragDropService
                key={service.id}
                service={service}
                onDrop={handleServiceSelect}
                isSelected={selectedServices.includes(service.id)}
              />
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No services found matching your search.</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // For other categories, show the specific verification component
  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Verification Categories</h3>
        <ToggleGroup type="single" value={selectedCategory} onValueChange={setSelectedCategory}>
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <ToggleGroupItem key={category.id} value={category.id} className="flex items-center space-x-2">
                <IconComponent className="h-4 w-4" />
                <span>{category.label}</span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </Card>

      {/* Verification Component */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {categories.find(c => c.id === selectedCategory)?.label} Verification
        </h3>
        {getCategoryComponent(selectedCategory)}
      </Card>
    </div>
  );
};

export default UnifiedVerification;

import React, { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Building2, Car, Factory, FileCheck, Shield, Upload, GraduationCap, Award, CreditCard, Heart, Truck, Users, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import DragDropService from "@/components/common/DragDropService";
import EmploymentVerification from "./EmploymentVerification";
import GSTINVerification from "./GSTINVerification";
import VehicleVerification from "./VehicleVerification";
import FinancialVerification from "./FinancialVerification";
import HealthcareVerification from "./HealthcareVerification";
import EducationVerification from "./EducationVerification";
import { EkoApiService } from "@/services/ekoApiService";

interface UnifiedVerificationProps {
  apiKey: string;
  onResult: (result: any) => void;
}

const UnifiedVerification: React.FC<UnifiedVerificationProps> = ({ apiKey, onResult }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

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
    // Employment Services - Updated with proper API fields
    { 
      id: 'pan', 
      name: 'PAN Verification', 
      icon: FileCheck, 
      color: 'bg-blue-500', 
      category: 'employment', 
      description: 'Verify PAN card details', 
      fields: ['pan_number', 'name', 'dob', 'initiator_id', 'user_code'] 
    },
    { 
      id: 'aadhaar', 
      name: 'Aadhaar Verification', 
      icon: Users, 
      color: 'bg-green-500', 
      category: 'employment', 
      description: 'Verify Aadhaar card details', 
      fields: ['aadhaar_number', 'name', 'initiator_id', 'user_code'] 
    },
    { 
      id: 'bank-account', 
      name: 'Bank Account Verification', 
      icon: CreditCard, 
      color: 'bg-purple-500', 
      category: 'employment', 
      description: 'Verify bank account details', 
      fields: ['account_number', 'ifsc_code', 'name', 'initiator_id', 'user_code'] 
    },
    { 
      id: 'mobile-otp', 
      name: 'Mobile OTP Verification', 
      icon: Users, 
      color: 'bg-orange-500', 
      category: 'employment', 
      description: 'Send OTP to mobile number', 
      fields: ['mobile_number', 'initiator_id', 'user_code'] 
    },
    { 
      id: 'digilocker', 
      name: 'Digilocker Access', 
      icon: FileCheck, 
      color: 'bg-indigo-500', 
      category: 'employment', 
      description: 'Access Digilocker documents', 
      fields: ['digilocker_id', 'initiator_id', 'user_code'] 
    },
    { 
      id: 'voter-id', 
      name: 'Voter ID Verification', 
      icon: Users, 
      color: 'bg-red-500', 
      category: 'employment', 
      description: 'Verify voter ID details', 
      fields: ['voter_id', 'name', 'initiator_id', 'user_code'] 
    },
    { 
      id: 'passport', 
      name: 'Passport Verification', 
      icon: FileCheck, 
      color: 'bg-teal-500', 
      category: 'employment', 
      description: 'Verify passport details', 
      fields: ['passport_number', 'name', 'initiator_id', 'user_code'] 
    },
    { 
      id: 'employee-details', 
      name: 'Employee Verification', 
      icon: Building2, 
      color: 'bg-cyan-500', 
      category: 'employment', 
      description: 'Verify employee details', 
      fields: ['employee_id', 'company_name', 'initiator_id', 'user_code'] 
    },
    { 
      id: 'name-match', 
      name: 'Name Matching', 
      icon: Users, 
      color: 'bg-pink-500', 
      category: 'employment', 
      description: 'Match names across documents', 
      fields: ['name1', 'name2', 'initiator_id', 'user_code'] 
    },
    
    // GSTIN Services - Updated with proper API fields
    { 
      id: 'gstin', 
      name: 'GSTIN Verification', 
      icon: Factory, 
      color: 'bg-green-600', 
      category: 'gstin', 
      description: 'Verify GSTIN registration', 
      fields: ['gstin_number', 'business_name', 'initiator_id', 'user_code'] 
    },
    
    // Vehicle Services - Updated with proper API fields
    { 
      id: 'vehicle-rc', 
      name: 'Vehicle RC Verification', 
      icon: Car, 
      color: 'bg-orange-500', 
      category: 'vehicle', 
      description: 'Verify vehicle registration certificate', 
      fields: ['registration_number', 'owner_name', 'initiator_id', 'user_code'] 
    },
    { 
      id: 'driving-licence', 
      name: 'Driving Licence Verification', 
      icon: Truck, 
      color: 'bg-red-500', 
      category: 'vehicle', 
      description: 'Verify driving licence details', 
      fields: ['licence_number', 'holder_name', 'date_of_birth', 'initiator_id', 'user_code'] 
    },
    
    // Financial Services - Updated with proper API fields
    { 
      id: 'credit-score', 
      name: 'Credit Score Check', 
      icon: Shield, 
      color: 'bg-indigo-500', 
      category: 'financial', 
      description: 'Check credit score and history', 
      fields: ['pan_number', 'mobile_number', 'initiator_id', 'user_code'] 
    },
    { 
      id: 'bank-statement', 
      name: 'Bank Statement Analysis', 
      icon: CreditCard, 
      color: 'bg-purple-500', 
      category: 'financial', 
      description: 'Analyze bank statement', 
      fields: ['account_number', 'bank_name', 'statement_period', 'initiator_id', 'user_code'] 
    },
    { 
      id: 'income-verification', 
      name: 'Income Verification', 
      icon: CreditCard, 
      color: 'bg-green-500', 
      category: 'financial', 
      description: 'Verify income details', 
      fields: ['pan_number', 'employer_name', 'salary_account', 'initiator_id', 'user_code'] 
    },
    { 
      id: 'loan-eligibility', 
      name: 'Loan Eligibility Check', 
      icon: CreditCard, 
      color: 'bg-teal-500', 
      category: 'financial', 
      description: 'Check loan eligibility', 
      fields: ['pan_number', 'monthly_income', 'loan_amount', 'initiator_id', 'user_code'] 
    },
    
    // Healthcare Services - Updated with proper API fields
    { 
      id: 'medical-license', 
      name: 'Medical License Verification', 
      icon: Heart, 
      color: 'bg-pink-500', 
      category: 'healthcare', 
      description: 'Verify medical practitioner license', 
      fields: ['license_number', 'doctor_name', 'specialization', 'initiator_id', 'user_code'] 
    },
    { 
      id: 'insurance-policy', 
      name: 'Insurance Policy Verification', 
      icon: Shield, 
      color: 'bg-cyan-500', 
      category: 'healthcare', 
      description: 'Verify insurance policy details', 
      fields: ['policy_number', 'insurer_name', 'policy_holder', 'initiator_id', 'user_code'] 
    },
    { 
      id: 'pharmacy-license', 
      name: 'Pharmacy License Verification', 
      icon: Heart, 
      color: 'bg-red-500', 
      category: 'healthcare', 
      description: 'Verify pharmacy license', 
      fields: ['license_number', 'pharmacy_name', 'permit_type', 'initiator_id', 'user_code'] 
    },
    
    // Education Services - Updated with proper API fields
    { 
      id: 'degree-verification', 
      name: 'Degree Verification', 
      icon: GraduationCap, 
      color: 'bg-indigo-500', 
      category: 'education', 
      description: 'Verify educational degrees', 
      fields: ['degree_number', 'university_name', 'student_name', 'graduation_year', 'initiator_id', 'user_code'] 
    },
    { 
      id: 'professional-certification', 
      name: 'Professional Certification', 
      icon: Award, 
      color: 'bg-purple-500', 
      category: 'education', 
      description: 'Verify professional certifications', 
      fields: ['certificate_number', 'certifying_body', 'certificate_holder', 'initiator_id', 'user_code'] 
    },
    { 
      id: 'regulatory-compliance', 
      name: 'Regulatory Compliance Check', 
      icon: Shield, 
      color: 'bg-orange-500', 
      category: 'education', 
      description: 'Check regulatory compliance', 
      fields: ['license_number', 'regulatory_body', 'license_holder', 'license_type', 'initiator_id', 'user_code'] 
    }
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

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(id => id !== serviceId));
    setFormData(prev => {
      const copy = { ...prev };
      delete copy[serviceId];
      return copy;
    });
    toast.success("Service removed from verification queue");
  };

  const handleInputChange = (serviceId: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [serviceId]: { ...(prev[serviceId] || {}), [field]: value }
    }));
  };

  const handleDateChange = (serviceId: string, field: string, date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      handleInputChange(serviceId, field, formattedDate);
    }
  };

  const performVerification = async () => {
    if (!apiKey) {
      toast.error("Please configure your API key first");
      return;
    }
    if (selectedServices.length === 0) {
      toast.error("Please select at least one verification service");
      return;
    }

    setIsLoading(true);
    const ekoService = new EkoApiService(apiKey);

    try {
      for (const serviceId of selectedServices) {
        const service = allServices.find(s => s.id === serviceId);
        const serviceData = formData[serviceId] || {};

        // Set default values for required fields
        const defaultData = {
          initiator_id: 7417247999,
          user_code: 32515001,
          ...serviceData
        };

        let apiResult;
        switch (serviceId) {
          case 'bank-account':
            apiResult = await ekoService.verifyBankAccount(
              defaultData.account_number, defaultData.ifsc_code, defaultData.name
            );
            break;
          case 'pan':
            apiResult = await ekoService.verifyPAN(
              defaultData.pan_number, defaultData.name, defaultData.dob
            );
            break;
          case 'aadhaar':
            apiResult = await ekoService.verifyAadhaar(
              defaultData.aadhaar_number, defaultData.name
            );
            break;
          case 'mobile-otp':
            apiResult = await ekoService.sendMobileOTP(defaultData.mobile_number);
            break;
          case 'digilocker':
            apiResult = await ekoService.accessDigilocker(defaultData.digilocker_id);
            break;
          case 'voter-id':
            apiResult = await ekoService.verifyVoterID(
              defaultData.voter_id, defaultData.name
            );
            break;
          case 'passport':
            apiResult = await ekoService.verifyPassport(
              defaultData.passport_number, defaultData.name
            );
            break;
          case 'employee-details':
            apiResult = await ekoService.verifyEmployeeDetails(
              defaultData.employee_id, defaultData.company_name
            );
            break;
          case 'name-match':
            apiResult = await ekoService.nameMatch(
              defaultData.name1, defaultData.name2
            );
            break;
          case 'gstin':
            apiResult = await ekoService.verifyGSTIN(
              defaultData.gstin_number, defaultData.business_name
            );
            break;
          case 'vehicle-rc':
            apiResult = await ekoService.verifyVehicleRC(
              defaultData.registration_number, defaultData.owner_name
            );
            break;
          case 'driving-licence':
            apiResult = await ekoService.verifyDrivingLicence(
              defaultData.licence_number, defaultData.holder_name, defaultData.date_of_birth
            );
            break;
          case 'credit-score':
            apiResult = await ekoService.getCreditScore(
              defaultData.pan_number, defaultData.mobile_number
            );
            break;
          case 'bank-statement':
            apiResult = await ekoService.analyzeBankStatement(
              defaultData.account_number, defaultData.bank_name, defaultData.statement_period
            );
            break;
          case 'income-verification':
            apiResult = await ekoService.verifyIncome(
              defaultData.pan_number, defaultData.employer_name, defaultData.salary_account
            );
            break;
          case 'loan-eligibility':
            apiResult = await ekoService.checkLoanEligibility(
              defaultData.pan_number, defaultData.monthly_income, defaultData.loan_amount
            );
            break;
          case 'medical-license':
            apiResult = await ekoService.verifyMedicalLicense(
              defaultData.license_number, defaultData.doctor_name, defaultData.specialization
            );
            break;
          case 'insurance-policy':
            apiResult = await ekoService.verifyInsurancePolicy(
              defaultData.policy_number, defaultData.insurer_name, defaultData.policy_holder
            );
            break;
          case 'pharmacy-license':
            apiResult = await ekoService.verifyPharmacyLicense(
              defaultData.license_number, defaultData.pharmacy_name, defaultData.permit_type
            );
            break;
          case 'degree-verification':
            apiResult = await ekoService.verifyDegree(
              defaultData.degree_number, defaultData.university_name, defaultData.student_name, defaultData.graduation_year
            );
            break;
          case 'professional-certification':
            apiResult = await ekoService.verifyProfessionalCertification(
              defaultData.certificate_number, defaultData.certifying_body, defaultData.certificate_holder
            );
            break;
          case 'regulatory-compliance':
            apiResult = await ekoService.checkRegulatoryCompliance(
              defaultData.license_number, defaultData.regulatory_body, defaultData.license_holder, defaultData.license_type
            );
            break;
          default:
            continue;
        }

        if (!apiResult) continue;

        const raw = apiResult.data?.data ?? apiResult.data;
        let displayResponse: { verified?: boolean; details?: any };

        switch (serviceId) {
          case 'pan':
            const verified = raw?.pan_status === 'E';
            displayResponse = { verified, details: raw };
            break;
          default:
            displayResponse = { verified: undefined, details: raw };
        }

        onResult({
          id: Date.now(),
          timestamp: new Date(),
          service: service?.name ?? serviceId,
          category: 'Unified Verification',
          status: apiResult.success ? 'SUCCESS' : 'FAILED',
          data: defaultData,
          response: displayResponse,
          error: apiResult.error
        });

        if (apiResult.success) {
          toast.success(`${service?.name} verification succeeded`);
        } else {
          toast.error(`${service?.name} verification failed: ${apiResult.error}`);
        }
      }

      setSelectedServices([]);
      setFormData({});
    } catch (err) {
      console.error('Verification error:', err);
      toast.error("Verification failed. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
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

  const renderInputField = (serviceId: string, field: string) => {
    // Hide auto-filled fields from UI
    if (field === 'initiator_id' || field === 'user_code') {
      return null;
    }

    const isDateField = field.includes('date') || field === 'dob' || field === 'date_of_birth';
    const fieldValue = formData[serviceId]?.[field] || '';

    if (isDateField) {
      return (
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="YYYY-MM-DD or use calendar below"
            value={fieldValue}
            onChange={(e) => handleInputChange(serviceId, field, e.target.value)}
            pattern="\d{4}-\d{2}-\d{2}"
            className="w-full"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !fieldValue && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fieldValue ? format(new Date(fieldValue), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fieldValue ? new Date(fieldValue) : undefined}
                onSelect={(date) => handleDateChange(serviceId, field, date)}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    return (
      <Input
        placeholder={`Enter ${field.replace(/_/g, ' ')}`}
        value={fieldValue}
        onChange={(e) => handleInputChange(serviceId, field, e.target.value)}
        className="w-full"
      />
    );
  };

  // If "all" category is selected, show all services in a unified view with consistent styling
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

        {/* All Services Grid - Consistent with other tabs */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900">
              Available Verification Services ({filteredServices.length})
            </h3>
            {selectedServices.length > 0 && (
              <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                {selectedServices.length} services selected
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredServices.map((service) => (
              <Card 
                key={service.id} 
                className={`p-4 cursor-pointer transition-all hover:shadow-md border ${
                  selectedServices.includes(service.id) 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => handleServiceSelect(service.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${service.color} flex-shrink-0`}>
                    <service.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 mb-1 text-sm">{service.name}</h4>
                    <p className="text-xs text-slate-600 mb-2 line-clamp-2">{service.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {service.category}
                    </Badge>
                  </div>
                  {selectedServices.includes(service.id) && (
                    <div className="text-blue-600 flex-shrink-0">
                      <Shield className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No services found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </Card>

        {/* Configuration panel for selected services - Consistent styling */}
        {selectedServices.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Configure Selected Services</h3>
              <Badge variant="secondary" className="text-sm">{selectedServices.length} selected</Badge>
            </div>

            <div className="space-y-6">
              {selectedServices.map((serviceId, idx) => {
                const service = allServices.find(s => s.id === serviceId);
                if (!service) return null;

                const Icon = service.icon;
                return (
                  <Card key={serviceId} className="p-6 border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${service.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{service.name}</h4>
                          <p className="text-sm text-slate-600">{service.description}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => removeService(serviceId)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {service.fields.filter(field => field !== 'initiator_id' && field !== 'user_code').map(field => (
                        <div key={field} className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700 capitalize">
                            {field.replace(/_/g, ' ')}
                          </Label>
                          {renderInputField(serviceId, field)}
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
              <Button
                onClick={performVerification}
                disabled={isLoading || !apiKey}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Verify ${selectedServices.length} Service${selectedServices.length > 1 ? 's' : ''}`
                )}
              </Button>
            </div>
          </Card>
        )}
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
      {getCategoryComponent(selectedCategory)}
    </div>
  );
};

export default UnifiedVerification;


import React, { useState, useMemo } from 'react';
import { toast } from "sonner";
import { format, isValid } from "date-fns";
import { EkoApiService } from "@/services/ekoApiService";
import { allServices } from './constants/verificationServices';
import CategoryFilter from './components/CategoryFilter';
import ServiceGrid from './components/ServiceGrid';
import ConsolidatedForm from './components/ConsolidatedForm';
import { performVerificationService, processVerificationResponse } from './utils/verificationUtils';
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

// Field mapping for deduplication
const FIELD_MAPPINGS: Record<string, string[]> = {
  'full_name': ['name', 'holder_name', 'owner_name', 'doctor_name', 'student_name', 'certificate_holder', 'license_holder', 'policy_holder'],
  'date_of_birth': ['dob', 'date_of_birth'],
  'phone_number': ['mobile_number', 'phone_number'],
  'identification_number': ['pan_number', 'aadhaar_number', 'voter_id', 'passport_number', 'license_number', 'registration_number', 'gstin_number', 'policy_number', 'certificate_number', 'degree_number'],
  'organization_name': ['company_name', 'business_name', 'university_name', 'certifying_body', 'regulatory_body', 'employer_name', 'bank_name', 'insurer_name', 'pharmacy_name'],
  'account_details': ['account_number', 'ifsc_code', 'salary_account'],
  'specialization_type': ['specialization', 'permit_type', 'license_type']
};

const getCommonFieldName = (field: string): string => {
  for (const [commonField, variants] of Object.entries(FIELD_MAPPINGS)) {
    if (variants.includes(field)) {
      return commonField;
    }
  }
  return field;
};

const getFieldLabel = (field: string): string => {
  const labelMappings: Record<string, string> = {
    'full_name': 'Full Name',
    'date_of_birth': 'Date of Birth',
    'phone_number': 'Phone Number',
    'identification_number': 'ID/Registration Number',
    'organization_name': 'Organization/Institution Name',
    'account_details': 'Account Details',
    'specialization_type': 'Type/Specialization'
  };
  
  return labelMappings[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const UnifiedVerification: React.FC<UnifiedVerificationProps> = ({ apiKey, onResult }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

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

  // Enhanced deduplication logic for form fields
  const consolidatedFields = useMemo(() => {
    if (selectedServices.length === 0) return [];

    const fieldMap = new Map<string, { 
      field: string; 
      label: string; 
      requiredBy: string[];
      isDateField: boolean;
      originalFields: string[];
    }>();

    selectedServices.forEach(serviceId => {
      const service = allServices.find(s => s.id === serviceId);
      if (!service) return;

      service.fields.forEach(field => {
        // Skip auto-filled fields
        if (field === 'initiator_id' || field === 'user_code') return;

        const isDateField = field.includes('date') || field === 'dob' || field === 'date_of_birth';
        const commonField = getCommonFieldName(field);
        const label = getFieldLabel(commonField);

        if (fieldMap.has(commonField)) {
          const existing = fieldMap.get(commonField)!;
          existing.requiredBy.push(service.name);
          if (!existing.originalFields.includes(field)) {
            existing.originalFields.push(field);
          }
        } else {
          fieldMap.set(commonField, {
            field: commonField,
            label,
            requiredBy: [service.name],
            isDateField,
            originalFields: [field]
          });
        }
      });
    });

    return Array.from(fieldMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [selectedServices]);

  const handleServiceSelect = (serviceId: string) => {
    if (!selectedServices.includes(serviceId)) {
      setSelectedServices([...selectedServices, serviceId]);
      toast.success("Service added to verification queue");
    }
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(id => id !== serviceId));
    toast.success("Service removed from verification queue");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (field: string, date: Date | undefined) => {
    if (date && isValid(date)) {
      const formattedDate = format(date, "yyyy-MM-dd");
      handleInputChange(field, formattedDate);
    }
  };

  const handleDateInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const performVerification = async () => {
    console.log('Verify button clicked - starting verification process');
    
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
        
        // Map consolidated form data to service-specific data
        const serviceData: any = {
          initiator_id: 7417247999,
          user_code: 32515001
        };

        // Map common fields back to service-specific field names
        service?.fields.forEach(field => {
          if (field !== 'initiator_id' && field !== 'user_code') {
            const commonField = getCommonFieldName(field);
            serviceData[field] = formData[commonField] || formData[field] || '';
          }
        });

        console.log(`Service data for ${service?.name}:`, serviceData);

        const apiResult = await performVerificationService(serviceId, serviceData, ekoService);
        if (!apiResult) continue;

        const displayResponse = processVerificationResponse(serviceId, apiResult);

        onResult({
          id: Date.now(),
          timestamp: new Date(),
          service: service?.name ?? serviceId,
          category: 'Unified Verification',
          status: apiResult.success ? 'SUCCESS' : 'FAILED',
          data: serviceData,
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

  // If "all" category is selected, show all services in a unified view
  if (selectedCategory === "all") {
    return (
      <div className="space-y-6">
        <CategoryFilter 
          selectedCategory={selectedCategory} 
          onCategoryChange={setSelectedCategory} 
        />
        
        <ServiceGrid
          services={filteredServices}
          selectedServices={selectedServices}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onServiceSelect={handleServiceSelect}
        />

        <ConsolidatedForm
          selectedServices={selectedServices}
          formData={formData}
          consolidatedFields={consolidatedFields}
          isLoading={isLoading}
          onRemoveService={removeService}
          onInputChange={handleInputChange}
          onDateChange={handleDateChange}
          onDateInputChange={handleDateInputChange}
          onVerify={performVerification}
        />
      </div>
    );
  }

  // For other categories, show the specific verification component
  return (
    <div className="space-y-6">
      <CategoryFilter 
        selectedCategory={selectedCategory} 
        onCategoryChange={setSelectedCategory} 
      />
      {getCategoryComponent(selectedCategory)}
    </div>
  );
};

export default UnifiedVerification;

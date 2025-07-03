
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

  // Deduplication logic for form fields
  const consolidatedFields = useMemo(() => {
    if (selectedServices.length === 0) return [];

    const fieldMap = new Map<string, { 
      field: string; 
      label: string; 
      requiredBy: string[];
      isDateField: boolean;
    }>();

    selectedServices.forEach(serviceId => {
      const service = allServices.find(s => s.id === serviceId);
      if (!service) return;

      service.fields.forEach(field => {
        // Skip auto-filled fields
        if (field === 'initiator_id' || field === 'user_code') return;

        const isDateField = field.includes('date') || field === 'dob' || field === 'date_of_birth';
        const label = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        if (fieldMap.has(field)) {
          const existing = fieldMap.get(field)!;
          existing.requiredBy.push(service.name);
        } else {
          fieldMap.set(field, {
            field,
            label,
            requiredBy: [service.name],
            isDateField
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

        // Map form fields to service-specific field names
        service?.fields.forEach(field => {
          if (field !== 'initiator_id' && field !== 'user_code') {
            serviceData[field] = formData[field] || '';
          }
        });

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

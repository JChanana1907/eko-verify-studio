
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { allServices } from '../constants/verificationServices';

interface FieldInfo {
  field: string;
  label: string;
  requiredBy: string[];
  isDateField: boolean;
}

interface ConsolidatedFormProps {
  selectedServices: string[];
  formData: Record<string, any>;
  consolidatedFields: FieldInfo[];
  isLoading: boolean;
  onRemoveService: (serviceId: string) => void;
  onInputChange: (field: string, value: string) => void;
  onDateChange: (field: string, date: Date | undefined) => void;
  onDateInputChange: (field: string, value: string) => void;
  onVerify: () => void;
}

const ConsolidatedForm: React.FC<ConsolidatedFormProps> = ({
  selectedServices,
  formData,
  consolidatedFields,
  isLoading,
  onRemoveService,
  onInputChange,
  onDateChange,
  onDateInputChange,
  onVerify
}) => {
  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    
    try {
      // Try parsing YYYY-MM-DD format
      const parsed = parse(dateString, 'yyyy-MM-dd', new Date());
      if (isValid(parsed)) {
        return parsed;
      }
      
      // Try parsing DD-MM-YYYY format
      const parsedDDMM = parse(dateString, 'dd-MM-yyyy', new Date());
      if (isValid(parsedDDMM)) {
        return parsedDDMM;
      }
      
      // Try native Date parsing as fallback
      const nativeDate = new Date(dateString);
      if (isValid(nativeDate)) {
        return nativeDate;
      }
    } catch (error) {
      console.log('Date parsing error:', error);
    }
    
    return undefined;
  };

  const renderInputField = (fieldInfo: FieldInfo) => {
    const { field, label, requiredBy, isDateField } = fieldInfo;
    const fieldValue = formData[field] || '';

    if (isDateField) {
      const parsedDate = parseDate(fieldValue);
      
      return (
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="YYYY-MM-DD"
            value={fieldValue}
            onChange={(e) => onDateInputChange(field, e.target.value)}
            pattern="\d{4}-\d{2}-\d{2}"
            className="w-full"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !parsedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {parsedDate ? format(parsedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parsedDate}
                onSelect={(date) => onDateChange(field, date)}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
                className="pointer-events-auto"
                captionLayout="dropdown-buttons"
                fromYear={1900}
                toYear={new Date().getFullYear()}
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    return (
      <Input
        placeholder={`Enter ${label.toLowerCase()}`}
        value={fieldValue}
        onChange={(e) => onInputChange(field, e.target.value)}
        className="w-full"
      />
    );
  };

  if (selectedServices.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Consolidated Verification Form</h3>
          <p className="text-sm text-slate-600 mt-1">
            Fill in the required information for all selected services
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">{selectedServices.length} services selected</Badge>
      </div>

      {/* Selected Services Summary */}
      <div className="mb-6">
        <h4 className="font-medium text-slate-900 mb-3">Selected Services:</h4>
        <div className="flex flex-wrap gap-2">
          {selectedServices.map(serviceId => {
            const service = allServices.find(s => s.id === serviceId);
            if (!service) return null;
            return (
              <Badge key={serviceId} variant="outline" className="flex items-center gap-1">
                {service.name}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-4 w-4 p-0 hover:bg-slate-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveService(serviceId);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Consolidated Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {consolidatedFields.map(fieldInfo => (
          <div key={fieldInfo.field} className="space-y-2">
            <Label className="text-sm font-medium text-slate-900">
              {fieldInfo.label}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <div className="text-xs text-slate-500 mb-2">
              Required by: {fieldInfo.requiredBy.join(', ')}
            </div>
            {renderInputField(fieldInfo)}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
        <Button
          onClick={onVerify}
          disabled={isLoading}
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
  );
};

export default ConsolidatedForm;

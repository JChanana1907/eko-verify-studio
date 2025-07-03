
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Search } from "lucide-react";
import { VerificationService } from '../constants/verificationServices';

interface ServiceGridProps {
  services: VerificationService[];
  selectedServices: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onServiceSelect: (serviceId: string) => void;
}

const ServiceGrid: React.FC<ServiceGridProps> = ({
  services,
  selectedServices,
  searchQuery,
  onSearchChange,
  onServiceSelect
}) => {
  return (
    <>
      {/* Search Input */}
      <Card className="p-6">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search APIs by name, description, or category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1"
          />
          {searchQuery && (
            <Button size="sm" variant="ghost" onClick={() => onSearchChange("")}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Services Grid */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-900">
            Available Verification Services ({services.length})
          </h3>
          {selectedServices.length > 0 && (
            <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
              {selectedServices.length} services selected
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {services.map((service) => (
            <Card 
              key={service.id} 
              className={`p-4 cursor-pointer transition-all hover:shadow-md border ${
                selectedServices.includes(service.id) 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => onServiceSelect(service.id)}
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

        {services.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No services found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        )}
      </Card>
    </>
  );
};

export default ServiceGrid;


import React from 'react';
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Building2, Car, Factory, FileCheck, Shield, GraduationCap, Award, CreditCard, Heart } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: "all", label: "All Services", icon: Shield },
  { id: "employment", label: "Employment", icon: Building2 },
  { id: "gstin", label: "GSTIN", icon: FileCheck },
  { id: "vehicle", label: "Vehicle", icon: Car },
  { id: "financial", label: "Financial", icon: CreditCard },
  { id: "healthcare", label: "Healthcare", icon: Heart },
  { id: "education", label: "Education", icon: GraduationCap }
];

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onCategoryChange }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Verification Categories</h3>
      <ToggleGroup type="single" value={selectedCategory} onValueChange={onCategoryChange}>
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
  );
};

export default CategoryFilter;

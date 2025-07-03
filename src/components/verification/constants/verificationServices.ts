
import { Building2, Car, Factory, FileCheck, Shield, Upload, GraduationCap, Award, CreditCard, Heart, Truck, Users } from "lucide-react";

export interface VerificationService {
  id: string;
  name: string;
  icon: any;
  color: string;
  category: string;
  description: string;
  fields: string[];
}

export const allServices: VerificationService[] = [
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

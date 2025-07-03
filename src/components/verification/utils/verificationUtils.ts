
import { EkoApiService } from "@/services/ekoApiService";
import { allServices } from '../constants/verificationServices';

export const performVerificationService = async (
  serviceId: string,
  serviceData: any,
  ekoService: EkoApiService
) => {
  console.log(`Processing service: ${allServices.find(s => s.id === serviceId)?.name}`);
  console.log(`Service data for ${serviceId}:`, serviceData);

  let apiResult;
  switch (serviceId) {
    case 'bank-account':
      apiResult = await ekoService.verifyBankAccount(
        serviceData.account_number, serviceData.ifsc_code, serviceData.name
      );
      break;
    case 'pan':
      apiResult = await ekoService.verifyPAN(
        serviceData.pan_number, serviceData.name, serviceData.dob
      );
      break;
    case 'aadhaar':
      apiResult = await ekoService.verifyAadhaar(
        serviceData.aadhaar_number, serviceData.name
      );
      break;
    case 'mobile-otp':
      apiResult = await ekoService.sendMobileOTP(serviceData.mobile_number);
      break;
    case 'digilocker':
      apiResult = await ekoService.accessDigilocker(serviceData.digilocker_id);
      break;
    case 'voter-id':
      apiResult = await ekoService.verifyVoterID(
        serviceData.voter_id, serviceData.name
      );
      break;
    case 'passport':
      apiResult = await ekoService.verifyPassport(
        serviceData.passport_number, serviceData.name
      );
      break;
    case 'employee-details':
      apiResult = await ekoService.verifyEmployeeDetails(
        serviceData.employee_id, serviceData.company_name
      );
      break;
    case 'name-match':
      apiResult = await ekoService.nameMatch(
        serviceData.name1, serviceData.name2
      );
      break;
    case 'gstin':
      apiResult = await ekoService.verifyGSTIN(
        serviceData.gstin_number, serviceData.business_name
      );
      break;
    case 'vehicle-rc':
      apiResult = await ekoService.verifyVehicleRC(
        serviceData.registration_number, serviceData.owner_name
      );
      break;
    case 'driving-licence':
      apiResult = await ekoService.verifyDrivingLicence(
        serviceData.licence_number, serviceData.holder_name, serviceData.date_of_birth
      );
      break;
    case 'credit-score':
      apiResult = await ekoService.getCreditScore(
        serviceData.pan_number, serviceData.mobile_number
      );
      break;
    case 'bank-statement':
      apiResult = await ekoService.analyzeBankStatement(
        serviceData.account_number, serviceData.bank_name, serviceData.statement_period
      );
      break;
    case 'income-verification':
      apiResult = await ekoService.verifyIncome(
        serviceData.pan_number, serviceData.employer_name, serviceData.salary_account
      );
      break;
    case 'loan-eligibility':
      apiResult = await ekoService.checkLoanEligibility(
        serviceData.pan_number, serviceData.monthly_income, serviceData.loan_amount
      );
      break;
    case 'medical-license':
      apiResult = await ekoService.verifyMedicalLicense(
        serviceData.license_number, serviceData.doctor_name, serviceData.specialization
      );
      break;
    case 'insurance-policy':
      apiResult = await ekoService.verifyInsurancePolicy(
        serviceData.policy_number, serviceData.insurer_name, serviceData.policy_holder
      );
      break;
    case 'pharmacy-license':
      apiResult = await ekoService.verifyPharmacyLicense(
        serviceData.license_number, serviceData.pharmacy_name, serviceData.permit_type
      );
      break;
    case 'degree-verification':
      apiResult = await ekoService.verifyDegree(
        serviceData.degree_number, serviceData.university_name, serviceData.student_name, serviceData.graduation_year
      );
      break;
    case 'professional-certification':
      apiResult = await ekoService.verifyProfessionalCertification(
        serviceData.certificate_number, serviceData.certifying_body, serviceData.certificate_holder
      );
      break;
    case 'regulatory-compliance':
      apiResult = await ekoService.checkRegulatoryCompliance(
        serviceData.license_number, serviceData.regulatory_body, serviceData.license_holder, serviceData.license_type
      );
      break;
    default:
      console.log(`No API method found for service: ${serviceId}`);
      return null;
  }

  return apiResult;
};

export const processVerificationResponse = (serviceId: string, apiResult: any) => {
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

  return displayResponse;
};

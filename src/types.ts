export interface LicenseData {
  id: string;
  company: string;
  contactName: string;
  email: string;
  issueDate: string;
  expiryDate: string;
  licenseType: 'trial' | 'full';
  licenseNumber: string;
  signature: string;
}
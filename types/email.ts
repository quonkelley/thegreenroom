export interface EmailSignupResult {
  success: boolean;
  data?: any; // Replace 'any' with a more specific type if possible
  error?: string;
}

export type EmailSignupError = string; 
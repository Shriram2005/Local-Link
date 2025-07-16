import * as yup from 'yup';

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  postalCode: /^[A-Z0-9]{3,10}$/i,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
};

// Common validation messages
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  password: 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character',
  passwordMatch: 'Passwords do not match',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  min: (min: number) => `Must be at least ${min}`,
  max: (max: number) => `Must be no more than ${max}`,
  url: 'Please enter a valid URL',
  postalCode: 'Please enter a valid postal code',
  future: 'Date must be in the future',
  past: 'Date must be in the past',
};

// User validation schemas
export const userValidationSchemas = {
  login: yup.object({
    email: yup
      .string()
      .matches(VALIDATION_PATTERNS.email, VALIDATION_MESSAGES.email)
      .required(VALIDATION_MESSAGES.required),
    password: yup
      .string()
      .min(6, VALIDATION_MESSAGES.minLength(6))
      .required(VALIDATION_MESSAGES.required),
  }),

  register: yup.object({
    displayName: yup
      .string()
      .min(2, VALIDATION_MESSAGES.minLength(2))
      .max(50, VALIDATION_MESSAGES.maxLength(50))
      .required(VALIDATION_MESSAGES.required),
    email: yup
      .string()
      .matches(VALIDATION_PATTERNS.email, VALIDATION_MESSAGES.email)
      .required(VALIDATION_MESSAGES.required),
    password: yup
      .string()
      .matches(VALIDATION_PATTERNS.password, VALIDATION_MESSAGES.password)
      .required(VALIDATION_MESSAGES.required),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], VALIDATION_MESSAGES.passwordMatch)
      .required(VALIDATION_MESSAGES.required),
    role: yup
      .string()
      .oneOf(['customer', 'service_provider'])
      .required(VALIDATION_MESSAGES.required),
    agreeToTerms: yup
      .boolean()
      .oneOf([true], 'You must agree to the terms and conditions'),
  }),

  profile: yup.object({
    displayName: yup
      .string()
      .min(2, VALIDATION_MESSAGES.minLength(2))
      .max(50, VALIDATION_MESSAGES.maxLength(50))
      .required(VALIDATION_MESSAGES.required),
    phoneNumber: yup
      .string()
      .matches(VALIDATION_PATTERNS.phone, VALIDATION_MESSAGES.phone)
      .optional(),
    address: yup.object({
      street: yup.string().max(100, VALIDATION_MESSAGES.maxLength(100)),
      city: yup.string().max(50, VALIDATION_MESSAGES.maxLength(50)),
      state: yup.string().max(50, VALIDATION_MESSAGES.maxLength(50)),
      postalCode: yup
        .string()
        .matches(VALIDATION_PATTERNS.postalCode, VALIDATION_MESSAGES.postalCode),
      country: yup.string().max(50, VALIDATION_MESSAGES.maxLength(50)),
    }).optional(),
  }),
};

// Service validation schemas
export const serviceValidationSchemas = {
  create: yup.object({
    title: yup
      .string()
      .min(5, VALIDATION_MESSAGES.minLength(5))
      .max(100, VALIDATION_MESSAGES.maxLength(100))
      .required(VALIDATION_MESSAGES.required),
    description: yup
      .string()
      .min(20, VALIDATION_MESSAGES.minLength(20))
      .max(1000, VALIDATION_MESSAGES.maxLength(1000))
      .required(VALIDATION_MESSAGES.required),
    category: yup
      .string()
      .required(VALIDATION_MESSAGES.required),
    subcategory: yup
      .string()
      .required(VALIDATION_MESSAGES.required),
    pricing: yup.object({
      basePrice: yup
        .number()
        .min(1, VALIDATION_MESSAGES.min(1))
        .max(10000, VALIDATION_MESSAGES.max(10000))
        .required(VALIDATION_MESSAGES.required),
      unit: yup
        .string()
        .oneOf(['hour', 'session', 'project', 'day'])
        .required(VALIDATION_MESSAGES.required),
      description: yup
        .string()
        .max(200, VALIDATION_MESSAGES.maxLength(200)),
    }).required(),
    duration: yup
      .number()
      .min(15, VALIDATION_MESSAGES.min(15))
      .max(480, VALIDATION_MESSAGES.max(480))
      .required(VALIDATION_MESSAGES.required),
    location: yup
      .string()
      .oneOf(['at_customer', 'at_provider', 'flexible'])
      .required(VALIDATION_MESSAGES.required),
    tags: yup
      .array()
      .of(yup.string())
      .min(1, 'At least one tag is required')
      .max(10, 'Maximum 10 tags allowed'),
  }),
};

// Booking validation schemas
export const bookingValidationSchemas = {
  create: yup.object({
    serviceId: yup
      .string()
      .required(VALIDATION_MESSAGES.required),
    scheduledDate: yup
      .date()
      .min(new Date(), VALIDATION_MESSAGES.future)
      .required(VALIDATION_MESSAGES.required),
    duration: yup
      .number()
      .min(15, VALIDATION_MESSAGES.min(15))
      .required(VALIDATION_MESSAGES.required),
    location: yup.object({
      address: yup
        .string()
        .required(VALIDATION_MESSAGES.required),
      city: yup
        .string()
        .required(VALIDATION_MESSAGES.required),
      postalCode: yup
        .string()
        .matches(VALIDATION_PATTERNS.postalCode, VALIDATION_MESSAGES.postalCode)
        .required(VALIDATION_MESSAGES.required),
    }).required(),
    notes: yup
      .string()
      .max(500, VALIDATION_MESSAGES.maxLength(500)),
  }),
};

// Review validation schemas
export const reviewValidationSchemas = {
  create: yup.object({
    rating: yup
      .number()
      .min(1, VALIDATION_MESSAGES.min(1))
      .max(5, VALIDATION_MESSAGES.max(5))
      .required(VALIDATION_MESSAGES.required),
    comment: yup
      .string()
      .min(10, VALIDATION_MESSAGES.minLength(10))
      .max(1000, VALIDATION_MESSAGES.maxLength(1000))
      .required(VALIDATION_MESSAGES.required),
  }),
};

// Message validation schemas
export const messageValidationSchemas = {
  send: yup.object({
    content: yup
      .string()
      .min(1, VALIDATION_MESSAGES.minLength(1))
      .max(1000, VALIDATION_MESSAGES.maxLength(1000))
      .required(VALIDATION_MESSAGES.required),
  }),
};

// Utility functions for validation
export const validateField = async (schema: yup.AnySchema, value: any): Promise<string | null> => {
  try {
    await schema.validate(value);
    return null;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return error.message;
    }
    return 'Validation error';
  }
};

export const validateForm = async (schema: yup.ObjectSchema<any>, data: any): Promise<Record<string, string> | null> => {
  try {
    await schema.validate(data, { abortEarly: false });
    return null;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return errors;
    }
    return { general: 'Validation error' };
  }
};

// Custom validation helpers
export const isValidEmail = (email: string): boolean => {
  return VALIDATION_PATTERNS.email.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return VALIDATION_PATTERNS.phone.test(phone);
};

export const isValidPassword = (password: string): boolean => {
  return VALIDATION_PATTERNS.password.test(password);
};

export const isValidUrl = (url: string): boolean => {
  return VALIDATION_PATTERNS.url.test(url);
};

// Sanitization helpers
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

"use client";

import { useState, useCallback, useMemo } from "react";
import { z } from "zod";
import type { ValidationError } from "@/types/calculator";

interface UseCalculatorFormOptions<T> {
  schema: z.ZodSchema<T>;
  initialValues: T;
  onSubmit?: (values: T) => void;
  validateOnChange?: boolean;
}

export function useCalculatorForm<T extends Record<string, any>>({
  schema,
  initialValues,
  onSubmit,
  validateOnChange = true,
}: UseCalculatorFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = useCallback((name: string, value: any) => {
    try {
      // Only attempt field-level validation if schema is a ZodObject
      if (schema instanceof z.ZodObject) {
        const fieldSchema = schema.shape[name as keyof typeof schema.shape];
        if (fieldSchema) {
          fieldSchema.parse(value);
          // Remove any existing errors for this field
          setErrors(prev => prev.filter(error => error.field !== name));
          return null;
        }
      } else {
        // For non-object schemas, skip field-level validation
        return null;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors[0];
        if (fieldError) {
          const validationError: ValidationError = {
            field: name,
            message: fieldError.message,
          };
          setErrors(prev => [
            ...prev.filter(e => e.field !== name),
            validationError,
          ]);
          return validationError;
        }
      }
    }
    return null;
  }, [schema]);

  // Validate all fields
  const validateAll = useCallback(() => {
    try {
      schema.parse(values);
      setErrors([]);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path[0] as string,
          message: err.message,
        }));
        setErrors(validationErrors);
        return false;
      }
    }
    return false;
  }, [schema, values]);

  // Update a field value
  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (validateOnChange && touched[name]) {
      validateField(name, value);
    }
  }, [validateField, validateOnChange, touched]);

  // Mark a field as touched
  const setFieldTouched = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    if (validateOnChange) {
      validateField(name, values[name as keyof T]);
    }
  }, [validateField, validateOnChange, values]);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    const isValid = validateAll();
    
    if (isValid && onSubmit) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error("Form submission error:", error);
      }
    }

    setIsSubmitting(false);
    return isValid;
  }, [values, validateAll, onSubmit]);

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors([]);
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Get error for a specific field
  const getFieldError = useCallback((name: string) => {
    return errors.find(error => error.field === name)?.message;
  }, [errors]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return errors.length === 0;
  }, [errors]);

  // Check if form has been modified
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    setValue,
    setFieldTouched,
    handleSubmit,
    reset,
    getFieldError,
    validateField,
    validateAll,
  };
}
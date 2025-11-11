/**
 * Password Input with Strength Meter
 * Real-time password strength feedback
 */

'use client';

import { useState, useEffect } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  validatePassword,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  PasswordStrength,
} from '@/lib/auth/password-requirements';

interface PasswordInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  showStrengthMeter?: boolean;
  showRequirements?: boolean;
  disabled?: boolean;
  error?: string;
}

export function PasswordInput({
  id = 'password',
  name = 'password',
  value,
  onChange,
  placeholder = 'Enter password',
  label = 'Password',
  required = true,
  showStrengthMeter = true,
  showRequirements = true,
  disabled = false,
  error,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState(validatePassword(''));

  useEffect(() => {
    if (value) {
      setValidation(validatePassword(value));
    } else {
      setValidation(validatePassword(''));
    }
  }, [value]);

  const getStrengthBarColor = (strength: PasswordStrength) => {
    const color = getPasswordStrengthColor(strength);
    switch (color) {
      case 'success':
        return 'bg-success';
      case 'warning':
        return 'bg-warning';
      case 'error':
        return 'bg-error';
      default:
        return 'bg-border';
    }
  };

  const getStrengthTextColor = (strength: PasswordStrength) => {
    const color = getPasswordStrengthColor(strength);
    switch (color) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-tertiary';
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={cn(error && 'border-error')}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
        >
          {showPassword ? (
            <FiEyeOff className="h-4 w-4 text-secondary" />
          ) : (
            <FiEye className="h-4 w-4 text-secondary" />
          )}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-error">{error}</p>
      )}

      {showStrengthMeter && value && (
        <div className="space-y-2">
          {/* Strength bar */}
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={cn(
                  'h-1 flex-1 transition-all duration-300',
                  validation.score > index * 25
                    ? getStrengthBarColor(validation.strength)
                    : 'bg-border'
                )}
              />
            ))}
          </div>

          {/* Strength label */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-tertiary">Strength:</span>
            <span className={cn('font-medium', getStrengthTextColor(validation.strength))}>
              {getPasswordStrengthLabel(validation.strength)}
            </span>
          </div>
        </div>
      )}

      {showRequirements && value && validation.feedback.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-secondary">Requirements:</p>
          <ul className="space-y-1">
            {validation.feedback.map((feedback, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-tertiary">
                <span className="mt-0.5">•</span>
                <span>{feedback}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showRequirements && value && validation.isValid && (
        <p className="text-xs text-success">✓ All requirements met</p>
      )}
    </div>
  );
}

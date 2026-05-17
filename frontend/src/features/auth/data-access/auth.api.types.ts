import type { ApiErrorCode } from '@/core/api-error-codes';
import type { User } from '@/core/models';

export type AuthRole = 'admin' | 'customer';

export interface AddressDto {
  id: number;
  fullName: string;
  phone: string;
  line1: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface AuthUserDto {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  createdAt: string;
  addresses: AddressDto[];
}

export interface AuthResultDto {
  token: string;
  user: AuthUserDto;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  fullName: string;
  phone: string;
  password: string;
  role: AuthRole;
}

export interface ConfirmEmailResponseDto {
  message: string;
}

export interface ProblemDetailsDto {
  type?: string;
  title?: string;
  status?: number;
  code?: ApiErrorCode | string;
  detail?: string;
  instance?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
  message?: string;
}

export type AuthSession = User & {
  role: AuthRole;
  token: string;
};

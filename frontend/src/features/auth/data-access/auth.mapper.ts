import { isApiErrorCode, type ApiErrorCode } from '@/core/api-error-codes';
import type { AuthResultDto, AuthRole, AuthSession, ProblemDetailsDto } from './auth.api.types';

const normalizeRole = (value: string): AuthRole => {
  return value.toLowerCase() === 'admin' ? 'admin' : 'customer';
};

export function mapAuthResultDto(dto: AuthResultDto): AuthSession {
  return {
    id: dto.user.id,
    email: dto.user.email,
    fullName: dto.user.fullName,
    phone: dto.user.phone,
    createdAt: dto.user.createdAt,
    addresses: dto.user.addresses.map((address) => ({
      id: address.id,
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      ward: address.ward,
      district: address.district,
      city: address.city,
      isDefault: address.isDefault
    })),
    role: normalizeRole(dto.user.role),
    token: dto.token
  };
}

function extractProblemDetails(error: unknown): ProblemDetailsDto | null {
  if (!error || typeof error !== 'object' || !('error' in error)) {
    return null;
  }

  const payload = (error as { error?: unknown }).error;
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  return payload as ProblemDetailsDto;
}

export function readProblemDetailsCode(error: unknown): ApiErrorCode | null {
  const details = extractProblemDetails(error);
  if (!details || typeof details.code !== 'string') {
    return null;
  }

  return isApiErrorCode(details.code) ? details.code : null;
}

export function readProblemDetailsMessage(error: unknown, fallbackMessage: string): string {
  const details = extractProblemDetails(error);
  if (!details) {
    return fallbackMessage;
  }

  if (details.detail?.trim()) {
    return details.detail.trim();
  }

  if (details.message?.trim()) {
    return details.message.trim();
  }

  const validationErrors = details.errors
    ? Object.values(details.errors).flat().filter((message) => message.trim().length > 0)
    : [];

  if (validationErrors.length > 0) {
    return validationErrors.join(' ');
  }

  if (details.title?.trim()) {
    return details.title.trim();
  }

  return fallbackMessage;
}

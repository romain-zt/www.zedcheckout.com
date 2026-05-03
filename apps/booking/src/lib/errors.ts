import { NextResponse } from 'next/server';

export function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: code, message, ...extra }, { status });
}

export function tenantRequired() {
  return jsonError(400, 'TENANT_NOT_FOUND', 'Could not resolve tenant from hostname');
}

export function unauthorized(message = 'Unauthorized') {
  return jsonError(401, 'UNAUTHORIZED', message);
}

export function notFound(entity: string) {
  return jsonError(404, 'NOT_FOUND', `${entity} not found`);
}

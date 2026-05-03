import { NextRequest, NextResponse } from 'next/server';
import { handleExpirePending } from '@/lib/handlers/expire-pending';
import type { BookingStore } from '@/lib/store';
import type { Dependencies } from '@/lib/dependencies';

let _store: BookingStore | null = null;
let _deps: Dependencies | null = null;
export function setStore(store: BookingStore) { _store = store; }
export function setDeps(deps: Dependencies) { _deps = deps; }

// Hardcoded tenant for V0; V1+ iterates all tenants
const V0_TENANT_ID = 'lb-tenant-001';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  if (!_store || !_deps) return NextResponse.json({ error: 'NOT_CONFIGURED' }, { status: 500 });

  const result = await handleExpirePending({
    tenantId: V0_TENANT_ID,
    store: _store,
    deps: _deps,
  });
  return NextResponse.json(result.body, { status: result.status });
}

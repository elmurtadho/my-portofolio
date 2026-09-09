import { DELETE as authDelete } from '../auth/route';

export const dynamic = 'force-dynamic';

export async function POST() {
  return authDelete();
}

export async function DELETE() {
  return authDelete();
}

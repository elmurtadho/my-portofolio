import { POST as authPost } from '../auth/route';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return authPost(request);
}

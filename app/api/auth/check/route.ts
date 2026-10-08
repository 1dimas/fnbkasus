import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('cashier_session');

  if (session && session.value) {
    return NextResponse.json({
      authenticated: true,
      role: 'cashier',
    });
  }

  return NextResponse.json({
    authenticated: false,
  });
}

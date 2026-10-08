import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin, username, password } = body;

    const validPin = process.env.CASHIER_PIN || '1234';
    const validUsername = process.env.CASHIER_USERNAME || 'kasir';
    const validPassword = process.env.CASHIER_PASSWORD || 'kasir123';

    let isAuthenticated = false;

    // Check PIN or username & password
    if (pin && pin.trim() === validPin) {
      isAuthenticated = true;
    } else if (
      username &&
      password &&
      username.trim().toLowerCase() === validUsername.toLowerCase() &&
      password === validPassword
    ) {
      isAuthenticated = true;
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: 'PIN atau kredensial kasir salah.' },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set('cashier_session', 'authenticated_kasir_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 jam
    });

    return NextResponse.json({
      success: true,
      message: 'Login kasir berhasil.',
      user: { role: 'cashier', name: 'Kasir Utama' },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server saat login.' },
      { status: 500 }
    );
  }
}

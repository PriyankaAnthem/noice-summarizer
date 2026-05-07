// src/app/api/auth/token/route.ts
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'

export async function GET(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET! 
  })
  
  if (!token) {
    return NextResponse.json({ token: null }, { status: 401 })
  }

  // Apna simple HS256 JWT banao backend ke liye
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)
  
  const jwt = await new jose.SignJWT({ 
    sub:   token.sub,
    email: token.email,
    name:  token.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret)

  return NextResponse.json({ token: jwt })
}
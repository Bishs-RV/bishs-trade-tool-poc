import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const tenantId = process.env.AZURE_AD_TENANT_ID;
  const origin = new URL('/', request.url).toString();

  // If Azure AD is configured, redirect to Azure AD logout to clear SSO session
  if (tenantId) {
    const logoutUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(origin)}`;
    return NextResponse.redirect(logoutUrl);
  }

  // Fallback: redirect to app root
  return NextResponse.redirect(origin);
}

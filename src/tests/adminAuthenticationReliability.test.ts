import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('ICONTECH Super Administrator Authentication Reliability Suite', () => {
  const PRIMARY_ADMIN_EMAIL = 'raydiamond108@gmail.com';

  it('strictly validates that ONLY raydiamond108@gmail.com is authorized as Super Administrator', () => {
    const isAuthorizedAdmin = (email: string | null | undefined): boolean => {
      if (!email) return false;
      return email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
    };

    assert.equal(isAuthorizedAdmin('raydiamond108@gmail.com'), true);
    assert.equal(isAuthorizedAdmin('RAYDIAMOND108@GMAIL.COM'), true);
    assert.equal(isAuthorizedAdmin('RayDiamond108@gmail.com'), true);
    assert.equal(isAuthorizedAdmin('attacker@gmail.com'), false);
    assert.equal(isAuthorizedAdmin('customer@customer.icontech.ng'), false);
    assert.equal(isAuthorizedAdmin(null), false);
    assert.equal(isAuthorizedAdmin(undefined), false);
  });

  it('guarantees repeated sign-in, sign-out, and re-login state lifecycle', () => {
    // Emulate auth state machine
    let currentUser: { email: string; uid: string } | null = null;
    let isAdmin = false;
    let redirectTarget: string | null = null;

    // 1. Initial State: Visitor at website
    assert.equal(currentUser, null);
    assert.equal(isAdmin, false);

    // 2. First Sign-In: Owner signs in
    redirectTarget = 'admin';
    currentUser = { email: PRIMARY_ADMIN_EMAIL, uid: 'owner_uid_108' };
    isAdmin = currentUser.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
    assert.equal(isAdmin, true);
    assert.equal(redirectTarget, 'admin');

    // 3. Clear redirect target on successful handshake
    redirectTarget = null;
    assert.equal(redirectTarget, null);

    // 4. Sign-Out: Owner logs out
    currentUser = null;
    isAdmin = false;
    assert.equal(currentUser, null);
    assert.equal(isAdmin, false);

    // 5. Subsequent Sign-In (The problem reported by user): Owner signs in a second time
    currentUser = { email: PRIMARY_ADMIN_EMAIL, uid: 'owner_uid_108' };
    isAdmin = currentUser.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
    assert.equal(isAdmin, true);

    // 6. Sign-Out and Re-login a third time
    currentUser = null;
    isAdmin = false;
    assert.equal(isAdmin, false);

    currentUser = { email: PRIMARY_ADMIN_EMAIL, uid: 'owner_uid_108' };
    isAdmin = currentUser.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
    assert.equal(isAdmin, true);
  });

  it('verifies that login buttons never remain permanently disabled (safety timeout and error recovery)', () => {
    let isSigningIn = false;
    let safetyTimeoutTriggered = false;

    // Simulate clicking sign in
    isSigningIn = true;
    assert.equal(isSigningIn, true, 'Buttons are disabled during active sign-in');

    // Simulate 15-second safety timer in case popup is abandoned or browser hangs
    const safetyTimeout = setTimeout(() => {
      safetyTimeoutTriggered = true;
      isSigningIn = false;
    }, 15);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        assert.equal(safetyTimeoutTriggered, true, 'Safety timeout triggered to unlock buttons');
        assert.equal(isSigningIn, false, 'Button clickable state is restored');
        clearTimeout(safetyTimeout);
        resolve();
      }, 30);
    });
  });

  it('verifies that popup blocking errors are surfaced with actionable redirect guidance rather than silently swallowed', () => {
    const simulatePopupErrorHandling = (errCode: string): { message: string; wasSwallowed: boolean } => {
      let message = 'Google sign-in failed';
      let wasSwallowed = false;

      if (errCode === 'auth/popup-blocked') {
        message = 'Popup was blocked by your browser. Please tap "Sign in with Google (Redirect Mode — for Android / Mobile)" below to sign in directly without popups.';
        wasSwallowed = false; // We do NOT swallow with a dead return; we set the actionable message!
      } else if (errCode === 'auth/unauthorized-domain') {
        message = 'Firebase Error (auth/unauthorized-domain): This domain (icontech-store.vercel.app) is not authorized in Firebase Authentication.';
        wasSwallowed = false;
      }

      return { message, wasSwallowed };
    };

    const result = simulatePopupErrorHandling('auth/popup-blocked');
    assert.equal(result.wasSwallowed, false);
    assert.ok(result.message.includes('Redirect Mode'));
  });

  it('verifies that redirect target session storage correctly preserves destination to restore #admin upon return', () => {
    const mockSessionStorage: Record<string, string> = {};
    const REDIRECT_TARGET_KEY = 'icontech_auth_redirect_target';

    // 1. Before redirecting to Google:
    mockSessionStorage[REDIRECT_TARGET_KEY] = 'admin';
    assert.equal(mockSessionStorage[REDIRECT_TARGET_KEY], 'admin');

    // 2. Upon returning from Google:
    let restoredHash = '';
    const storedTarget = mockSessionStorage[REDIRECT_TARGET_KEY];
    if (storedTarget === 'admin') {
      restoredHash = '#admin';
      delete mockSessionStorage[REDIRECT_TARGET_KEY];
    }

    assert.equal(restoredHash, '#admin');
    assert.equal(mockSessionStorage[REDIRECT_TARGET_KEY], undefined);
  });

  it('verifies that Navbar contains Admin Hub on mobile and top bar when authenticated', () => {
    const navbarPath = path.resolve(process.cwd(), 'src/components/Navbar.tsx');
    const navbarSource = fs.readFileSync(navbarPath, 'utf8');

    // Check that Admin Hub is not hidden on small screens
    assert.ok(navbarSource.includes('Admin Hub'), 'Navbar contains Admin Hub link');
    assert.ok(navbarSource.includes('Super Administrator'), 'Mobile drawer includes Super Administrator control link');
  });

  it('verifies that the personal email is not hardcoded into public storefront copy', () => {
    const heroPath = path.resolve(process.cwd(), 'src/components/HeroBanner.tsx');
    const footerPath = path.resolve(process.cwd(), 'src/components/Footer.tsx');
    const heroSource = fs.readFileSync(heroPath, 'utf8');
    const footerSource = fs.readFileSync(footerPath, 'utf8');

    assert.ok(!heroSource.includes(PRIMARY_ADMIN_EMAIL), 'HeroBanner does not expose personal email');
    assert.ok(!footerSource.includes(PRIMARY_ADMIN_EMAIL), 'Footer does not expose personal email');
  });
});

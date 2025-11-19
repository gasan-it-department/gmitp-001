<?php

namespace App\Core\Auth\Services;

use Illuminate\Http\Request;
use App\Core\Users\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;


class LaravelSessionService implements \App\Core\Auth\Interfaces\CookieSessionInterface
{
    private const REMEMBER_TOKEN_MINUTES = 525600; // 1 year
    private const REGULAR_SESSION_MINUTES = 120;

    public function __construct(private Request $request)
    {
    }
    public function createAuthenticatedSession(string $userId, bool $rememberMe = false): array
    {
        $user = User::findOrFail($userId);

        Auth::login($user, $rememberMe);

        $this->regenerateSession();

        $expiresIn = $rememberMe
            ? self::REMEMBER_TOKEN_MINUTES * 60
            : self::REGULAR_SESSION_MINUTES * 60;

        // Store additional session data
        Session::put('auth.login_time', now());
        Session::put('auth.remember', $rememberMe);
        Session::put('auth.user_agent', $this->request->userAgent());
        Session::put('auth.ip_address', $this->request->ip());

        return [
            'expires_in' => $expiresIn,
            'session_id' => Session::getId(),
            'remember' => $rememberMe
        ];
    }
    public function regenerateSession(): void
    {

        Session::regenerate();

    }
    public function destroySession(): void
    {
        Auth::guard('web')->logout();
        Session::invalidate();
        Session::regenerateToken();

    }

    public function isAuthenticated(): bool
    {
        return Auth::check();
    }
    public static function getSessionMetadata(): array
    {
        return [
            'login_time' => Session::get('auth.login_time'),
            'remember' => Session::get('auth.remember', false),
            'user_agent' => Session::get('auth.user_agent'),
            'ip_address' => Session::get('auth.ip_address'),
            'session_id' => Session::getId(),
        ];
    }

    public function validateSession(): bool
    {
        if (!$this->isAuthenticated()) {
            return false;
        }

        // Check if user agent has changed (potential hijacking)
        $currentUserAgent = $this->request->userAgent();
        $sessionUserAgent = Session::get('auth.user_agent');

        if ($sessionUserAgent && $currentUserAgent !== $sessionUserAgent) {
            $this->destroySession();
            return false;
        }

        // Check if IP has changed (optional, may cause issues with mobile users)
        // Uncomment if you want strict IP validation
        /*
        $currentIp = $this->request->ip();
        $sessionIp = Session::get('auth.ip_address');

        if ($sessionIp && $currentIp !== $sessionIp) {
            $this->destroySession();
            return false;
        }
        */

        return true;
    }
}
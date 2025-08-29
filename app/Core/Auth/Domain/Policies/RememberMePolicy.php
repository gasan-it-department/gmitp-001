<?php

namespace App\Core\Auth\Domain\Policies;

use App\Core\Auth\Domain\Entities\AuthSession;
class RememberMePolicy
{
    private int $tokenLifespanDays;
    private int $sessionLifespanMinutes;

    public function __construct(
        int $tokenLifespanDays = 30,
        int $sessionLifespanMinutes = 120
    ) {
        $this->tokenLifespanDays = $tokenLifespanDays;
        $this->sessionLifespanMinutes = $sessionLifespanMinutes;
    }

    public function getTokenExpiration(): \DateTime
    {
        return (new \DateTime())->modify("+{$this->tokenLifespanDays} days");
    }

    public function getSessionExpiration(): \DateTime
    {
        return (new \DateTime())->modify("+{$this->sessionLifespanMinutes} minutes");
    }

    public function shouldExtendSession(bool $rememberMe): bool
    {
        return $rememberMe;
    }

}
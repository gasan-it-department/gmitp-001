<?php

namespace App\Core\Auth\Interfaces;

interface TokenServiceInterface
{
    public function createToken(int $userId, bool $rememberMe): array;
}

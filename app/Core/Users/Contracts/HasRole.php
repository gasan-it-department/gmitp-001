<?php

namespace App\Core\Users\Contracts;

interface HasRole
{
    public function getRole(): string;
}
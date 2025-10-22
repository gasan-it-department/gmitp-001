<?php

namespace App\Core\Feedback\Domains\Contracts;

interface FeedbackRepositoryInterface
{
    public function create(): void;
}
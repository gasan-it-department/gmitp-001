<?php

namespace App\Core\Feedback\Domains\Entities;

use Exception;

class Feedback
{
    public function __construct(
        public readonly string $id,
        public readonly ?string $userId,
        public readonly ?string $departmentId,
        public readonly ?string $employeeName,
        public readonly ?string $senderName,
        public readonly string $subjectType,
        public readonly string $message,
        public readonly ?int $rating,
        public readonly ?string $attachementPath,
        public readonly bool $isAnonymous,
        public readonly string $ipAddress,
        public readonly string $userAgent,
    ) {
    }

    public static function create(
        string $id,
        ?string $userId,
        ?string $departmentId,
        ?string $employeeName,
        ?string $senderName,
        string $subjectType,
        string $message,
        ?int $rating,
        ?string $attachementPath,
        bool $isAnonymous,
        string $ipAddress,
        string $userAgent,
    ): self {
        return new self(
            $id,
            $userId,
            $departmentId,
            $employeeName,
            $senderName,
            $subjectType,
            $message,
            $rating,
            $attachementPath,
            $isAnonymous,
            $ipAddress,
            $userAgent,
        );
    }

    private function validate(): void
    {
        if ($this->subjectType === 'department' && empty($this->departmentId)) {
            throw new Exception('Department ID is required');
        }

        if ($this->subjectType === 'employee' && empty($this->employeeName)) {
            throw new Exception('Employee name is required ');
        }

        if ($this->subjectType === 'employee' && $this->rating !== null) {
            throw new Exception('Employee cannot be rated');
        }

        if ($this->rating !== null && $this->rating < 1) {
            throw new Exception('Rating must be at least 1');
        }

        if ($this->rating !== null && $this->rating > 5) {
            throw new Exception('Rating cannot exceed 5');
        }

        if (trim($this->message)) {
            throw new Exception('Message cannot be empty');
        }
    }

    //getters
    public function getId(): string
    {
        return $this->id;
    }

    public function getUserId(): string
    {
        return $this->userId;
    }

    public function getDepartmentid(): string
    {
        return $this->departmentId;
    }

    public function getEmployeeName(): string
    {
        return $this->employeeName;
    }

    public function getSenderName(): string
    {
        return $this->senderName;
    }

    public function getSubjectType(): string
    {
        return $this->subjectType;
    }

    public function getMessage(): string
    {
        return $this->message;
    }

    public function getRating(): ?int
    {
        return $this->rating;
    }

    public function getFilePath(): ?string
    {
        return $this->attachementPath;
    }

    public function isAnonymous(): bool
    {
        return $this->isAnonymous;
    }

    public function getIpAddress(): string
    {
        return $this->ipAddress;
    }

    public function getUserAgent(): string
    {
        return $this->userAgent;
    }
}
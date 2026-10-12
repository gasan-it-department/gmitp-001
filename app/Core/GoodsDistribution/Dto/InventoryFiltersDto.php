<?php

namespace App\Core\GoodsDistribution\Dto;

final readonly class InventoryFiltersDto
{
    public function __construct(public array $values = []) {}

    public function get(string $key): ?string
    {
        return isset($this->values[$key]) && $this->values[$key] !== '' ? (string) $this->values[$key] : null;
    }

    public function forProgram(string $programId): self
    {
        return new self([...$this->values, 'program_id' => $programId]);
    }
}

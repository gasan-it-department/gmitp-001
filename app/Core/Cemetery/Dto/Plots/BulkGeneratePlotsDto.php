<?php

namespace App\Core\Cemetery\Dto\Plots;

final readonly class BulkGeneratePlotsDto
{
    public function __construct(
        public string $municipalId,
        public string $cemeterySiteId,
        public string $blockId,
        public string $labelPrefix,
        public int $startNumber,
        public int $quantity,
        public int $padding,
        public string $type,
        public int $capacity,
        public ?string $row,
        public ?string $position,
        public ?string $areaSqm,
    ) {}

    public static function fromRequest(array $data, string $cemeterySiteId, string $blockId): self
    {
        return new self(
            municipalId: app('municipal_id'),
            cemeterySiteId: $cemeterySiteId,
            blockId: $blockId,
            labelPrefix: mb_strtoupper(trim($data['label_prefix'])),
            startNumber: (int) $data['start_number'],
            quantity: (int) $data['quantity'],
            padding: (int) $data['padding'],
            type: $data['type'],
            capacity: (int) $data['capacity'],
            row: self::upper($data['row'] ?? null),
            position: self::upper($data['position'] ?? null),
            areaSqm: self::decimalString($data['area_sqm'] ?? null),
        );
    }

    /**
     * @return array<int, string>
     */
    public function generatedNames(): array
    {
        $names = [];

        for ($index = 0; $index < $this->quantity; $index++) {
            $number = (string) ($this->startNumber + $index);

            if ($this->padding > 0) {
                $number = str_pad($number, $this->padding, '0', STR_PAD_LEFT);
            }

            $names[] = trim($this->labelPrefix.' '.$number);
        }

        return $names;
    }

    private static function upper(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : mb_strtoupper($trimmed);
    }

    private static function decimalString(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return number_format((float) $value, 2, '.', '');
    }
}

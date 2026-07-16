<?php

namespace App\Core\Cemetery\Dto\Plots;

final readonly class AddApartmentNichesDto
{
    public function __construct(
        public string $municipalId,
        public string $cemeterySiteId,
        public string $apartmentParentId,
        public int $startFloor,
        public int $floors,
        public int $startRow,
        public int $rowsPerFloor,
        public int $startNiche,
        public int $nichesPerRow,
        public string $rowPrefix,
        public string $nichePrefix,
        public int $nichePadding,
        public int $capacityPerNiche,
    ) {}

    public static function fromRequest(array $data, string $cemeterySiteId, string $apartmentParentId): self
    {
        return new self(
            municipalId: app('municipal_id'),
            cemeterySiteId: $cemeterySiteId,
            apartmentParentId: $apartmentParentId,
            startFloor: (int) ($data['start_floor'] ?? 1),
            floors: (int) $data['floors'],
            startRow: (int) ($data['start_row'] ?? 1),
            rowsPerFloor: (int) $data['rows_per_floor'],
            startNiche: (int) ($data['start_niche'] ?? 1),
            nichesPerRow: (int) $data['niches_per_row'],
            rowPrefix: self::upper($data['row_prefix']),
            nichePrefix: self::upper($data['niche_prefix']),
            nichePadding: (int) $data['niche_padding'],
            capacityPerNiche: (int) ($data['capacity_per_niche'] ?? 1),
        );
    }

    public function totalSlots(): int
    {
        return $this->floors * $this->rowsPerFloor * $this->nichesPerRow;
    }

    /**
     * @return array<int, array{level: int, row: string, position: string}>
     */
    public function generatedSlots(): array
    {
        $slots = [];

        for ($floor = $this->startFloor; $floor < $this->startFloor + $this->floors; $floor++) {
            for ($row = $this->startRow; $row < $this->startRow + $this->rowsPerFloor; $row++) {
                for ($niche = $this->startNiche; $niche < $this->startNiche + $this->nichesPerRow; $niche++) {
                    $slots[] = [
                        'level' => $floor,
                        'row' => $this->rowPrefix.$row,
                        'position' => $this->nicheLabel($niche),
                    ];
                }
            }
        }

        return $slots;
    }

    private function nicheLabel(int $niche): string
    {
        $number = (string) $niche;

        if ($this->nichePadding > 0) {
            $number = str_pad($number, $this->nichePadding, '0', STR_PAD_LEFT);
        }

        return $this->nichePrefix.$number;
    }

    private static function upper(string $value): string
    {
        return mb_strtoupper(trim($value));
    }
}

<?php

namespace App\Core\Cemetery\Dto\Plots;

final readonly class GenerateApartmentNichesDto
{
    public function __construct(
        public string $municipalId,
        public string $cemeterySiteId,
        public string $blockId,
        public string $apartmentName,
        public int $floors,
        public int $rowsPerFloor,
        public int $nichesPerRow,
        public string $rowPrefix,
        public string $nichePrefix,
        public int $nichePadding,
        public int $capacityPerNiche,
    ) {}

    public static function fromRequest(array $data, string $cemeterySiteId, string $blockId): self
    {
        return new self(
            municipalId: app('municipal_id'),
            cemeterySiteId: $cemeterySiteId,
            blockId: $blockId,
            apartmentName: self::upper($data['apartment_name']),
            floors: (int) $data['floors'],
            rowsPerFloor: (int) $data['rows_per_floor'],
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

    public function rowLabel(int $row): string
    {
        return $this->rowPrefix.$row;
    }

    public function nicheLabel(int $niche): string
    {
        $number = (string) $niche;

        if ($this->nichePadding > 0) {
            $number = str_pad($number, $this->nichePadding, '0', STR_PAD_LEFT);
        }

        return $this->nichePrefix.$number;
    }

    /**
     * @return array<int, array{level: int, row: string, position: string}>
     */
    public function generatedSlots(): array
    {
        $slots = [];

        for ($floor = 1; $floor <= $this->floors; $floor++) {
            for ($row = 1; $row <= $this->rowsPerFloor; $row++) {
                for ($niche = 1; $niche <= $this->nichesPerRow; $niche++) {
                    $slots[] = [
                        'level' => $floor,
                        'row' => $this->rowLabel($row),
                        'position' => $this->nicheLabel($niche),
                    ];
                }
            }
        }

        return $slots;
    }

    private static function upper(string $value): string
    {
        return mb_strtoupper(trim($value));
    }
}

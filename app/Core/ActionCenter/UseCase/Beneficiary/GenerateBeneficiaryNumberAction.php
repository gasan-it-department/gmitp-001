<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;

/**
 * Allocates the next human-friendly beneficiary_number for a municipality,
 * e.g. GAS-000123.
 *
 * Format: {PREFIX}-{6-digit sequence}, e.g. GAS-000123. The prefix is a short
 * uppercase abbreviation of the municipality name (first 3 letters) — readable
 * at the desk, unlike the PSGC `municipal_code` (e.g. 1704003000). The sequence
 * is a flat, per-municipality running counter (NOT year-segmented — a
 * beneficiary is a lifelong identity, unlike a transaction number which resets
 * annually). The `beneficiary_number` UNIQUE index is the integrity backstop if
 * two municipality names ever abbreviate to the same prefix.
 *
 * Atomically reads-and-increments the per-municipality row in
 * ac_beneficiary_sequences under SELECT … FOR UPDATE so concurrent
 * registrations never collide. The lock is released when the CALLER's
 * surrounding DB::transaction commits or rolls back — this MUST be invoked from
 * inside one (both creation actions already wrap their work in
 * DB::transaction(attempts: 3), which also retries the rare first-insert race
 * on the sequence row's unique index).
 */
class GenerateBeneficiaryNumberAction
{
    public function __construct(
        private readonly IdGeneratorInterface $idGeneratorInterface,
    ) {
    }
    public function execute(string $municipalId): string
    {
        $municipality = DB::table('municipalities')
            ->where('id', $municipalId)
            ->first(['name', 'municipal_code']);

        if ($municipality === null) {
            throw new \DomainException(
                'Cannot generate a beneficiary number: unknown municipality.',
            );
        }

        $prefix = self::prefixFor($municipality->name, $municipality->municipal_code);

        $row = DB::table('ac_beneficiary_sequences')
            ->where('municipal_id', $municipalId)
            ->lockForUpdate()
            ->first();

        if ($row) {
            $next = $row->last_seq + 1;

            DB::table('ac_beneficiary_sequences')
                ->where('municipal_id', $municipalId)
                ->update([
                    'last_seq' => $next,
                    'updated_at' => now(),
                ]);
        } else {
            $next = 1;

            DB::table('ac_beneficiary_sequences')->insert([
                'id' => $this->idGeneratorInterface->generate(),
                'municipal_id' => $municipalId,
                'last_seq' => $next,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return self::format($prefix, $next);
    }

    /**
     * Short uppercase prefix from the municipality name (first 3 alphanumeric
     * letters), e.g. "GASAN" → "GAS", "SANTA CRUZ" → "SAN". Falls back to the
     * PSGC code, then a generic "BNF", so a number can always be produced.
     *
     * Shared with the backfill migration so historical and live numbers use the
     * identical scheme.
     */
    public static function prefixFor(?string $name, ?string $municipalCode = null): string
    {
        $clean = preg_replace('/[^A-Za-z0-9]/', '', (string) $name);
        $prefix = mb_strtoupper(mb_substr((string) $clean, 0, 3));

        if ($prefix !== '') {
            return $prefix;
        }

        return $municipalCode !== null && $municipalCode !== ''
            ? (string) $municipalCode
            : 'BNF';
    }

    /** Compose the final beneficiary_number from a prefix and sequence. */
    public static function format(string $prefix, int $sequence): string
    {
        return sprintf('%s-%06d', $prefix, $sequence);
    }
}

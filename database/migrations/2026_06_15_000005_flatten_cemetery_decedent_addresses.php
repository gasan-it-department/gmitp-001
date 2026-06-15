<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cemetery_decedents', function (Blueprint $table) {
            $table->foreignId('psgc_municipality_id')->nullable()
                ->after('address_id')
                ->constrained('psgc_municipalities')
                ->restrictOnDelete();
            $table->string('psgc_barangay_code', 20)->nullable()->after('psgc_municipality_id')->index();
            $table->string('street_name', 150)->nullable()->after('psgc_barangay_code');
        });

        DB::table('cemetery_decedents as decedents')
            ->join('addresses', 'decedents.address_id', '=', 'addresses.id')
            ->leftJoin('psgc_barangays', 'addresses.psgc_barangay_id', '=', 'psgc_barangays.id')
            ->select([
                'decedents.id',
                'addresses.psgc_municipality_id',
                'psgc_barangays.psgc_code as psgc_barangay_code',
                'addresses.address_snapshot',
            ])
            ->orderBy('decedents.id')
            ->chunk(200, function ($rows) {
                foreach ($rows as $row) {
                    $snapshot = is_string($row->address_snapshot)
                        ? json_decode($row->address_snapshot, true)
                        : (array) $row->address_snapshot;

                    DB::table('cemetery_decedents')->where('id', $row->id)->update([
                        'psgc_municipality_id' => $row->psgc_municipality_id,
                        'psgc_barangay_code' => $row->psgc_barangay_code,
                        'street_name' => filled($snapshot['street'] ?? null)
                            ? mb_strtoupper(trim($snapshot['street']))
                            : null,
                    ]);
                }
            });

        Schema::table('cemetery_decedents', function (Blueprint $table) {
            $table->dropConstrainedForeignId('address_id');
        });
    }

    public function down(): void
    {
        Schema::table('cemetery_decedents', function (Blueprint $table) {
            $table->foreignUlid('address_id')->nullable()
                ->constrained('addresses')
                ->restrictOnDelete();
            $table->dropConstrainedForeignId('psgc_municipality_id');
            $table->dropColumn(['psgc_barangay_code', 'street_name']);
        });
    }
};

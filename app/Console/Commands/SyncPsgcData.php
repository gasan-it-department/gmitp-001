<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class SyncPsgcData extends Command
{
    protected $signature = 'psgc:sync';
    protected $description = 'Safely syncs a single, flat PSGC CSV file using hierarchical state tracking.';

    public function handle()
    {
        $csvFilePath = database_path('data/psgclatest.csv');

        if (!File::exists($csvFilePath)) {
            $this->error("PSGC data file not found at: {$csvFilePath}");
            return 1;
        }

        $this->info('Starting Single-Pass PSGC Data Sync...');
        DB::connection()->disableQueryLog();

        $handle = fopen($csvFilePath, 'r');
        if ($handle === false) {
            $this->error('Could not open the CSV file.');
            return 1;
        }

        // Skip the header row
        fgetcsv($handle);

        // State trackers
        $activeRegionId = null;
        $activeProvinceId = null;
        $activeMunicipalityId = null;

        $barangayBatch = [];
        $batchSize = 1000;

        $bar = $this->output->createProgressBar();

        while (($row = fgetcsv($handle)) !== false) {
            // Ensure row has the expected columns to prevent offset errors
            if (count($row) < 5)
                continue;

            // FIX: Restore the leading zero stripped by Excel to ensure 10 digits
            $psgcCode = str_pad(trim($row[0]), 10, '0', STR_PAD_LEFT);
            $name = trim($row[1]);
            $geoLevel = trim($row[3]);

            // City_Class might be empty for normal municipalities
            $cityClass = isset($row[5]) ? strtoupper(trim($row[5])) : '';

            switch ($geoLevel) {
                case 'Reg':
                    $activeRegionId = $this->insertAndGetId('psgc_regions', [
                        'psgc_code' => $psgcCode,
                        'name' => $name,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    // Critical: Reset province for regions like NCR that don't have them
                    $activeProvinceId = null;
                    break;

                case 'Prov':
                    $activeProvinceId = $this->insertAndGetId('psgc_provinces', [
                        'region_id' => $activeRegionId,
                        'psgc_code' => $psgcCode,
                        'name' => $name,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    break;

                case 'Dist':
                case 'SubMun':
                    // Geographic Districts (like in NCR) are mostly ignored in standard forms.
                    // We skip them to keep the strict Region -> City flow for NCR.
                    break;

                case 'Mun':
                case 'City':
                    // Determine if it is a city based on level or classification
                    $isCity = ($geoLevel === 'City' || in_array($cityClass, ['CC', 'HUC', 'ICC']));

                    $activeMunicipalityId = $this->insertAndGetId('psgc_municipalities', [
                        'region_id' => $activeRegionId,
                        'province_id' => $activeProvinceId, // Will naturally be null if in NCR
                        'psgc_code' => $psgcCode,
                        'name' => $name,
                        'is_city' => $isCity,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    break;

                case 'Bgy':
                    $barangayBatch[] = [
                        'municipality_id' => $activeMunicipalityId,
                        'psgc_code' => $psgcCode,
                        'name' => $name,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];

                    // Upsert in chunks to save RAM
                    if (count($barangayBatch) >= $batchSize) {
                        DB::table('psgc_barangays')->upsert($barangayBatch, ['psgc_code'], ['name', 'updated_at']);
                        $barangayBatch = []; // Reset batch
                    }
                    break;
            }

            $bar->advance();
        }

        // Upsert any remaining barangays in the final batch
        if (!empty($barangayBatch)) {
            DB::table('psgc_barangays')->upsert($barangayBatch, ['psgc_code'], ['name', 'updated_at']);
        }

        fclose($handle);
        $bar->finish();

        $this->newLine(2);
        $this->info('PSGC Sync Completed Successfully!');
        return 0;
    }

    /**
     * Helper to upsert a parent record and immediately return its DB ID.
     */
    private function insertAndGetId(string $table, array $data): int
    {
        // We dynamically grab all keys from the data array except the PSGC code and created_at
        // This ensures if a province changes regions, or a city changes provinces, it updates!
        $updateColumns = array_keys($data);
        $updateColumns = array_diff($updateColumns, ['psgc_code', 'created_at']);

        DB::table($table)->upsert(
            [$data],
            ['psgc_code'],
            $updateColumns // Automatically updates name, region_id, province_id, is_city, etc.
        );

        return DB::table($table)->where('psgc_code', $data['psgc_code'])->value('id');
    }
}
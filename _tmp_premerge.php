<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use Illuminate\Support\Facades\DB;
$applied = DB::table('migrations')->whereIn('migration', [
  '2026_06_10_000001_add_merged_into_to_ac_beneficiaries_table',
  '2026_06_10_000002_add_municipal_id_to_ac_beneficiaries_table',
])->pluck('migration')->all();
echo "applied: " . implode(', ', $applied) . "\n";
$dupes = DB::table('ac_beneficiaries')->whereNotNull('user_id')
  ->select('user_id')->groupBy('user_id')->havingRaw('count(*) > 1')->get();
echo "duplicate user_ids: " . $dupes->count() . "\n";
echo $dupes->count() === 0 ? "SAFE to restore unique(user_id) on rollback\n" : "WARNING: dupes would block rollback\n";

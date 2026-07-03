<?php

use App\Core\Cemetery\Actions\BulkGenerateMultiCapacityPlotsAction;
use App\Core\Cemetery\Dto\PlotDto;
use App\Core\Cemetery\Models\Plot;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Database\QueryException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

beforeEach(function () {
    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
    });

    $this->migrations = [
        require database_path('migrations/2026_06_14_000002_create_cemetery_sites_table.php'),
        require database_path('migrations/2026_06_14_000003_create_cemetery_sections_table.php'),
        require database_path('migrations/2026_06_14_000004_create_cemetery_blocks_table.php'),
        require database_path('migrations/2026_06_14_000005_create_cemetery_plots_table.php'),
    ];

    foreach ($this->migrations as $migration) {
        $migration->up();
    }
});

afterEach(function () {
    foreach (array_reverse($this->migrations) as $migration) {
        $migration->down();
    }

    Schema::dropIfExists('municipalities');
});

it('derives plot site ownership from the selected block section', function () {
    $municipalId = (string) Str::ulid();
    $siteId = (string) Str::ulid();
    $sectionId = (string) Str::ulid();
    $blockId = (string) Str::ulid();

    DB::table('municipalities')->insert(['id' => $municipalId]);
    DB::table('cemetery_sites')->insert([
        'id' => $siteId,
        'municipal_id' => $municipalId,
        'name' => 'GASAN CENTRAL CEMETERY',
    ]);
    DB::table('cemetery_sections')->insert([
        'id' => $sectionId,
        'municipal_id' => $municipalId,
        'cemetery_site_id' => $siteId,
        'name' => 'SECTION A',
    ]);
    DB::table('cemetery_blocks')->insert([
        'id' => $blockId,
        'municipal_id' => $municipalId,
        'section_id' => $sectionId,
        'name' => 'BLOCK 1',
    ]);

    $idGenerator = new class implements IdGeneratorInterface
    {
        public function generate(): string
        {
            return (string) Str::ulid();
        }
    };

    $action = new BulkGenerateMultiCapacityPlotsAction($idGenerator);
    $dto = new PlotDto(
        municipalId: $municipalId,
        blockId: $blockId,
        name: 'A-12',
        type: 'lawn_lot',
        capacity: 2,
        row: 'A',
        position: null,
        cemeterySiteId: $siteId,
        areaSqm: null,
    );

    $plot = Plot::withoutEvents(fn () => $action->execute($dto));
    $siteIds = DB::table('cemetery_plots')
        ->where('id', $plot->id)
        ->pluck('cemetery_site_id')
        ->unique()
        ->values()
        ->all();

    expect(Schema::hasColumn('cemetery_sections', 'cemetery_site_id'))->toBeTrue()
        ->and(Schema::hasColumn('cemetery_plots', 'cemetery_site_id'))->toBeTrue()
        ->and(DB::table('cemetery_plots')->count())->toBe(1)
        ->and(DB::table('cemetery_plots')->where('id', $plot->id)->value('occupancy_mode'))->toBe('shared')
        ->and($siteIds)->toBe([$siteId]);
});

it('rejects a section whose site belongs to another municipality', function () {
    $gasanId = (string) Str::ulid();
    $boacId = (string) Str::ulid();
    $boacSiteId = (string) Str::ulid();

    DB::table('municipalities')->insert([
        ['id' => $gasanId],
        ['id' => $boacId],
    ]);
    DB::table('cemetery_sites')->insert([
        'id' => $boacSiteId,
        'municipal_id' => $boacId,
        'name' => 'BOAC MUNICIPAL CEMETERY',
    ]);

    expect(fn () => DB::table('cemetery_sections')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $gasanId,
        'cemetery_site_id' => $boacSiteId,
        'name' => 'SECTION A',
    ]))->toThrow(QueryException::class);
});

it('rejects a plot whose site belongs to another municipality', function () {
    $gasanId = (string) Str::ulid();
    $boacId = (string) Str::ulid();
    $gasanSiteId = (string) Str::ulid();
    $boacSiteId = (string) Str::ulid();
    $sectionId = (string) Str::ulid();
    $blockId = (string) Str::ulid();

    DB::table('municipalities')->insert([
        ['id' => $gasanId],
        ['id' => $boacId],
    ]);
    DB::table('cemetery_sites')->insert([
        [
            'id' => $gasanSiteId,
            'municipal_id' => $gasanId,
            'name' => 'GASAN CENTRAL CEMETERY',
        ],
        [
            'id' => $boacSiteId,
            'municipal_id' => $boacId,
            'name' => 'BOAC MUNICIPAL CEMETERY',
        ],
    ]);
    DB::table('cemetery_sections')->insert([
        'id' => $sectionId,
        'municipal_id' => $gasanId,
        'cemetery_site_id' => $gasanSiteId,
        'name' => 'SECTION A',
    ]);
    DB::table('cemetery_blocks')->insert([
        'id' => $blockId,
        'municipal_id' => $gasanId,
        'section_id' => $sectionId,
        'name' => 'BLOCK 1',
    ]);

    expect(fn () => DB::table('cemetery_plots')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $gasanId,
        'cemetery_site_id' => $boacSiteId,
        'block_id' => $blockId,
        'name' => 'A-12',
        'type' => 'lawn_lot',
        'status' => 'available',
        'capacity' => 1,
    ]))->toThrow(QueryException::class);
});

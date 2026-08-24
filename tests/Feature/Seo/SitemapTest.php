<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

beforeEach(function () {
    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('name');
        $table->string('slug')->unique();
        $table->string('municipal_code')->unique();
        $table->boolean('is_active')->default(false);
        $table->softDeletes();
        $table->timestamps();
    });

    Schema::create('announcements', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('title');
        $table->text('content');
        $table->string('type');
        $table->boolean('is_published')->default(false);
        $table->softDeletes();
        $table->timestamps();
    });

    Schema::create('events', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('title');
        $table->text('description');
        $table->string('type');
        $table->timestamp('start_datetime');
        $table->timestamp('end_datetime');
        $table->string('location_name');
        $table->boolean('is_published')->default(false);
        $table->softDeletes();
        $table->timestamps();
    });
});

afterEach(function () {
    Schema::dropIfExists('events');
    Schema::dropIfExists('announcements');
    Schema::dropIfExists('municipalities');
});

it('lists active municipality pages and only published public content', function () {
    $gasanId = (string) Str::ulid();
    $inactiveId = (string) Str::ulid();
    $publishedAnnouncementId = (string) Str::ulid();
    $draftAnnouncementId = (string) Str::ulid();
    $publishedEventId = (string) Str::ulid();

    DB::table('municipalities')->insert([
        municipalityRow($gasanId, 'Gasan', 'gasan-4905', '4905', true),
        municipalityRow($inactiveId, 'Inactive Town', 'inactive-0000', '0000', false),
    ]);

    DB::table('announcements')->insert([
        announcementRow($publishedAnnouncementId, $gasanId, true),
        announcementRow($draftAnnouncementId, $gasanId, false),
    ]);

    DB::table('events')->insert(eventRow($publishedEventId, $gasanId, true));

    $response = $this->get(route('sitemap'));

    $response->assertOk()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
        ->assertSee(route('home', ['municipality' => 'gasan-4905']), false)
        ->assertSee(route('government.roster', ['municipality' => 'gasan-4905']), false)
        ->assertSee(route('transparency.index', ['municipality' => 'gasan-4905']), false)
        ->assertSee(route('feedback.create', ['municipality' => 'gasan-4905']), false)
        ->assertSee(route('announcement.show', ['municipality' => 'gasan-4905', 'announcement' => $publishedAnnouncementId]), false)
        ->assertSee(route('event.show', ['municipality' => 'gasan-4905', 'event' => $publishedEventId]), false)
        ->assertDontSee('inactive-0000', false)
        ->assertDontSee($draftAnnouncementId, false);
});

function municipalityRow(string $id, string $name, string $slug, string $code, bool $active): array
{
    return [
        'id' => $id,
        'name' => $name,
        'slug' => $slug,
        'municipal_code' => $code,
        'is_active' => $active,
        'created_at' => now(),
        'updated_at' => now(),
    ];
}

function announcementRow(string $id, string $municipalId, bool $published): array
{
    return [
        'id' => $id,
        'municipal_id' => $municipalId,
        'title' => 'Municipal announcement',
        'content' => 'Public information.',
        'type' => 'general',
        'is_published' => $published,
        'created_at' => now(),
        'updated_at' => now(),
    ];
}

function eventRow(string $id, string $municipalId, bool $published): array
{
    return [
        'id' => $id,
        'municipal_id' => $municipalId,
        'title' => 'Municipal event',
        'description' => 'Community gathering.',
        'type' => 'community',
        'start_datetime' => now()->addDay(),
        'end_datetime' => now()->addDay()->addHour(),
        'location_name' => 'Town Plaza',
        'is_published' => $published,
        'created_at' => now(),
        'updated_at' => now(),
    ];
}

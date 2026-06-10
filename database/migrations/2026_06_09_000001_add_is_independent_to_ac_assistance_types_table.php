<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Marks an assistance program as "independent" for cooldown purposes.
 *
 * Default false → the program participates in the cross-program lockout: an
 * active cooldown from it blocks every other program, and any other program's
 * cooldown blocks it (the standard MSWD anti-stacking rule).
 *
 * true → the program is evaluated in isolation. Its cooldowns never block other
 * programs, and other programs' cooldowns never block it; it only cools down
 * itself. Burial Assistance is independent: a death is an emergency that must
 * not be gated by an unrelated medical/educational cooldown, and receiving
 * burial aid must not freeze the family out of every other program.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('ac_assistance_types', function (Blueprint $table) {
            $table->boolean('is_independent')
                ->default(false)
                ->after('cooldown_scope');
        });
    }

    public function down(): void
    {
        Schema::table('ac_assistance_types', function (Blueprint $table) {
            $table->dropColumn('is_independent');
        });
    }
};

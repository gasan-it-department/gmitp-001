<?php

namespace Database\Seeders;

use Illuminate\Support\Str;
use App\Core\Users\Models\User;
use Illuminate\Database\Seeder;
use App\Core\Users\Enums\EnumRoles;
use Illuminate\Support\Facades\Hash;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $municipalities = Municipality::all();

        $randomMunicipal = $municipalities->random();


        $admin = User::firstOrCreate([

            'id' => Str::ulid(),

            'municipal_id' => $randomMunicipal->id,

            'first_name' => 'harvey',

            'last_name' => 'orencio',

            'phone' => '09271725761',

            'email' => 'layrart8@gmail.com',

            'user_name' => 'oneman',

            'email_verified_at' => now(),

            'phone_verified_at' => now(),

            'password' => Hash::make('capstone'),

        ]);

        $admin->syncRoles(EnumRoles::ADMIN->value);

    }
}

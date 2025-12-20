<?php

namespace Database\Seeders;

use Illuminate\Support\Str;
use App\Core\Users\Models\User;
use Illuminate\Database\Seeder;
use App\Core\Users\Enums\EnumRoles;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $admin = User::firstOrCreate([

            'id' => Str::ulid(),

            'first_name' => 'harvey',

            'last_name' => 'orencio',

            'phone' => '09271725761',

            'email' => 'layrart8@gmail.com',

            'user_name' => 'harvey',

            'email_verified_at' => now(),

            'phone_verified_at' => now(),

            'password' => Hash::make('capstone'),

        ]);

        $admin->syncRoles(EnumRoles::ADMIN->value);

    }
}

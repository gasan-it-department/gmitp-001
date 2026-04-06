<?php

namespace Database\Seeders;

use Illuminate\Support\Str;
use App\Core\Users\Models\User;
use Illuminate\Database\Seeder;
use App\Core\Users\Enums\EnumRoles;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $superAdmin = User::firstOrCreate(

            ['user_name' => 'super_admin'],

            [
                'id' => Str::ulid(),
                'first_name' => 'super',
                'last_name' => 'admin',
                'phone' => '+639994587693',
                'phone_verified_at' => now(),
                'email' => 'gasanmarinduque.itdepartment@gmail.com',
                'email_verified_at' => now(),
                'password' => Hash::make('capstone'),
            ]

        );

        $superAdmin->syncRoles(EnumRoles::SUPER_ADMIN->value);
        $this->command->info('Super Admin created! Username: super_admin | Password: password');

    }
}

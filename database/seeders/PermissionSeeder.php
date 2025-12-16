<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Core\Users\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [

            'action_center.access',

            'bulletin_board.access',

            'community_report.access',

            'feedback.access',

            'municipality.access',

            'public_information.access',

            'tourism.access',

            'users.access',

        ];

        foreach ($permissions as $permission) {

            Permission::firstOrCreate(['name' => $permission]);

        }


    }
}

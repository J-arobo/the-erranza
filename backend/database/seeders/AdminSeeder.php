<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@erranza.com'],
            [
                'name' => 'Erranza Admin',
                'password' => Hash::make('password'),
                'active_role' => 'admin',
            ]
        );

        $adminRole = Role::where('name', 'admin')->first();
        $admin->roles()->syncWithoutDetaching($adminRole);

        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@erranza.com'],
            [
                'name' => 'Erranza Super Admin',
                'password' => Hash::make('password'),
                'active_role' => 'super_admin',
            ]
        );

        $superAdminRole = Role::where('name', 'super_admin')->first();
        $superAdmin->roles()->syncWithoutDetaching($superAdminRole);
    }
}

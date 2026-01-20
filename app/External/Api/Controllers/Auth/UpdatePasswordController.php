<?php

namespace App\External\Api\Controllers\Auth;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UpdatePasswordController extends Controller
{

    public function __invoke(Request $request)
    {

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],

            'password' => ['required', 'confirmed', 'min:8', 'max:100']
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password'])
        ]);

        //check the app.php for the logging out of other devices
        Auth::guard('web')->logoutOtherDevices($validated['password']);

        return back()->with('success', 'Password updated successfully');

    }

}
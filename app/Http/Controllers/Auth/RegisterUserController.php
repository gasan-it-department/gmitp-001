<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Domains\Users\Services\UserService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules;
use Inertia\Response;
class RegisterUserController extends Controller
{


    public function __construct(protected UserService $userService)
    {
        // You can inject any dependencies here, like UserRepository
    }

    public function showRegisterUserPage()
    {
        return Inertia::render('Auth/Register', [
            'title' => 'Register User',
            'description' => 'Create a new user account to access the system.',
            'breadcrumbs' => [
                ['name' => 'Home', 'url' => route('homePage')],
                ['name' => 'Register', 'url' => route('register')],
            ],
            // 'formAction' => route('registerUser'),
            // 'formMethod' => 'POST',
            // Add any additional data needed for the registration form
        ]);
    }

    public function store(Request $request)
    {

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'required|string|max:255',
            'age' => 'required|integer|min:0|max:120',
            'gender' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'phone' => 'required|string|max:15',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = $this->userService->create($validated);

        Auth::login($user);
        return response()->json($user, 201);
    }


}
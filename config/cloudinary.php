<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cloudinary Configuration
    |--------------------------------------------------------------------------
    |
    | You can either define CLOUDINARY_URL directly in your .env file, or
    | specify individual parameters (cloud name, API key, and secret).
    |
    */

    // Preferred: single environment URL
    'url' => env('CLOUDINARY_URL'),

    // Optional: individual credentials (used if CLOUDINARY_URL is missing)
    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
    'api_key' => env('CLOUDINARY_API_KEY'),
    'api_secret' => env('CLOUDINARY_API_SECRET'),
    'secure' => env('CLOUDINARY_SECURE', true),
];

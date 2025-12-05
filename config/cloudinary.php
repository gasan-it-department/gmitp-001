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
    'cloud_url' => env('CLOUDINARY_URL'),

    // The specific cloud name (Used by your Model Accessors for URLs)
    // FIX: If CLOUDINARY_CLOUD_NAME is null, try to parse it from the URL
    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),

    // Optional: individual credentials
    'api_key' => env('CLOUDINARY_API_KEY'),

    'api_secret' => env('CLOUDINARY_API_SECRET'),
];

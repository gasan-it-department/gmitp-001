<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="google-site-verification" content="bV3o6QYQKQGhFbpg7Bxh13Yi1vmbAS78lmmh231fn-k">

    {{-- Detect system theme --}}
    <script>
        (function () {
            // Note: If you want 'system' to default to 'dark' when the user's OS is dark, 
            // you should check for 'prefers-color-scheme: dark' and add 'dark' to documentElement,
            // not 'light' as was in the original snippet.
            // const appearance = '{{ $appearance ?? 'system' }}';
            // if (appearance === 'system') {
            //     const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            //     if (prefersDark) {
            //         document.documentElement.classList.add('dark');
            //     } else {
            //         document.documentElement.classList.add('light');
            //     }
            // } else if (appearance === 'dark') {
            //     document.documentElement.classList.add('dark');
            // } else {
            //     document.documentElement.classList.add('light');
            // }
            document.documentElement.classList.add('light');
        })();
    </script>

    <style>
        /* Base background styles for light/dark mode */
        html {
            background-color: oklch(1 0 0);
            /* Light/White background */
        }

        html.dark {
            background-color: oklch(0.145 0 0);
            /* Dark background */
        }

        /* NProgress Bar: Set color to match the orange-to-red gradient */
        #nprogress .bar {
            /* Using the gradient from your sidebar's "Exit Admin" button */
            background: linear-gradient(to right, #f97316, #ef4444) !important;
            height: 5px !important;
            /* Adjust thickness (e.g., 3px) */
        }

        /* NProgress Peg: The small glow effect at the end of the bar */
        #nprogress .peg {
            /* Use a solid orange to match the start of the gradient */
            box-shadow: 0 0 10px #f97316, 0 0 5px #f97316 !important;
        }

        /* NProgress Spinner (if enabled in JS): Style the rotating icon */
        #nprogress .spinner-icon {
            border-top-color: #f97316 !important;
            border-left-color: #f97316 !important;
        }
    </style>

    {{-- ✅ FAVICONS --}}
    <link rel="icon" type="image/png" sizes="48x48" href="{{ asset('favicon-48x48.png') }}">
    <link rel="icon" type="image/png" sizes="96x96" href="{{ asset('favicon-96x96.png') }}">
    <link rel="shortcut icon" type="image/png" href="{{ asset('favicon-48x48.png') }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}">
    {{--
    <link rel="manifest" href="{{ asset('site.webmanifest') }}"> --}}
    <meta name="theme-color" content="#f97316" />

    {{-- ✅ Fonts --}}
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet">
    <link
        href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&family=Poppins:wght@300;400;500&display=swap"
        rel="stylesheet">

    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>

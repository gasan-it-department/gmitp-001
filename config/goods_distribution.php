<?php

return [
    'document_disk' => env('GOODS_DISTRIBUTION_DOCUMENT_DISK', env('MEDIA_DISK', env('FILESYSTEM_DISK', 'public'))),
];

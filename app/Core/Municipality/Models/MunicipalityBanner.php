<?php

namespace App\Core\Municipality\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MunicipalityBanner extends Model
{

    // protected $table = 'municipality_banners';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [

        'id',

        'public_id',

        'municipal_id',

        'position',

        'user_id',

    ];

    public function getBannerUrlAttribute(): ?string
    {
        if (!$this->public_id)
            return null;

        // Optimized for Banner size (1920x960), auto format, smart cropping
        return "https://res.cloudinary.com/" . config('cloudinary.cloud_name') .
            "/image/upload/f_auto,q_auto,w_1920,h_960,c_fill/" .
            $this->public_id;
    }

    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class, 'municipal_id');
    }
}
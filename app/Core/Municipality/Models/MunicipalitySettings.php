<?php

namespace App\Core\Municipality\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class MunicipalitySettings extends Model
{

    // protected $table = 'municipality_settings';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [

        'id',

        'municipal_id',

        'user_id',

        'logo_public_id',

    ];

    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo_public_id) {
            return null;
        }

        // We add ?t= and the updated_at timestamp. 
        // When the row updates, the 't' changes, and the browser refreshes the image.
        $timestamp = $this->updated_at ? $this->updated_at->timestamp : time();

        return "https://res.cloudinary.com/" . config('cloudinary.cloud_name') .
            "/image/upload/f_auto,q_auto,w_500,c_limit/" .
            $this->logo_public_id .
            "?t=" . $timestamp;

    }

    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class, 'municipal_id');
    }

}
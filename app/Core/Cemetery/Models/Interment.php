<?php

namespace App\Core\Cemetery\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Interment extends Model
{
    use SoftDeletes;

    protected $table = 'cemetery_interments';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'decedent_id',
        'plot_id',
        'status',
        'interment_date',
    ];

    protected $casts = [
        'interment_date' => 'date',
    ];

    public function decedent(): BelongsTo
    {
        return $this->belongsTo(Decedent::class, 'decedent_id');
    }

    public function plot(): BelongsTo
    {
        return $this->belongsTo(Plot::class, 'plot_id');
    }
}

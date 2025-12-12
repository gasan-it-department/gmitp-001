<?php

namespace App\Core\PublicInformation\Models;

use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Procurement extends Model
{
    use HasUlids; // Automatically generates the ULID on creation

    protected $table = 'procurements';

    // HasUlids trait usually handles these, but keeping them is fine
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [

        'id',

        'user_id',

        'municipal_id',

        'reference_number',

        'title',

        'category',

        'status',

        'approved_budget',

        'contract_amount',

        'winning_bidder',

        'pre_bid_date',

        'closing_date',

        'award_date',

    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        // Cast money to float (or 'decimal:2') so you can do math easily
        'approved_budget' => 'float',
        'contract_amount' => 'float',

        // Cast dates to Carbon instances so you can format them (e.g., ->format('M d, Y'))
        'pre_bid_date' => 'datetime',
        'closing_date' => 'datetime',
        'award_date' => 'datetime',
    ];

    public function files(): HasMany
    {
        return $this->hasMany(ProcurementFile::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

}
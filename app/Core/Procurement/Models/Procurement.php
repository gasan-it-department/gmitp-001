<?php

namespace App\Core\Procurement\Models;

use App\Core\Department\Models\Department;
use App\Core\Municipality\Models\Municipality;
use App\Core\Procurement\Enums\ProcurementCategory;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Models\ProcurementDocument;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Procurement extends Model
{
    use HasUlids, SoftDeletes; // Automatically generates the ULID on creation

    protected $table = 'procurements';

    // HasUlids trait usually handles these, but keeping them is fine
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [

        'id',

        'created_by',

        'municipal_id',

        'department_id',

        'funding_source_id',

        'reference_number',

        'title',

        'description',

        'abc_amount',

        'contract_amount',

        'category',

        'status',

        'notes',

        'published_at',

        'pre_bid_date',

        'closing_date',

        'award_date',

        'winning_bidder',

    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        // Cast money to float (or 'decimal:2') so you can do math easily
        'abc_amount' => 'float',
        'contract_amount' => 'float',
        'status' => ProcurementStatus::class,
        'category' => ProcurementCategory::class,
        // Cast dates to Carbon instances so you can format them (e.g., ->format('M d, Y'))
        'published_at' => 'datetime',
        'pre_bid_date' => 'datetime',
        'closing_date' => 'datetime',
        'award_date' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function documents(): HasMany
    {
        return $this->hasMany(ProcurementDocument::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function fundingSource()
    {
        return $this->belongsTo(ProcurementFundingSource::class, 'funding_source_id');
    }

    public function municipality()
    {
        return $this->belongsTo(Municipality::class, 'municipal_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }
}
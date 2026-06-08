<?php

namespace App\Core\Procurement\Models;

use App\Core\Department\Models\Department;
use App\Core\Municipality\Models\Municipality;
use App\Core\Procurement\Enums\ProcurementCategory;
use App\Core\Procurement\Enums\ProcurementDocumentType;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Procurement extends Model implements HasMedia
{
    use HasUlids, SoftDeletes, LogsActivity, InteractsWithMedia; // Automatically generates the ULID on creation

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
        'custom_funding_source',
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
        'awarded_date',
        'winning_bidder_name',
        'failure_reason',
        'failed_date'
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
        'awarded_date' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
    public function registerMediaCollections(): void
    {
        $disk = config('filesystems.disks.procurement', config('filesystems.default'));

        foreach (ProcurementDocumentType::cases() as $type) {
            $this->addMediaCollection($type->value)
                ->useDisk($disk)
                ->acceptsMimeTypes(['application/pdf']); // FR-2.2
        }
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
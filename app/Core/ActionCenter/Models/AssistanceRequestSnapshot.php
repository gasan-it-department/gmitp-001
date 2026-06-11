<?php

namespace App\Core\ActionCenter\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssistanceRequestSnapshot extends Model
{
    use HasUlids;

    protected $table = 'ac_assistance_request_snapshots';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'assistance_request_id',
        'first_name',
        'last_name',
        'middle_name',
        'suffix',
        'sex',
        'birth_date',
        'educational_attainment',
        'religion',
        'civil_status',
        'occupation',
        'monthly_income',
        'household_total_income',
        'barangay',
        'barangay_psgc_code',
        'street',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'monthly_income' => 'decimal:2',
        'household_total_income' => 'decimal:2',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(AssistanceRequest::class, 'assistance_request_id');
    }
}

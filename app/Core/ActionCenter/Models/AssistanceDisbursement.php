<?php

namespace App\Core\ActionCenter\Models;

use App\Core\ActionCenter\Enums\AssistanceDisbursementMethod;
use App\Core\ActionCenter\Enums\AssistanceDisbursementStatus;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssistanceDisbursement extends Model
{
    use HasUlids;

    protected $table = 'ac_assistance_disbursements';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $guarded = [];

    protected $casts = [
        'method' => AssistanceDisbursementMethod::class,
        'status' => AssistanceDisbursementStatus::class,
        'amount' => 'decimal:2',
        'instrument_date' => 'date',
        'prepared_at' => 'datetime',
        'ready_at' => 'datetime',
        'notification_attempts' => 'integer',
        'notification_attempted_at' => 'datetime',
        'notification_sent_at' => 'datetime',
        'released_at' => 'datetime',
        'identity_checked_at' => 'datetime',
        'acknowledgement_signed_at' => 'datetime',
        'voided_at' => 'datetime',
        'metadata' => 'array',
    ];

    protected static function booted(): void
    {
        static::updating(function (self $disbursement): void {
            $original = AssistanceDisbursementStatus::tryFrom((string) $disbursement->getRawOriginal('status'));

            if (in_array($original, [AssistanceDisbursementStatus::Released, AssistanceDisbursementStatus::Voided], true)) {
                throw new \DomainException('Released and voided disbursements are immutable.');
            }

            if ($original === AssistanceDisbursementStatus::Ready
                && $disbursement->status !== AssistanceDisbursementStatus::Released
                && $disbursement->status !== AssistanceDisbursementStatus::Voided
                && $disbursement->isDirty()) {
                $allowed = [
                    'notification_status',
                    'notification_phone',
                    'notification_message',
                    'notification_attempts',
                    'notification_attempted_at',
                    'notification_sent_at',
                    'notification_failure',
                    'metadata',
                    'updated_at',
                ];

                if (array_diff(array_keys($disbursement->getDirty()), $allowed) !== []) {
                    throw new \DomainException('A ready disbursement is locked. Void it before making corrections.');
                }
            }
        });
    }

    public function assistanceRequest(): BelongsTo
    {
        return $this->belongsTo(AssistanceRequest::class, 'assistance_request_id');
    }

    public function preparedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'prepared_by_user_id');
    }

    public function readyBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ready_by_user_id');
    }

    public function releasedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'released_by_user_id');
    }

    public function voidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by_user_id');
    }
}

<?php

namespace App\Core\SupportTicket\Models;

use App\Core\SupportTicket\Enums\TicketAudience;
use App\Core\SupportTicket\Enums\TicketCategory;
use App\Core\SupportTicket\Enums\TicketPriority;
use App\Core\SupportTicket\Enums\TicketStatus;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class SupportTicket extends Model implements HasMedia
{
    use HasFactory, HasUlids, InteractsWithMedia, LogsActivity, SoftDeletes;

    protected $table = 'support_tickets';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'municipal_id',
        'user_id',
        'reference_no',
        'audience',
        'category',
        'priority',
        'status',
        'subject',
        'description',
        'contact_name',
        'contact_email',
        'contact_number',
        'page_url',
        'app_version',
        'environment',
        'acknowledged_at',
        'in_progress_at',
        'resolved_at',
        'closed_at',
        'reopened_at',
        'acknowledged_by',
        'assigned_to',
        'resolved_by',
        'closed_by',
        'resolution_note',
    ];

    protected $casts = [
        'audience' => TicketAudience::class,
        'category' => TicketCategory::class,
        'priority' => TicketPriority::class,
        'status' => TicketStatus::class,
        'contact_name' => 'encrypted',
        'contact_email' => 'encrypted',
        'contact_number' => 'encrypted',
        'environment' => 'array',
        'acknowledged_at' => 'datetime',
        'in_progress_at' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
        'reopened_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function acknowledgedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function closedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(SupportTicketReply::class, 'ticket_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'audience',
                'category',
                'priority',
                'status',
                'subject',
                'description',
                'assigned_to',
                'acknowledged_at',
                'in_progress_at',
                'resolved_at',
                'closed_at',
                'reopened_at',
                'acknowledged_by',
                'resolved_by',
                'closed_by',
                'resolution_note',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('support_ticket');
    }

    public function activities()
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('support_ticket_attachments')
            ->acceptsMimeTypes([
                'image/jpeg',
                'image/png',
                'image/webp',
            ]);
    }
}

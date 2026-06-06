<?php

namespace App\Core\SupportTicket\Models;

use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class SupportTicketReply extends Model implements HasMedia
{
    use HasFactory, HasUlids, InteractsWithMedia, LogsActivity, SoftDeletes;

    protected $table = 'support_ticket_replies';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'ticket_id',
        'user_id',
        'is_staff',
        'body',
    ];

    protected $casts = [
        'is_staff' => 'boolean',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(SupportTicket::class, 'ticket_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'ticket_id',
                'is_staff',
                'body',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('support_ticket_reply');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('support_ticket_reply_attachments')
            ->acceptsMimeTypes([
                'image/jpeg',
                'image/png',
                'image/webp',
            ]);
    }
}

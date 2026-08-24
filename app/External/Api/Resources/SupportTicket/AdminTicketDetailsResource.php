<?php

namespace App\External\Api\Resources\SupportTicket;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Admin-facing detail payload. Extends the list shape with description,
 * contact details, technical context (bug reports), attachments (signed S3
 * URLs), the reply thread, lifecycle timestamps, and the activitylog audit.
 *
 * Lifecycle timestamps are exposed raw so the frontend can compose a
 * tracking-trail timeline client-side.
 */
class AdminTicketDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'reference_no' => $this->reference_no,
            'audience'     => [
                'value' => $this->audience->value,
                'label' => $this->audience->label(),
            ],
            'category'     => [
                'value' => $this->category->value,
                'label' => $this->category->label(),
            ],
            'priority'     => [
                'value' => $this->priority->value,
                'label' => $this->priority->label(),
            ],
            'status'       => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
            ],
            'subject'      => $this->subject,
            'description'  => $this->description,

            'requester'    => $this->whenLoaded('user', fn () => $this->user ? [
                'id'        => $this->user->id,
                'full_name' => $this->user->full_name,
            ] : null),

            // Contact info (decrypted on read) — primarily for guest tickets.
            'contact_name'   => $this->contact_name,
            'contact_email'  => $this->contact_email,
            'contact_number' => $this->contact_number,

            // Technical context for bug reports.
            'page_url'     => $this->page_url,
            'app_version'  => $this->app_version,
            'environment'  => $this->environment,

            'assigned_to'     => $this->assigned_to,
            'resolution_note' => $this->resolution_note,

            'created_at'      => $this->created_at?->format('M d, Y g:i A'),
            'acknowledged_at' => $this->acknowledged_at?->format('M d, Y g:i A'),
            'in_progress_at'  => $this->in_progress_at?->format('M d, Y g:i A'),
            'resolved_at'     => $this->resolved_at?->format('M d, Y g:i A'),
            'closed_at'       => $this->closed_at?->format('M d, Y g:i A'),
            'reopened_at'     => $this->reopened_at?->format('M d, Y g:i A'),

            'attachments' => $this->getMedia('support_ticket_attachments')->map(fn ($m) => [
                'id'        => $m->id,
                'name'      => $m->file_name,
                'mime_type' => $m->mime_type,
                'size'      => $m->size,
                'url'       => $m->disk === 's3'
                    ? $m->getTemporaryUrl(now()->addMinutes(15))
                    : $m->getUrl(),
            ])->values(),

            'replies' => $this->whenLoaded(
                'replies',
                fn () => TicketReplyResource::collection($this->replies)->resolve($request),
            ),

            'audit_log' => $this->whenLoaded('activities', fn () => $this->activities->map(fn ($a) => [
                'id'          => $a->id,
                'event'       => $a->event,
                'description' => $a->description,
                'properties'  => $a->properties,
                'causer_id'   => $a->causer_id,
                'created_at'  => $a->created_at?->format('M d, Y g:i A'),
            ])->values()),
        ];
    }
}

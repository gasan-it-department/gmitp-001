<?php

namespace App\External\Web\Controllers\SupportTicket\Client;

use App\Core\SupportTicket\Models\SupportTicket;
use App\External\Api\Resources\SupportTicket\TicketReplyResource;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ShowTicketController extends Controller
{
    /**
     * Display a single ticket for the requester — strictly scoped by tenant
     * + owner. No Action/DTO layer (CQRS read side): the Eloquent query lives
     * here.
     */
    public function __invoke(string $municipal, string $support_ticket): Response
    {
        $ticket = SupportTicket::query()
            ->with([
                'media',
                'replies' => fn ($q) => $q->orderBy('created_at')->with(['user:id,first_name,last_name', 'media']),
            ])
            ->where('municipal_id', app('municipal_id'))
            ->where('user_id', Auth::id())
            ->whereKey($support_ticket)
            ->firstOrFail();

        $attachments = $ticket->getMedia('support_ticket_attachments')->map(fn ($m) => [
            'id'        => $m->id,
            'name'      => $m->file_name,
            'size'      => $m->size,
            'mime_type' => $m->mime_type,
            'url'       => $m->disk === 's3'
                ? $m->getTemporaryUrl(now()->addMinutes(15))
                : $m->getUrl(),
        ])->values();

        $timeline = [
            [
                'key'         => 'submitted',
                'label'       => 'Submitted',
                'description' => 'Ticket received.',
                'at'          => $ticket->created_at?->format('M d, Y g:i A'),
                'reached'     => true,
            ],
            [
                'key'         => 'acknowledged',
                'label'       => 'Acknowledged',
                'description' => 'Reviewed by support staff.',
                'at'          => $ticket->acknowledged_at?->format('M d, Y g:i A'),
                'reached'     => $ticket->acknowledged_at !== null,
            ],
            [
                'key'         => 'in_progress',
                'label'       => 'In Progress',
                'description' => 'Support staff is working on it.',
                'at'          => $ticket->in_progress_at?->format('M d, Y g:i A'),
                'reached'     => $ticket->in_progress_at !== null,
            ],
            [
                'key'         => 'resolved',
                'label'       => 'Resolved',
                'description' => 'A resolution has been provided.',
                'at'          => $ticket->resolved_at?->format('M d, Y g:i A'),
                'reached'     => $ticket->resolved_at !== null,
            ],
            [
                'key'         => 'closed',
                'label'       => 'Closed',
                'description' => 'Ticket closed.',
                'at'          => $ticket->closed_at?->format('M d, Y g:i A'),
                'reached'     => $ticket->closed_at !== null,
            ],
        ];

        return Inertia::render('SupportTicket/Client/Show', [
            'ticket' => [
                'id'           => $ticket->id,
                'reference_no' => $ticket->reference_no,
                'category'     => ['value' => $ticket->category->value, 'label' => $ticket->category->label()],
                'priority'     => ['value' => $ticket->priority->value, 'label' => $ticket->priority->label()],
                'status'       => ['value' => $ticket->status->value, 'label' => $ticket->status->label()],
                'subject'      => $ticket->subject,
                'description'  => $ticket->description,
                'created_at'   => $ticket->created_at?->format('M d, Y g:i A'),
            ],
            'attachments' => $attachments,
            'replies'     => TicketReplyResource::collection($ticket->replies)->resolve(),
            'timeline'    => $timeline,
        ]);
    }
}

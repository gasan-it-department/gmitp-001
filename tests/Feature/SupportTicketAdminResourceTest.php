<?php

use App\Core\SupportTicket\Models\SupportTicket;
use App\Core\SupportTicket\Models\SupportTicketReply;
use App\External\Api\Resources\SupportTicket\AdminTicketDetailsResource;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

it('serializes admin ticket replies as a plain array', function () {
    $reply = new SupportTicketReply([
        'id' => '01M09RSAQMMD1Y66C9CNYC1AHR',
        'ticket_id' => '01M09RSAQMMD1Y66C9CNYC1AHN',
        'is_staff' => true,
        'body' => 'The issue has been reviewed.',
    ]);
    $reply->created_at = Carbon::parse('2026-08-20 09:00:00');
    $reply->setRelation('user', null);
    $reply->setRelation('media', collect());

    $ticket = new SupportTicket([
        'id' => '01M09RSAQMMD1Y66C9CNYC1AHN',
        'reference_no' => 'ST-000001',
        'audience' => 'citizen',
        'category' => 'bug',
        'priority' => 'normal',
        'status' => 'open',
        'subject' => 'Page error',
        'description' => 'The page does not load.',
    ]);
    $ticket->created_at = Carbon::parse('2026-08-20 08:00:00');
    $ticket->setRelation('user', null);
    $ticket->setRelation('media', collect());
    $ticket->setRelation('replies', collect([$reply]));
    $ticket->setRelation('activities', collect());

    $payload = (new AdminTicketDetailsResource($ticket))
        ->resolve(Request::create('/'));
    $serializedReplies = json_decode(
        json_encode($payload['replies'], JSON_THROW_ON_ERROR),
        true,
        flags: JSON_THROW_ON_ERROR,
    );

    expect($payload['replies'])
        ->toBeArray()
        ->toHaveCount(1)
        ->and($payload['replies'][0]['id'])->toBe($reply->id)
        ->and($serializedReplies[0]['attachments'])->toBeArray();
});

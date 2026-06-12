<?php

namespace App\External\Api\Resources\Feedback;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeedbackResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject' => $this->subject,
            'message' => $this->message,
            'rating' => $this->rating,
            'is_anonymous' => (bool) $this->is_anonymous,
            'citizen_name' => $this->is_anonymous ? null : $this->citizen_name,
            'employee_name' => $this->employee_name,
            'department' => $this->whenLoaded('department', fn() => $this->department ? [
                'id' => $this->department->id,
                'name' => $this->department->name,
            ] : null),
            'attachments' => $this->getMedia('attachments')->map(fn($media) => [
                'id' => $media->id,
                'name' => $media->file_name,
                'mime_type' => $media->mime_type,
                'size' => $media->size,
                'view_url' => $media->disk === 's3'
                    ? $media->getTemporaryUrl(now()->addMinutes(15), (str_starts_with($media->mime_type ?? '', 'image/') && $media->hasGeneratedConversion('optimized_logo')) ? 'optimized_logo' : '')
                    : $media->getUrl((str_starts_with($media->mime_type ?? '', 'image/') && $media->hasGeneratedConversion('optimized_logo')) ? 'optimized_logo' : ''),
                'download_url' => $media->disk === 's3'
                    ? $media->getTemporaryUrl(now()->addMinutes(15))
                    : $media->getUrl(),
            ])->values(),
            'created_at' => $this->created_at?->format('M d, Y'),
        ];
    }
}

<?php

// namespace App\Core\ActionCenter\Models;

// use Illuminate\Database\Eloquent\Concerns\HasUlids;
// use Illuminate\Database\Eloquent\Model;
// use Illuminate\Database\Eloquent\Relations\BelongsTo;
// use Illuminate\Database\Eloquent\SoftDeletes;

// class AssistanceRequestFile extends Model
// {
//     use HasUlids, SoftDeletes;

//     protected $table = 'ac_assistance_request_files';
//     protected $keyType = 'string';
//     public $incrementing = false;

//     protected $fillable = [
//         'assistance_request_id',
//         'document_type',
//         'public_id',
//         'mime_type',
//         'resource_type',
//         'original_name',
//         'file_size',
//     ];

//     protected $casts = [
//         'file_size' => 'integer',
//     ];

//     public function assistanceRequest(): BelongsTo
//     {
//         return $this->belongsTo(AssistanceRequest::class, 'assistance_request_id');
//     }
// }

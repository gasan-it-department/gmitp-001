<?php

namespace App\Core\ActionCenter\Requests\Repositories;

use Illuminate\Support\Str;
use App\Core\ActionCenter\Requests\Models\AssistanceRequestFile;

class AssistanceRequestFilesRepositories
{

    public function create(array $data, string $assistanceId)
    {

        return AssistanceRequestFile::create([

            'id' => (string) Str::ulid(),

            'assistance_request_id' => $assistanceId,

            'public_id' => $data['public_id'],

            'resource_type' => $data['resource_type'],

            'mime_type' => $data['mime_type'],

            'file_size' => $data['file_size'],

        ]);

    }

    public function getByRequestId(string $requestId)
    {

        return AssistanceRequestFile::where('assistance_request', $requestId)->get();

    }

    public function delete(string $fileId)
    {

        return AssistanceRequestFile::where('id', $fileId)->delete();

    }

}
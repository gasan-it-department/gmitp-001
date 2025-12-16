<?php

namespace App\Core\CommunityReport\Dto;

use Illuminate\Http\Request;

class RejectReportDto
{

    public function __construct(

        public readonly string $reportId,

        public readonly string $municipalId,

        public readonly string $remarks,

    ) {
    }


    public static function fromRequest(Request $request, $reportId)
    {

        return new self(

            reportId: $reportId,

            municipalId: app('municipal_id'),

            remarks: $request->get('remarks')

        );

    }
}
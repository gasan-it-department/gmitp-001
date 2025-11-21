<?php

namespace App\External\Api\Controllers\CitizenReport;

use App\External\Api\Request\CitizenReport\CitizenReportRequest;
use App\Http\Controllers\Controller;

class CitizenReportController extends Controller
{
    public function store(CitizenReportRequest $request)
    {

        dd($request);
        $municipalId = app('municipal_id');

        $validated = $request->validated();

        dd($validated, $municipalId);



    }

    public function fetch()
    {

    }

    public function update()
    {

    }

    public function destroy()
    {

    }
}
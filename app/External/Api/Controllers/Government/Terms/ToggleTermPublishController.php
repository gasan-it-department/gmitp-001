<?php

namespace App\External\Api\Controllers\Government\Terms;

use App\Core\Government\Models\Term;
use App\Http\Controllers\Controller;

class ToggleTermPublishController extends Controller
{
    //can improve later adds up usecase following the pattern

    public function __construct()
    {
    }
    public function __invoke(string $id)
    {

        $term = Term::where('municipal_id', app('municipal_id'))
            ->findOrFail($id);

        $term->update([
            'is_published' => !$term->is_published,
        ]);

        $status = $term->is_published ? 'published' : 'hidden';

        return back()->with('success', "The term roster is now {$status}.");
    }

}
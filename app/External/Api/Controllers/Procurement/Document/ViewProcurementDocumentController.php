<?php


namespace App\External\Api\Controllers\Procurement\Document;

use App\Core\Procurement\Models\ProcurementDocument;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;

class ViewProcurementDocumentController extends Controller
{
    public function __invoke(string $id)
    {
        // 1. Find the document in your database (and check if the user has permission!)
        $document = ProcurementDocument::findOrFail($id);

        // 2. Generate a temporary URL valid for 5 minutes
        $temporaryUrl = Storage::disk('s3')->temporaryUrl(
            $document->file_path, // e.g., 'procurement/request_123.pdf'
            now()->addMinutes(5)
        );
        // return Storage::disk('s3')->response($document->file_path);
        // 3. Send this URL to your frontend (React, Vue, or Blade)
        return response()->json([
            'url' => $temporaryUrl
        ]);
    }
}
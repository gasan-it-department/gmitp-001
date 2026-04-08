<?php

namespace App\Core\Procurement\Repositories;

use App\Core\Procurement\Models\ProcurementDocument;

class ProcurementDocumentRepository
{

    public function findById(string $id): ?ProcurementDocument
    {
        return ProcurementDocument::findOrFail($id);
    }

    public function delete(string $id): bool
    {
        return ProcurementDocument::where('id', $id)->delete();
    }

}
<?php

namespace App\Core\Procurement\Policy;

use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Models\ProcurementDocument;
use App\Core\Users\Models\User;

class ProcurementDocumentPolicy
{
    /**
     * Determine if the user (or guest) can download the document.
     */
    public function download(?User $user, ProcurementDocument $document): bool
    {
        $procurement = $document->procurement; // Assuming you have this relationship

        // 1. Municipal Admins/Staff can always download everything
        // Adjust this check based on how your roles are set up
        if ($user && $user->role === 'admin' && $user->municipal_id === $procurement->municipal_id) {
            return true;
        }

        // 2. If the procurement is still a draft, deny access to everyone else
        if ($procurement->status === ProcurementStatus::DRAFT) {
            return false;
        }

        // 3. Prevent public access to internal-only document types
        $internalOnlyTypes = ['COMMITTEE_EVALUATION', 'INTERNAL_MEMO'];
        if (in_array($document->type, $internalOnlyTypes)) {
            return false;
        }

        // 4. If it's an open/published procurement and the document isn't strictly internal,
        // allow the download (even for guests).
        return true;
    }
}
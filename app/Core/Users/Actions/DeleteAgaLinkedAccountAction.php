<?php

namespace App\Core\Users\Actions;

use App\Core\Auth\Models\UserSocialAccount;
use App\Core\CommunityReport\Models\ReportSubmission;
use App\Core\Feedback\Models\FeedbackSubmission;
use App\Core\SupportTicket\Models\SupportTicket;
use App\Core\SupportTicket\Models\SupportTicketReply;
use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Exceptions\AccountDeletionRequiresReviewException;
use App\Core\Users\Models\User;
use Illuminate\Support\Facades\DB;

class DeleteAgaLinkedAccountAction
{
    public function execute(string $supabaseUserId): void
    {
        DB::transaction(function () use ($supabaseUserId): void {
            $socialAccount = UserSocialAccount::query()
                ->where('provider_name', 'supabase')
                ->where('provider_id', $supabaseUserId)
                ->lockForUpdate()
                ->first();

            // A missing link means this request has already been processed, or
            // the Supabase user never created a Laravel account. Both are safe.
            if (! $socialAccount) {
                return;
            }

            $user = User::query()
                ->with('roles')
                ->lockForUpdate()
                ->find($socialAccount->user_id);

            if (! $user) {
                $socialAccount->delete();

                return;
            }

            if (! $this->isPermanentlyDeletableCitizen($user)) {
                $this->unlinkAgaFromAdministrativeAccount($user, $socialAccount);

                return;
            }

            $this->ensureNoRestrictedAdministrativeHistory($user);
            $this->anonymizeRetainedMunicipalRecords($user);
            $this->removeAuthenticationAndPersonalIdentifiers($user);

            // User does not use SoftDeletes, so this is a permanent deletion.
            $user->delete();
        }, attempts: 3);
    }

    private function isPermanentlyDeletableCitizen(User $user): bool
    {
        $roleNames = $user->roles->pluck('name');

        return $user->municipal_id === null
            && $roleNames->count() === 1
            && $roleNames->first() === EnumRoles::CLIENT->value;
    }

    private function unlinkAgaFromAdministrativeAccount(
        User $user,
        UserSocialAccount $socialAccount,
    ): void {
        // Existing tokens do not carry an AGA-specific ability marker, so all
        // external API tokens are revoked to guarantee the deleted mobile
        // identity cannot continue accessing Laravel APIs.
        $user->tokens()->delete();
        $user->socialAccounts()
            ->where('provider_name', 'supabase')
            ->where('provider_id', $socialAccount->provider_id)
            ->delete();
    }

    private function ensureNoRestrictedAdministrativeHistory(User $user): void
    {
        $hasRestrictedHistory = DB::table('cemetery_interment_readiness_overrides')
            ->where('created_by', $user->id)
            ->exists();

        if ($hasRestrictedHistory) {
            throw new AccountDeletionRequiresReviewException;
        }
    }

    private function anonymizeRetainedMunicipalRecords(User $user): void
    {
        ReportSubmission::query()
            ->where('user_id', $user->id)
            ->update([
                'user_id' => null,
                'is_anonymous' => true,
            ]);

        // These workflow columns normally contain staff IDs. Clearing an
        // unexpected citizen reference prevents an orphaned identifier.
        foreach (['acknowledged_by', 'in_progress_by', 'resolved_by', 'rejected_by'] as $column) {
            ReportSubmission::query()
                ->where($column, $user->id)
                ->update([$column => null]);
        }

        SupportTicket::query()
            ->where('user_id', $user->id)
            ->update([
                'user_id' => null,
                'contact_name' => null,
                'contact_email' => null,
                'contact_number' => null,
            ]);

        foreach (['acknowledged_by', 'assigned_to', 'resolved_by', 'closed_by'] as $column) {
            SupportTicket::query()
                ->where($column, $user->id)
                ->update([$column => null]);
        }

        SupportTicketReply::query()
            ->where('user_id', $user->id)
            ->update(['user_id' => null]);

        FeedbackSubmission::query()
            ->where('user_id', $user->id)
            ->update([
                'user_id' => null,
                'citizen_name' => null,
                'contact_number' => null,
                'email' => null,
                'is_anonymous' => true,
            ]);

        DB::table('cemetery_interments')
            ->where('ended_by', $user->id)
            ->update(['ended_by' => null]);

        DB::table('cemetery_interments')
            ->where('voided_by', $user->id)
            ->update(['voided_by' => null]);

        DB::table('activity_log')
            ->whereIn('causer_type', [$user->getMorphClass(), User::class])
            ->where('causer_id', $user->id)
            ->update([
                'causer_type' => null,
                'causer_id' => null,
            ]);
    }

    private function removeAuthenticationAndPersonalIdentifiers(User $user): void
    {
        $identifiers = array_values(array_filter([
            $user->email,
            $user->phone,
        ], fn (?string $value): bool => filled($value)));

        if ($identifiers !== []) {
            DB::table('verification_codes')
                ->whereIn('receiver', $identifiers)
                ->delete();

            DB::table('login_attempts')
                ->whereIn('identifier', $identifiers)
                ->delete();
        }

        if (filled($user->phone)) {
            DB::table('password_reset_tokens')
                ->where('phone', $user->phone)
                ->delete();
        }

        $user->tokens()->delete();
        $user->syncPermissions([]);
        $user->syncRoles([]);
        $user->socialAccounts()->delete();
    }
}

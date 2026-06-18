<?php

namespace App\Core\Users\Enums;

/**
 * Single source of truth for every admin permission string.
 *
 * Naming convention: `{module}.{ability}` (snake_case module = its Core folder).
 *  - `access`  → umbrella switch: may the admin enter the module at all
 *               (menu visibility + route-group entry). The only ability v1 ships.
 *  - verbs     → `view` / `create` / `update` / `delete` (+ module-specific verbs
 *               such as `bug.escalate`) gate individual actions WITHIN a module.
 *
 * Adding a permission post-deploy is safe & idempotent: add a case here, then run
 *   php artisan db:seed --class=Database\Seeders\PermissionSeeder
 *   php artisan permission:cache-reset
 * `firstOrCreate` only inserts the new row; existing grants are untouched.
 * See docs/permissions.md for the full procedure.
 */
enum EnumPermissions: string
{
    //action center
    case ACTION_CENTER_ACCESS = 'action_center.access';

    //announcement & events
    case BULLETIN_BOARD_ACCESS = 'bulletin_board.access';

    //community reports
    case COMMUNITY_REPORT_ACCESS = 'community_report.access';

    //support ticket
    case SUPPORT_TICKET_ACCESS = 'support_ticket.access';

    //feedback
    case FEEDBACK_ACCESS = 'feedback.access';

    //municipality settings
    case MUNICIPALITY_SETTINGS_ACCESS = 'municipality_settings.access';

    //public information
    case PUBLIC_INFORMATION_ACCESS = 'public_information.access';

    //tourism
    case TOURISM_ACCESS = 'tourism.access';

    //users
    case USERS_ACCESS = 'users.access';

    //wedding
    case WEDDING_ACCESS = 'wedding.access';

    //cemetery
    case CEMETERY_ACCESS = 'cemetery.access';
    case CEMETERY_DECEDENTS_VIEW = 'cemetery.decedents.view';
    case CEMETERY_DECEDENTS_MANAGE = 'cemetery.decedents.manage';
    case CEMETERY_DECEDENTS_VERIFY = 'cemetery.decedents.verify';
    case CEMETERY_DECEDENTS_CORRECT = 'cemetery.decedents.correct';
    case CEMETERY_DECEDENTS_OVERRIDE = 'cemetery.decedents.override';
    case CEMETERY_DECEDENTS_DOCUMENTS_VIEW = 'cemetery.decedents.documents.view';

    //government
    case GOVERNMENT_ACCESS = 'government.access';

    //department
    case DEPARTMENT_ACCESS = 'department.access';

    // --- Reserved for delegation (NOT seeded yet) -------------------------
    // Uncomment + add labels + re-seed when you let municipal admins manage
    // other admins within their own municipality. CreateAdminUseCase already
    // enforces the matching anti-escalation / municipality-lock guards.
    // case USERS_CREATE = 'users.create';
    // case USERS_UPDATE = 'users.update';
    // case USERS_DELETE = 'users.delete';
    // ---------------------------------------------------------------------

    public function label(): string
    {
        return match ($this) {
            self::ACTION_CENTER_ACCESS => 'Action Center',
            self::BULLETIN_BOARD_ACCESS => 'Bulletin Board',
            self::COMMUNITY_REPORT_ACCESS => 'Community Reporting',
            self::SUPPORT_TICKET_ACCESS => 'Support & Help Desk',
            self::FEEDBACK_ACCESS => 'Feedback & Suggestions',
            self::MUNICIPALITY_SETTINGS_ACCESS => 'Municipality Settings',
            self::PUBLIC_INFORMATION_ACCESS => 'Awards & Public Info',
            self::TOURISM_ACCESS => 'Tourism Module',
            self::USERS_ACCESS => 'User Management',
            self::WEDDING_ACCESS => 'Wedding Management',
            self::CEMETERY_ACCESS => 'Cemetery Management',
            self::CEMETERY_DECEDENTS_VIEW => 'Cemetery - View Decedents',
            self::CEMETERY_DECEDENTS_MANAGE => 'Cemetery - Manage Decedents',
            self::CEMETERY_DECEDENTS_VERIFY => 'Cemetery - Verify Decedents',
            self::CEMETERY_DECEDENTS_CORRECT => 'Cemetery - Correct Decedents',
            self::CEMETERY_DECEDENTS_OVERRIDE => 'Cemetery - Readiness Override',
            self::CEMETERY_DECEDENTS_DOCUMENTS_VIEW => 'Cemetery - View Documents',
            self::GOVERNMENT_ACCESS => 'Government Management',
            self::DEPARTMENT_ACCESS => 'Department Management',
        };
    }

    public function module(): EnumPermissionModule
    {
        return match ($this) {
            self::ACTION_CENTER_ACCESS => EnumPermissionModule::ACTION_CENTER,
            self::BULLETIN_BOARD_ACCESS => EnumPermissionModule::BULLETIN_BOARD,
            self::COMMUNITY_REPORT_ACCESS => EnumPermissionModule::COMMUNITY_REPORT,
            self::SUPPORT_TICKET_ACCESS => EnumPermissionModule::SUPPORT_TICKET,
            self::FEEDBACK_ACCESS => EnumPermissionModule::FEEDBACK,
            self::MUNICIPALITY_SETTINGS_ACCESS => EnumPermissionModule::MUNICIPALITY_SETTINGS,
            self::PUBLIC_INFORMATION_ACCESS => EnumPermissionModule::PUBLIC_INFORMATION,
            self::TOURISM_ACCESS => EnumPermissionModule::TOURISM,
            self::USERS_ACCESS => EnumPermissionModule::USERS,
            self::WEDDING_ACCESS => EnumPermissionModule::WEDDING,
            self::CEMETERY_ACCESS,
            self::CEMETERY_DECEDENTS_VIEW,
            self::CEMETERY_DECEDENTS_MANAGE,
            self::CEMETERY_DECEDENTS_VERIFY,
            self::CEMETERY_DECEDENTS_CORRECT,
            self::CEMETERY_DECEDENTS_OVERRIDE,
            self::CEMETERY_DECEDENTS_DOCUMENTS_VIEW => EnumPermissionModule::CEMETERY,
            self::GOVERNMENT_ACCESS => EnumPermissionModule::GOVERNMENT,
            self::DEPARTMENT_ACCESS => EnumPermissionModule::DEPARTMENT,
        };
    }

    public function isAccess(): bool
    {
        return str_ends_with($this->value, '.access');
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(
            fn (self $permission): string => $permission->value,
            self::cases(),
        );
    }
}

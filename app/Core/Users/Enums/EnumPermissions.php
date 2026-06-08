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

    case ACTION_CENTER_ACCESS = 'action_center.access';
    case BULLETIN_BOARD_ACCESS = 'bulletin_board.access';
    case COMMUNITY_REPORT_ACCESS = 'community_report.access';
    case SUPPORT_TICKET_ACCESS = 'support_ticket.access';
    case FEEDBACK_ACCESS = 'feedback.access';
    case MUNICIPALITY_SETTINGS_ACCESS = 'municipality_settings.access';
    case PUBLIC_INFORMATION_ACCESS = 'public_information.access';
    case TOURISM_ACCESS = 'tourism.access';
    case USERS_ACCESS = 'users.access';
    case WEDDING_ACCESS = 'wedding.access';
    case CEMETERY_ACCESS = 'cemetery.access';
    case GOVERNMENT_ACCESS = 'government.access';
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
            self::GOVERNMENT_ACCESS => 'Government Management',
            self::DEPARTMENT_ACCESS => 'Department Management',
        };
    }

}
<?php

namespace App\Core\Users\Enums;

enum EnumPermissions: string
{

    case ACTION_CENTER_ACCESS = 'action_center.access';
    case BULLETIN_BOARD_ACCESS = 'bulletin_board.access';
    case COMMUNITY_REPORT_ACCESS = 'community_report.access';
    case FEEDBACK_ACCESS = 'feedback.access';
    case MUNICIPALITY_SETTINGS_ACCESS = 'municipality_settings.access';
    case PUBLIC_INFORMATION_ACCESS = 'public_information.access';
    case TOURISM_ACCESS = 'tourism.access';
    case USERS_ACCESS = 'users.access';
    case WEDDING_ACCESS = 'wedding.access';
    case CEMETERY_ACCESS = 'cemetery.access';
    case GOVERNMENT_ACCESS = 'government.access';

    public function label(): string
    {
        return match ($this) {
            self::ACTION_CENTER_ACCESS => 'Action Center',
            self::BULLETIN_BOARD_ACCESS => 'Bulletin Board',
            self::COMMUNITY_REPORT_ACCESS => 'Community Reporting',
            self::FEEDBACK_ACCESS => 'Feedback & Suggestions',
            self::MUNICIPALITY_SETTINGS_ACCESS => 'Municipality Settings',
            self::PUBLIC_INFORMATION_ACCESS => 'Awards & Public Info',
            self::TOURISM_ACCESS => 'Tourism Module',
            self::USERS_ACCESS => 'User Management',
            self::WEDDING_ACCESS => 'Wedding Management',
            self::CEMETERY_ACCESS => 'Cemetery Management'
        };
    }

}
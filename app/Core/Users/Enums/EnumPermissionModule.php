<?php

namespace App\Core\Users\Enums;

enum EnumPermissionModule: string
{
    case ACTION_CENTER = 'action_center';
    case BULLETIN_BOARD = 'bulletin_board';
    case COMMUNITY_REPORT = 'community_report';
    case SUPPORT_TICKET = 'support_ticket';
    case FEEDBACK = 'feedback';
    case MUNICIPALITY_SETTINGS = 'municipality_settings';
    case PUBLIC_INFORMATION = 'public_information';
    case TOURISM = 'tourism';
    case USERS = 'users';
    case WEDDING = 'wedding';
    case CEMETERY = 'cemetery';
    case GOVERNMENT = 'government';
    case DEPARTMENT = 'department';

    public function label(): string
    {
        return match ($this) {
            self::ACTION_CENTER => 'Action Center',
            self::BULLETIN_BOARD => 'Bulletin Board',
            self::COMMUNITY_REPORT => 'Community Reporting',
            self::SUPPORT_TICKET => 'Support & Help Desk',
            self::FEEDBACK => 'Feedback & Suggestions',
            self::MUNICIPALITY_SETTINGS => 'Municipality Settings',
            self::PUBLIC_INFORMATION => 'Awards & Public Info',
            self::TOURISM => 'Tourism Module',
            self::USERS => 'User Management',
            self::WEDDING => 'Wedding Management',
            self::CEMETERY => 'Cemetery Management',
            self::GOVERNMENT => 'Government Management',
            self::DEPARTMENT => 'Department Management',
        };
    }

    public function order(): int
    {
        return match ($this) {
            self::ACTION_CENTER => 10,
            self::CEMETERY => 20,
            self::COMMUNITY_REPORT => 30,
            self::SUPPORT_TICKET => 40,
            self::FEEDBACK => 50,
            self::BULLETIN_BOARD => 60,
            self::PUBLIC_INFORMATION => 70,
            self::TOURISM => 80,
            self::GOVERNMENT => 90,
            self::DEPARTMENT => 100,
            self::MUNICIPALITY_SETTINGS => 110,
            self::USERS => 120,
            self::WEDDING => 130,
        };
    }
}

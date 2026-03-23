<?php

namespace App\Core\Procurement\Enums;

enum FundingSource: string
{

    case GENERAL_FUND = 'general_fund';
    case SPECIAL_EDUCATION_FUND = 'sef';
    case TRUST_FUND = 'trust_fund';
    case DEVELOPMENT_FUND_20 = '20_percent_df';
    case DISASTER_FUND = 'ldrrmf'; // Calamity Fund
    case GENDER_AND_DEVELOPMENT = 'gad';
    case EXTERNAL_GRANT = 'external_grant';
    case OTHERS = 'others';


    public function label(): string
    {

        return match ($this) {
            self::GENERAL_FUND => 'General Fund (GF)',
            self::SPECIAL_EDUCATION_FUND => 'Special Education Fund (SEF)',
            self::TRUST_FUND => 'Trust Fund',
            self::DEVELOPMENT_FUND_20 => '20% Development Fund',
            self::DISASTER_FUND => 'LDRRM Fund (Calamity)',
            self::GENDER_AND_DEVELOPMENT => 'Gender and Development (GAD)',
            self::EXTERNAL_GRANT => 'External Grant/Donation',
            self::OTHERS => 'Others (Please specify)',
        };
    }
}
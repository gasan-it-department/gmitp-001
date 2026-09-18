<?php

namespace App\Core\ActionCenter\Enums;

enum BeneficiaryAssistanceRole: string
{
    case FiledForSelf = 'filed_for_self';
    case ReceivedOnBehalf = 'received_on_behalf';
}

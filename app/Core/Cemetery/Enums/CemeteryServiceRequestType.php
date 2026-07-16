<?php

namespace App\Core\Cemetery\Enums;

enum CemeteryServiceRequestType: string
{
    case INTERMENT = 'interment';
    case PLOT_MOVE = 'plot_move';
    case EXHUMATION = 'exhumation';
    case TRANSFER_OUT = 'transfer_out';
    case VOID_INTERMENT = 'void_interment';
    case REVERSE_MOVE = 'reverse_move';

    public function label(): string
    {
        return match ($this) {
            self::INTERMENT => 'Interment',
            self::PLOT_MOVE => 'Plot Move',
            self::EXHUMATION => 'Exhumation',
            self::TRANSFER_OUT => 'Transfer Out',
            self::VOID_INTERMENT => 'Void Interment',
            self::REVERSE_MOVE => 'Reverse Move',
        };
    }
}

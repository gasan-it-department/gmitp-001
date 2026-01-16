<?php

namespace App\External\Web\Controllers\Transaction;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class TransactionController extends Controller
{

    public function index()
    {

        return Inertia::render('Transactions/Transactions');

    }

}


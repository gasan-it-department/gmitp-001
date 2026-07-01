<?php

namespace App\External\Api\Request\Cemetery\Plots;

use App\Core\Cemetery\Enums\PlotLeaseStatus;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class UpdatePlotLeaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'leaseholder_name' => is_string($this->input('leaseholder_name')) ? trim($this->input('leaseholder_name')) : $this->input('leaseholder_name'),
            'leaseholder_contact' => is_string($this->input('leaseholder_contact')) ? trim($this->input('leaseholder_contact')) : $this->input('leaseholder_contact'),
            'leaseholder_address' => is_string($this->input('leaseholder_address')) ? trim($this->input('leaseholder_address')) : $this->input('leaseholder_address'),
            'leaseholder_relationship' => is_string($this->input('leaseholder_relationship')) ? trim($this->input('leaseholder_relationship')) : $this->input('leaseholder_relationship'),
            'or_number' => is_string($this->input('or_number')) ? mb_strtoupper(trim($this->input('or_number'))) : $this->input('or_number'),
            'notes' => is_string($this->input('notes')) ? trim($this->input('notes')) : $this->input('notes'),
        ]);
    }

    public function rules(): array
    {
        $municipalId = app('municipal_id');
        $activeLeaseId = $this->activeLeaseId($municipalId);

        return [
            'leaseholder_name' => ['required', 'string', 'max:255'],
            'leaseholder_contact' => ['nullable', 'string', 'max:100'],
            'leaseholder_address' => ['nullable', 'string', 'max:255'],
            'leaseholder_relationship' => ['nullable', 'string', 'max:100'],
            'lease_start' => ['nullable', 'date'],
            'lease_end' => ['nullable', 'date'],
            'amount_paid' => ['nullable', 'numeric', 'min:0', 'max:99999999.99', 'required_with:or_number'],
            'or_number' => [
                'nullable',
                'string',
                'max:100',
                'required_with:amount_paid',
                Rule::unique('cemetery_plot_leases', 'or_number')
                    ->ignore($activeLeaseId)
                    ->where(fn ($q) => $q
                        ->where('municipal_id', $municipalId)
                        ->whereNull('deleted_at')),
            ],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if (
                ! $this->filled('lease_end')
                || $validator->errors()->has('lease_start')
                || $validator->errors()->has('lease_end')
            ) {
                return;
            }

            $leaseStart = $this->filled('lease_start') ? Carbon::parse($this->input('lease_start')) : null;
            $leaseEnd = Carbon::parse($this->input('lease_end'));

            if ($leaseStart && $leaseEnd->lt($leaseStart)) {
                $validator->errors()->add('lease_end', 'The lease end date must be on or after the lease start date.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'leaseholder_name.required' => 'Please enter the responsible leaseholder or contact person.',
            'amount_paid.required_with' => 'Please enter the amount paid when an OR number is provided.',
            'or_number.required_with' => 'Please enter the OR number when an amount paid is provided.',
            'or_number.unique' => 'This OR number is already recorded for another cemetery lease in this municipality.',
        ];
    }

    private function activeLeaseId(string $municipalId): ?string
    {
        $plotId = $this->route('plot_id');

        if (! is_string($plotId)) {
            return null;
        }

        return DB::table('cemetery_plot_leases')
            ->where('municipal_id', $municipalId)
            ->where('plot_id', $plotId)
            ->where('status', PlotLeaseStatus::ACTIVE->value)
            ->whereNull('deleted_at')
            ->value('id');
    }
}

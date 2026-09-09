<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ac_assistance_request_document_checks', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->foreignUlid('assistance_request_id')
                ->constrained('ac_assistance_requests')
                ->cascadeOnDelete();
            $table->string('document_key', 100);
            $table->string('label', 255);
            $table->text('description')->nullable();
            $table->boolean('is_required')->default(true);
            $table->string('physical_copy_requirement', 64)->default('unspecified');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_applicable')->default(true);
            $table->string('exemption_reason', 500)->nullable();
            $table->string('verification_status', 32)->default('pending');
            $table->unsignedBigInteger('inspected_media_id')->nullable();
            $table->string('inspected_media_version', 128)->nullable();
            $table->string('presented_copy_type', 64)->nullable();
            $table->text('remarks')->nullable();
            $table->foreignUlid('checked_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('checked_at')->nullable();
            $table->timestamps();

            $table->unique(['assistance_request_id', 'document_key'], 'ac_request_document_check_unique');
            $table->index(['assistance_request_id', 'verification_status'], 'ac_request_document_check_status_idx');
        });

        // Rollout baseline: current type requirements are copied only for open
        // requests. They are not claimed to be the exact historical list from
        // the date an older request was originally submitted.
        $requirementsByType = DB::table('ac_assistance_type_documents as atd')
            ->join('ac_document_types as dt', 'dt.id', '=', 'atd.document_type_id')
            ->select([
                'atd.assistance_type_id',
                'atd.is_required',
                'atd.physical_copy_requirement',
                'atd.sort_order',
                'dt.key',
                'dt.label',
                'dt.description',
            ])
            ->orderBy('atd.sort_order')
            ->get()
            ->groupBy('assistance_type_id');

        $now = now();
        DB::table('ac_assistance_requests')
            ->whereIn('status', ['pending', 'under_review', 'approved'])
            ->orderBy('id')
            ->chunkById(200, function ($requests) use ($requirementsByType, $now): void {
                $rows = [];
                $ids = [];

                foreach ($requests as $request) {
                    $ids[] = $request->id;
                    $metadata = json_decode((string) ($request->metadata ?? '{}'), true) ?: [];
                    $recipientException = $metadata['recipient_id_exception'] ?? null;
                    $hasValidUnavailableReason = $recipientException === 'no_government_id'
                        && mb_strlen(trim((string) ($metadata['recipient_id_exception_reason'] ?? ''))) >= 10;
                    $hasOnBehalfSubject = $request->on_behalf_household_member_id !== null;

                    foreach ($requirementsByType->get($request->assistance_type_id, collect()) as $requirement) {
                        $recipientId = str_starts_with($requirement->key, 'recipient_valid_id_');
                        $isApplicable = ! $recipientId || ($hasOnBehalfSubject
                            && ! in_array($recipientException, ['minor', 'deceased'], true)
                            && ! $hasValidUnavailableReason);
                        $required = (bool) $requirement->is_required;

                        if ($recipientId && $isApplicable) {
                            // Recipient ID slots are system-added as optional
                            // type settings but conditionally required when the
                            // ordinary filer-ID rule applies.
                            $required = true;
                        }

                        $rows[] = [
                            'id' => (string) Str::ulid(),
                            'assistance_request_id' => $request->id,
                            'document_key' => $requirement->key,
                            'label' => $requirement->label,
                            'description' => $requirement->description,
                            'is_required' => $required,
                            'physical_copy_requirement' => $requirement->physical_copy_requirement ?? 'unspecified',
                            'sort_order' => (int) $requirement->sort_order,
                            'is_applicable' => $isApplicable,
                            'exemption_reason' => $isApplicable ? null : 'Not applicable to this request because the recipient ID requirement is exempt.',
                            'verification_status' => 'pending',
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }
                }

                if ($rows !== []) {
                    DB::table('ac_assistance_request_document_checks')->insert($rows);
                }

                if ($ids !== []) {
                    DB::table('ac_assistance_requests')->whereIn('id', $ids)->update([
                        'document_requirements_captured_at' => $now,
                    ]);
                }
            }, 'id');
    }

    public function down(): void
    {
        Schema::dropIfExists('ac_assistance_request_document_checks');
    }
};

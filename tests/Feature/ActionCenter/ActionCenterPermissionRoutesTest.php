<?php

use Illuminate\Support\Facades\Route;

it('assigns every admin action center route to one explicit capability', function () {
        $expectedCapabilities = [
                'actionCenter.admin.list.assistance' => 'action_center.requests.view',
                'actionCenter.admin.reports.index' => 'action_center.reports.view',
                'actionCenter.admin.reports.assistance.export' => 'action_center.reports.view',
                'actionCenter.admin.reports.beneficiaries' => 'action_center.reports.view',
                'actionCenter.admin.reports.beneficiaries.export' => 'action_center.reports.view',
                'actionCenter.admin.beneficiary.index' => 'action_center.beneficiaries.view',
                'actionCenter.admin.beneficiary.search' => 'action_center.beneficiaries.view',
                'actionCenter.admin.beneficiary.profile' => 'action_center.beneficiaries.view',
                'actionCenter.admin.beneficiary.edit' => 'action_center.beneficiaries.manage',
                'actionCenter.admin.beneficiary.avatar' => 'action_center.beneficiaries.view',
                'actionCenter.admin.beneficiary.identity-document' => 'action_center.beneficiaries.verify',
                'actionCenter.admin.walkin.create' => 'action_center.beneficiaries.manage',
                'actionCenter.admin.list.my.assistance' => 'action_center.requests.view',
                'actionCenter.admin.assistance.create' => 'action_center.requests.process',
                'actionCenter.admin.create.assistance.type' => 'action_center.settings.manage',
                'actionCenter.admin.list.assistance.types' => 'action_center.settings.manage',
                'actionCenter.admin.edit.assistance-type' => 'action_center.settings.manage',
                'actionCenter.admin.show.assistance-request.profile' => 'action_center.requests.view',
                'actionCenter.admin.assistance-request.intake-sheet.create' => 'action_center.requests.process',
                'actionCenter.admin.assistance-request.intake-sheet.generate' => 'action_center.requests.process',
                'actionCenter.admin.assistance-request.acknowledgement-receipt.create' => 'action_center.requests.process',
                'actionCenter.admin.assistance-request.acknowledgement-receipt.generate' => 'action_center.requests.process',
                'actionCenter.admin.assistance-request.obligation-request.create' => 'action_center.requests.process',
                'actionCenter.admin.assistance-request.obligation-request.generate' => 'action_center.requests.process',
                'actionCenter.admin.assistance-request.disbursement-voucher.create' => 'action_center.requests.process',
                'actionCenter.admin.assistance-request.disbursement-voucher.generate' => 'action_center.requests.process',
                'actionCenter.admin.assistance-request.certificate-of-eligibility.create' => 'action_center.requests.process',
                'actionCenter.admin.assistance-request.certificate-of-eligibility.generate' => 'action_center.requests.process',
                'actionCenter.admin.assistance-request.financial-document-packet.create' => 'action_center.requests.process',
                'actionCenter.admin.assistance-request.financial-document-packet.generate' => 'action_center.requests.process',
                'actionCenter.admin.assistance.edit' => 'action_center.requests.process',
                'actionCenter.admin.beneficiary.intake-sheet' => 'action_center.beneficiaries.view',
                'actionCenter.admin.beneficiary.identity-document-sheet' => 'action_center.beneficiaries.verify',
                'actionCenter.assistance.type.store' => 'action_center.settings.manage',
                'actionCenter.assistance.type.update' => 'action_center.settings.manage',
                'actionCenter.assistance.start-review' => 'action_center.requests.process',
                'actionCenter.assistance.update' => 'action_center.requests.process',
                'actionCenter.assistance.household-assessment.refresh' => 'action_center.requests.process',
                'actionCenter.assistance.correct-missing-date-of-death' => 'action_center.requests.correct',
                'actionCenter.assistance.approve' => 'action_center.requests.decide',
                'actionCenter.assistance.cancel-approved' => 'action_center.requests.decide',
                'actionCenter.assistance.reject' => 'action_center.requests.decide',
                'actionCenter.assistance.release' => 'action_center.requests.release',
                'actionCenter.beneficiary.link-account' => 'action_center.beneficiaries.correct',
                'actionCenter.beneficiary.merge' => 'action_center.beneficiaries.correct',
                'actionCenter.beneficiary.update' => 'action_center.beneficiaries.manage',
                'actionCenter.beneficiary.review-intake' => 'action_center.beneficiaries.verify',
                'actionCenter.beneficiary.reject-intake' => 'action_center.beneficiaries.verify',
                'actionCenter.beneficiary.reassign-household' => 'action_center.beneficiaries.correct',
                'actionCenter.beneficiary.household-members.search' => 'action_center.beneficiaries.verify|action_center.beneficiaries.correct',
                'actionCenter.beneficiary.avatar.upload' => 'action_center.beneficiaries.manage',
                'actionCenter.beneficiary.identity-document.replace' => 'action_center.beneficiaries.verify',
                'actionCenter.beneficiary.identity-document.rotate' => 'action_center.beneficiaries.verify',
                'actionCenter.household.members.update' => 'action_center.beneficiaries.manage',
                'actionCenter.household.members.set-active' => 'action_center.beneficiaries.manage',
                'actionCenter.household.change-head' => 'action_center.beneficiaries.correct',
                'actionCenter.household.members.admin-store' => 'action_center.beneficiaries.manage',
                'actionCenter.household.members.link' => 'action_center.beneficiaries.correct',
                'actionCenter.household.members.unlink' => 'action_center.beneficiaries.correct',
                'actionCenter.walkin.store' => 'action_center.beneficiaries.manage',
                'actionCenter.assistance.admin-store' => 'action_center.requests.process',
        ];

        $actualRouteNames = collect(Route::getRoutes()->getRoutes())
                ->filter(function (\Illuminate\Routing\Route $route): bool {
                        $middleware = $route->gatherMiddleware();

                        return in_array('admin', $middleware, true)
                                && in_array('permission:action_center.access', $middleware, true);
                })
                ->map(fn(\Illuminate\Routing\Route $route): ?string => $route->getName())
                ->filter()
                ->sort()
                ->values()
                ->all();

        $expectedRouteNames = array_keys($expectedCapabilities);
        sort($expectedRouteNames);

        expect($actualRouteNames)->toBe($expectedRouteNames);

        foreach ($expectedCapabilities as $routeName => $capability) {
                $middleware = Route::getRoutes()->getByName($routeName)?->gatherMiddleware() ?? [];

                expect($middleware)
                        ->toContain('municipalityContext')
                        ->toContain('admin')
                        ->toContain('permission:action_center.access')
                        ->toContain("permission:{$capability}");
        }

});

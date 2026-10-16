import goodsDistribution from '@/routes/goodsDistribution';
import { Link } from '@inertiajs/react';
import type { GoodsRequest } from './Distribution/types';

export function requestProfileHref(slug: string, request: GoodsRequest, role: 'recipient' | 'filer'): string | null {
    const snapshot = request.status === 'released' ? (request.handover_snapshot ?? request.snapshot) : request.snapshot;
    if (role === 'filer') return goodsDistribution.recipient.show.url({ municipality: slug, beneficiaryId: request.beneficiary_id });
    if (!request.assisted_household_member_id) {
        return goodsDistribution.recipient.show.url({ municipality: slug, beneficiaryId: request.beneficiary_id });
    }
    if (snapshot.subject.beneficiary_id) {
        return goodsDistribution.recipient.show.url({ municipality: slug, beneficiaryId: snapshot.subject.beneficiary_id });
    }
    return goodsDistribution.member.show.url({ municipality: slug, memberId: request.assisted_household_member_id });
}

export function RequestPersonLink({ slug, request, role }: { slug: string; request: GoodsRequest; role: 'recipient' | 'filer' }) {
    const snapshot = request.status === 'released' ? (request.handover_snapshot ?? request.snapshot) : request.snapshot;
    const name = role === 'recipient' ? snapshot.subject.name : snapshot.filer.name;
    const href = requestProfileHref(slug, request, role);
    return href ? (
        <Link href={href} className="[overflow-wrap:anywhere] text-[#245e4f] hover:underline">
            {name}
        </Link>
    ) : (
        <>{name}</>
    );
}

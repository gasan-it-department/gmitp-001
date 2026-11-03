import goodsDistribution from '@/routes/goodsDistribution';

export type ProgramContext = Record<string, string> & { program_context_id: string };

export function distributionProgramContext(programId: string, filters: Record<string, string>): ProgramContext {
    const context: ProgramContext = { program_context_id: programId };
    for (const key of ['search', 'status', 'from', 'to', 'page']) {
        if (filters[key]) context[`program_${key}`] = String(filters[key]);
    }
    return context;
}

export function distributionProgramReturn(slug: string, context: ProgramContext): string {
    const query: Record<string, string> = { tab: 'distributions' };
    for (const key of ['search', 'status', 'from', 'to', 'page']) {
        if (context[`program_${key}`]) query[key] = context[`program_${key}`];
    }
    return goodsDistribution.inventory.programsShow.url({ municipality: slug, programId: context.program_context_id }, { query });
}

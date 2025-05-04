import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { RootState } from '../../../store';
import { AnnualTarget, QuarterType } from '../../../types/annualCorporateScorecard';

// StrategyBlock: rounded box for each strategy
const StrategyBlock: React.FC<{ text: string; color?: string }> = ({ text, color }) => (
    <Box
        sx={{
            border: '2px solid #1976d2',
            borderRadius: '16px',
            padding: 2,
            margin: 1,
            display: 'inline-block',
            minWidth: 220,
            textAlign: 'center',
            background: color ? color : '#fff',
            color: color ? '#fff' : undefined,
        }}
    >
        <Typography>{text}</Typography>
    </Box>
);

// PerspectiveBlock: section for each perspective
const PerspectiveBlock: React.FC<{ title: string; strategies: { id: number; text: string; color?: string }[] }> = ({ title, strategies }) => (
    <Paper
        elevation={0}
        sx={{
            mb: 3,
            p: 2,
            border: '1px solid #ccc',
            borderRadius: '8px',
            background: '#fafbfc',
        }}
    >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            {title}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {strategies.map((s) => (
                <StrategyBlock key={s.id} text={s.text} color={s.color} />
            ))}
        </Box>
    </Paper>
);

interface StrategyMapProps {
    annualTargetId?: string;
    quarter?: QuarterType;
}

const StrategyMap: React.FC<StrategyMapProps> = ({ annualTargetId, quarter }) => {
    // Get annual targets from store
    const annualTargets = useAppSelector((state: RootState) => state.scorecard.annualTargets);
    // Pick the selected annual target, or the first one if not provided
    const annualTarget: AnnualTarget | undefined =
        annualTargetId
            ? annualTargets.find((t) => t._id === annualTargetId)
            : annualTargets[0];

    // Build the strategy map data from perspectives and objectives
    const perspectives = annualTarget?.content.perspectives || [];
    console.log(annualTarget?.content.quarterlyTarget.quarterlyTargets.find(q => q.quarter === quarter), 'annualTarget', quarter);
    const objectives = annualTarget?.content.quarterlyTarget.quarterlyTargets.find(q => q.quarter === quarter)?.objectives || [];
    const ratingScales = annualTarget?.content.ratingScales || [];

    // Helper to get color for a strategy (objective) from quarterly data, using average ratingScore
    const getObjectiveColor = (objectiveName: string): string | undefined => {
        if (!annualTarget || !quarter) return undefined;
        const quarterly = annualTarget.content.quarterlyTarget.quarterlyTargets.find(q => q.quarter === quarter);
        if (!quarterly) return undefined;
        const qObjective = quarterly.objectives.find(obj => obj.name === objectiveName);
        if (!qObjective || !qObjective.KPIs.length) return undefined;
        // Calculate average ratingScore
        const validScores = qObjective.KPIs.map(kpi => kpi.ratingScore).filter(score => typeof score === 'number' && !isNaN(score));
        if (!validScores.length) return undefined;
        const avgScore = Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length);
        const foundScale = ratingScales.find(scale => scale.score === avgScore);
        return foundScale?.color;
    };

    const strategyMapData = perspectives.map((perspective) => ({
        perspective: perspective.name,
        strategies: objectives
            .filter((obj) => obj.perspectiveId === perspective.index)
            .map((obj, idx) => ({
                id: idx + 1,
                text: obj.name,
                color: getObjectiveColor(obj.name)
            })),
    }));
    console.log(strategyMapData, 'strategyMapData');

    return (
        <Box>
            {strategyMapData.map((perspective) => (
                <PerspectiveBlock
                    key={perspective.perspective}
                    title={perspective.perspective}
                    strategies={perspective.strategies}
                />
            ))}
        </Box>
    );
};

export default StrategyMap;
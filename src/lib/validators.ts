export const isValidScore = (score: number): boolean => {
    return (score >= 0 && score <= 10);
}
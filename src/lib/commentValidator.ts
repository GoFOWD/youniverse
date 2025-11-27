/**
 * Comment Validator
 * Detects spam and low-quality comments
 */

export interface CommentValidation {
    isValid: boolean;
    reason?: string;
}

export function validateComment(comment: string | null | undefined): CommentValidation {
    // Null or empty comments are considered "no response" (valid but empty)
    if (!comment || comment.trim().length === 0) {
        return { isValid: true }; // Will be counted as "no comment" in analytics
    }

    const trimmed = comment.trim();

    // Too short (less than 3 characters)
    if (trimmed.length < 3) {
        return { isValid: false, reason: 'Too short' };
    }

    // Only punctuation or special characters
    const onlyPunctuation = /^[.,!?;:\-_~`'"()\[\]{}<>\/\\|@#$%^&*+=\s]+$/;
    if (onlyPunctuation.test(trimmed)) {
        return { isValid: false, reason: 'Only punctuation' };
    }

    // Repeated single character (e.g., "....", "ㅋㅋㅋㅋ", "aaaa")
    // Check if more than 70% of the comment is the same character
    const charCount: Record<string, number> = {};
    for (const char of trimmed) {
        charCount[char] = (charCount[char] || 0) + 1;
    }

    const maxCount = Math.max(...Object.values(charCount));
    const repetitionRatio = maxCount / trimmed.length;

    if (repetitionRatio > 0.7) {
        return { isValid: false, reason: 'Repeated characters' };
    }

    // Passed all checks
    return { isValid: true };
}

/**
 * Example usage:
 * 
 * validateComment("좋았어요!") // { isValid: true }
 * validateComment("....") // { isValid: false, reason: 'Repeated characters' }
 * validateComment(".") // { isValid: false, reason: 'Too short' }
 * validateComment("ㅋㅋㅋㅋㅋㅋ") // { isValid: false, reason: 'Repeated characters' }
 * validateComment(null) // { isValid: true }
 */

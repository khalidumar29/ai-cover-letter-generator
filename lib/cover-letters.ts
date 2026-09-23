import "server-only";

import { generateCoverLetter, type LetterBrief } from "@/lib/ai/cover-letter";
import { GENERATION_COST, CREDIT_REASONS, packList } from "@/lib/domain";
import { InsufficientCreditsError, refundCredits, spendCredits } from "@/lib/credits";
import { prisma } from "@/lib/prisma";

export { InsufficientCreditsError };

export type GenerationInput = Omit<LetterBrief, "applicantName">;

export type GenerationOutcome = {
  letterId: string;
  credits: number;
};

/**
 * Runs one paid generation: take the credit, call the model, store the result.
 *
 * The credit is taken *before* the model call, because two requests that both
 * read the balance first could both pass the check. If the call then fails the
 * credit is put back, so a user is never charged for a letter they did not get.
 */
export async function generateAndSave(options: {
  user: { id: string; name: string };
  input: GenerationInput;
  /** Set to overwrite an existing letter instead of creating one. */
  replaceLetterId?: string;
}): Promise<GenerationOutcome> {
  const { user, input, replaceLetterId } = options;

  const { balance, transactionId } = await spendCredits({
    userId: user.id,
    amount: GENERATION_COST,
    reason: CREDIT_REASONS.GENERATION,
    description: `${replaceLetterId ? "Regenerated" : "Generated"} a letter for ${input.jobTitle} at ${input.company}`,
    coverLetterId: replaceLetterId,
  });

  let generated;
  try {
    generated = await generateCoverLetter({ ...input, applicantName: user.name });
  } catch (cause) {
    await refundCredits({
      userId: user.id,
      amount: GENERATION_COST,
      description: "Refund — generation did not complete",
    });
    throw cause;
  }

  const data = {
    ...input,
    content: generated.content,
    matchScore: generated.matchScore,
    matchedSkills: packList(generated.matchedSkills),
    missingSkills: packList(generated.missingSkills),
  };

  const letter = replaceLetterId
    ? await prisma.coverLetter.update({
        where: { id: replaceLetterId },
        // A regenerate replaces the text, so an archived letter returns to draft.
        data: { ...data, status: "DRAFT" },
        select: { id: true },
      })
    : await prisma.coverLetter.create({
        data: { ...data, userId: user.id },
        select: { id: true },
      });

  if (!replaceLetterId) {
    // The ledger entry is written before the letter exists, so link it now.
    await prisma.creditTransaction.update({
      where: { id: transactionId },
      data: { coverLetterId: letter.id },
    });
  }

  return { letterId: letter.id, credits: balance };
}

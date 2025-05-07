import { removeStopwords } from "stopword";  // Importing the removeStopwords function
import { TfIdf } from "natural";
import { PartialSlot } from "@/app/api/ai-insights/trending/route";

export const extractTopKeywords = (slots: PartialSlot[], topN = 10) => {
    const tfidf = new TfIdf();

    // Preprocess the slot data by removing stopwords from the combined text
    slots.forEach(slot => {
        const combined = `${slot.title} ${slot.description} ${slot.tags.join(" ")}`;
        // Remove stopwords before passing to the TF-IDF model
        const filteredText = removeStopwords(combined.toLowerCase().split(" ")).join(" ");
        tfidf.addDocument(filteredText);
    });

    const wordScores: Record<string, number> = {};
    tfidf.documents.forEach((_, i) => {
        tfidf.listTerms(i).forEach(({ term, tfidf }) => {
            if (!wordScores[term]) wordScores[term] = 0;
            wordScores[term] += tfidf;
        });
    });

    const sorted = Object.entries(wordScores)
        .filter(([word]) => word.length > 2)  // Filter out short words
        .sort((a, b) => b[1] - a[1])  // Sort by TF-IDF score in descending order
        .slice(0, topN);  // Take the top N words

    return sorted.map(([word, score]) => ({ word, score }));
};

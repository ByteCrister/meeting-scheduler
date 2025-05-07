// * src>utils>ai>clustering.ts

import * as kmeans from "ml-kmeans";  // Importing everything under kmeans
import { PartialSlot } from "@/app/api/ai-insights/trending/route";
import { TfIdf } from "natural";

// Euclidean distance function
const euclideanDistance = (p: number[], q: number[]): number => {
    let sum = 0;
    for (let i = 0; i < p.length; i++) {
        sum += Math.pow(p[i] - q[i], 2);
    }
    return Math.sqrt(sum);
};

export const clusterMeetings = (slots: PartialSlot[], numClusters = 4) => {
    const numSlots = slots.length;

    // If there are no slots, return an empty result or handle gracefully
    if (numSlots === 0) {
        return [];
    }

    // Ensure numClusters is greater than 0 and smaller than the number of slots
    const validNumClusters = Math.min(numClusters, numSlots); // Adjust to avoid 0 clusters
    if (validNumClusters <= 0) {
        throw new Error("Number of clusters must be greater than 0 and smaller than the number of slots.");
    }

    const tfidf = new TfIdf();

    // Add documents to TF-IDF
    slots.forEach(slot => {
        const text = `${slot.title} ${slot.description} ${slot.tags.join(" ")}`.toLowerCase();
        tfidf.addDocument(text);
    });

    // Convert TF-IDF data to vectors
    const vectors = tfidf.documents.map((_, i) => {
        return tfidf.listTerms(i).map(term => term.tfidf);
    });

    // Define options for the kmeans algorithm
    const options = {
        maxIterations: 100,  // Maximum iterations for convergence
        tolerance: 0.0001,   // Tolerance for error
        distanceFunction: euclideanDistance,  // Function for Euclidean distance
        initialization: 'kmeans++' as kmeans.InitializationMethod, // Initialization method (predefined value)
    };

    // Use kmeans with the options object
    const result = kmeans.kmeans(vectors, validNumClusters, options);  // Pass vectors, validNumClusters, and options

    return result.clusters;  // Return the clusters
};
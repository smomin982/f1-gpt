import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { pipeline } from "@xenova/transformers";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import "dotenv/config"// Hide secret variables and tokens

type SimilarityMetric = 'dot_product' | 'cosine'

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN
} = process.env

let embeddingModel: unknown = null

const initializeEmbeddingModel = async () => {
    if (!embeddingModel) {
        embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
    }
    return embeddingModel
}

const f1Data = [
    'https://en.wikipedia.org/wiki/Formula_One',
    'https://www.formula1.com/en/latest/all',
    'https://www.formula1.com/en/racing/2024.html',
    'https://www.autosport.com/f1/',
    'https://www.motorsport.com/f1/',
    'https://www.espn.com/f1/',
    'https://www.bbc.com/sport/formula1',
    'https://www.skysports.com/f1',
    'https://en.wikipedia.org/wiki/List_of_Formula_One_drivers',
    'https://en.wikipedia.org/wiki/List_of_Formula_One_constructors',
    'https://www.fia.com/formula-1'
]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT!, { keyspace: ASTRA_DB_NAMESPACE })

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
})

const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true
        },
        gotoOptions: {
            waitUntil: "domcontentloaded"
        },
        evaluate: async (page, browser) => {
            const result = await page.evaluate(() => document.body.innerHTML)
            await browser.close()
            return result
        }
    })

    return (await loader.scrape())?.replace(/<[^>]*>?/gm, '')
}

const createCollection = async (similarityMetric: SimilarityMetric = 'dot_product') => {
    try {
        const res = await db.createCollection(ASTRA_DB_COLLECTION!, {
            vector: {
                dimension: 384,
                metric: similarityMetric
            }
        })
        console.log("Created new collection:", res)
    } catch (error: unknown) {
        if (error instanceof Error && error.message?.includes('Collection already exists')) {
            console.log("Collection already exists. Checking if we need to recreate it...")

            // Checking if the collection already exists, in the case, delete it and recreate it
            try {
                await db.dropCollection(ASTRA_DB_COLLECTION!)
                console.log("Dropped existing collection")

                const res = await db.createCollection(ASTRA_DB_COLLECTION!, {
                    vector: {
                        dimension: 384,
                        metric: similarityMetric
                    }
                })
                console.log("Created new collection with correct settings:", res)
            } catch {
                console.log("Could not recreate collection. Using existing collection.")
            }
        } else {
            throw error
        }
    }
}

const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION!)
    const model = await initializeEmbeddingModel()

    for await (const url of f1Data) {
        console.log(`Processing: ${url}`)
        const content = await scrapePage(url)
        const chunks = await splitter.splitText(content)

        for await (const chunk of chunks) {
            const output = await (model as any)(chunk, { pooling: 'mean', normalize: true })
            const vector = Array.from(output.data)

            const res = await collection.insertOne({
                $vector: vector,
                text: chunk,
                source: url
            })

            console.log(`Inserted chunk from ${url}:`, res)
        }
    }
}

// Main execution
const main = async () => {
    try {
        console.log("Starting database seeding...")

        console.log("Creating collection...")
        await createCollection()

        console.log("Loading sample data...")
        await loadSampleData()

        console.log("Database seeding completed!")
    } catch (error) {
        console.error("Error during seeding:", error)
        process.exit(1)
    }
}

// Run the main function
main()
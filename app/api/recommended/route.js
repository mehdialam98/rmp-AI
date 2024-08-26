import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';


export async function POST(req) {
  try {
    const data = await req.json();
    const pc = new Pinecone(
      {
        apiKey: process.env.PINECONE_API_KEY
      }
    );

    
    const index = pc.index('rag-last').namespace('ns1');
    const openai = new OpenAI();
    const text = data['qualities'];
    console.log(text)
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    })

    const results = await index.query({
      topK: 2,
      includeMetadata: true,
      vector: embedding.data[0].embedding,
    });

    let resultString = 'Results:';
    results.matches.forEach((match) => {
      const reviewData = match.metadata;
      console.log(reviewData)
      resultString += `
      Professor: ${match.id}
      Reviews: ${reviewData.reviews}  
      \n\n`;
    });
    
    return new NextResponse(JSON.stringify({result: resultString}));
  } catch (error) {
    console.error('Error in POST:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

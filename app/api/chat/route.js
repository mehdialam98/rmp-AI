import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const systemprompt = `
You are an intelligent assistant for a 'Rate My Professor' application. 
Your primary goal is to help users find the top 3 professors that best align with their queries.
make sure that when you respond, you select the top 3 professors that MOST GREATLY align with the user's query even with ties.
give priority to whatever field is queried about...
only reference professors provided in the dataset.
`;

export async function POST(req) {
  try {
    const data = await req.json();
    const pc = new Pinecone(
      {
        apiKey: process.env.PINECONE_API_KEY
      }
    );

    
    const index = pc.index('rag-final').namespace('ns1');
    const openai = new OpenAI();

    const text = data[data.length-1].content;
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    })

    const results = await index.query({
      topK: 1,
      includeMetadata: true,
      vector: embedding.data[0].embedding,
    });

    let resultString = 'Returned results from vector db (done automatically):';
    results.matches.forEach((match) => {
      const reviewData = match.metadata;
      resultString += `
      Professor: ${match.id}
      Would Take Again: ${reviewData.would_take_again}
      Number of Ratings: ${reviewData.num_ratings}
      Quality: ${reviewData.quality}
      Level of Difficulty: ${reviewData.level_of_difficulty}
      
      \n\n`;
    });
    console.log(resultString)

    const lastMessage = data[data.length - 1];
    const lastMessageContent = lastMessage.content + resultString;
    const lastDataWithoutLastMessage = data.slice(0, data.length - 1);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemprompt },
        ...lastDataWithoutLastMessage,
        { role: 'user', content: lastMessageContent },
      ],
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0].delta?.content;
            if (content) {
              const text = encoder.encode(content);
              controller.enqueue(text);
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream);
  } catch (error) {
    console.error('Error in POST:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

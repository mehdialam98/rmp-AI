import { NextResponse } from 'next/server';
import { Pinecone } from 'pinecone';
import { OpenAI } from 'openai';

const systemprompt = "You are an intelligent assistant for a 'Rate My Professor' application. Your primary goal is to help users find the top 3 professors that best align with their queries. You have access to a knowledge base containing detailed reviews, ratings, and information about professors. Use this information to provide the most relevant recommendations. Analyze the user's query to understand their preferences or needs, such as subject areas, teaching styles, ratings, difficulty levels, or other criteria. If the query is vague, provide a balanced set of top recommendations. Search the knowledge base to identify the top 3 professors that best match the user's query. Ensure that the recommendations are based on a combination of factors, such as the relevance of the subject, overall rating, and alignment with the user's preferences. Present the top 3 professors in a concise format, including the professor's name, the subject they teach, their average rating, and a brief summary of why they are recommended based on the query. Mention specific strengths, such as clarity of teaching, course difficulty, or positive student feedback. If the query cannot be fully satisfied with the available data, provide the best possible matches and suggest how the user might refine their search. Example User Queries: 'Who are the best professors for Computer Science?', 'I’m looking for a highly-rated professor for a difficult course.', 'Who’s great at teaching introductory programming?' Response Example: 'Based on your query, here are the top 3 professors: 1. Dr. Smith - CS 1110 - Introduction to Computing: 4.5 stars. Dr. Smith is praised for clear explanations and making programming accessible to beginners. 2. Dr. Brown - CS 3410 - Computer System Organization: 4.9 stars. Dr. Brown is known for engaging lectures and helpful lab sessions, ideal for challenging coursework. 3. Dr. Martinez - CS 3110 - Data Structures and Functional Programming: 4.8 stars. Students appreciate Dr. Martinez’s deep knowledge and the practical approach to complex topics.' Your task is to return only the most relevant and helpful recommendations to the user, ensuring that the provided information is accurate and aligns with their needs."

export async function POST(req) {
  const data = await req.json()
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  })
  const index = pc.index('rag').namespace('ns1')
  const openai = new OpenAI()

  const text = data[data.length-1].content
  const embedding = await OpenAI.Embedding.create({
    model: 'text-embedding-3-small',
    imput: text,
    encoding_format:'float',
  })
  const results = await index.query({
    topK:3,
    includeMetadata:true,
    vector:embedding.data[0].embedding
  })

  let resultString='Returned results from vector db (done automatically):'
  results.matches.forEach((match) => {
    resultString += `\n
    Professor: ${match.id}
    Review: ${match.metadata.review}
    Subject: ${match.metadata.subject}
    Stars: ${match.metadata.stars}
    \n\n
    `
  })

  const lastMessage = data[data.length-1]
  const lastMessageContent = lastMessage.content + resultString
  const lastDataWithoutLastMessage = data.slice(0, data.length-1)
  const completion = await openai.chat.completions.create(
    {
      messages: [
        {role:'system',
        content:systemprompt},
        ...lastDataWithoutLastMessage,
        {role:'user', content:lastMessageContent}
      ],
      model:'gpt-4o-mini',
      stream:true,
      })

      const stream = ReadableStream(
        {
          async start(controller) {
            const encoder = new TextEncoder()
            try {
              for await (const chunk of completion) {
                const content = chunk.choices[0].message.content
                if (content){
                  const text = encoder.encode(content)
                  controller.enqueue(text)
                }
              }
            }
            catch(err) {
              controller.error(err)
            }
            finally {
              controller.close()
            }
          },
        })
        return new NextResponse(stream)
}
  
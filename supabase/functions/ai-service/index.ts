import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { AIService } from '../_shared/ai-service.ts';

interface RequestBody {
  messages: Array<{ role: string; content: string }>;
  templateId?: string;
  templateParams?: Record<string, any>;
  config?: {
    provider?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  stream?: boolean;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const { messages, templateId, templateParams, config, stream } = await req.json() as RequestBody;
    
    // Initialize AI service
    const aiService = new AIService(config);
    
    if (stream) {
      // Set up streaming response
      const encoder = new TextEncoder();
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();
      
      // Start processing in the background
      (async () => {
        try {
          if (templateId && templateParams) {
            // Use template-based generation
            // This would require implementing the prompt manager in Deno
            // For now, we'll just use the messages directly
            await aiService.streamComplete(
              { messages, config },
              async (chunk) => {
                await writer.write(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
              }
            );
          } else {
            // Use direct message-based generation
            await aiService.streamComplete(
              { messages, config },
              async (chunk) => {
                await writer.write(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
              }
            );
          }
          
          // Signal completion
          await writer.write(encoder.encode('data: [DONE]\n\n'));
          await writer.close();
        } catch (error) {
          // Handle errors during streaming
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
          );
          await writer.close();
        }
      })();
      
      // Return the stream response
      return new Response(stream.readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response
      let result: string;
      
      if (templateId && templateParams) {
        // This would use the prompt manager in a real implementation
        // For now, we'll just use the messages directly
        result = await aiService.complete({ messages, config });
      } else {
        result = await aiService.complete({ messages, config });
      }
      
      return new Response(
        JSON.stringify({ result }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }
  } catch (error) {
    // Handle request errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

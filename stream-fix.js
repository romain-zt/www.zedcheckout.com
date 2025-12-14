// NEW STREAMING LOGIC (supafriends.ai style)
// Lines 661-731 replacement

  // 🔥 STREAM RESPONSE from Claude (supafriends.ai style)
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let fullText = '';
        
        // Create streaming request to Claude
        const claudeStream = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          temperature: 0.7,
          system: enhancedSystemPrompt,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          stream: true
        });

        // 🔵 STEP 1: Collect full response from Claude
        console.log('🔵 [Stream] Collecting response from Claude...');
        for await (const chunk of claudeStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            fullText += chunk.delta.text;
          }
        }
        console.log('🔵 [Stream] Response collected:', fullText.substring(0, 100));

        // 🔥 DECODE \n correctly
        const decodedText = fullText.replace(/\\n/g, '\n');

        // 🔥 PARSE JSON response (if formatted as JSON)
        let finalMessage = decodedText;
        let extractedData = {};
        let confidence = 0.7;

        try {
          const parsed = JSON.parse(decodedText);
          if (parsed.messages && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
            // ❗ FORCE ONLY FIRST MESSAGE (supafriends.ai rule)
            finalMessage = parsed.messages[0].content || parsed.messages[0].text || decodedText;
          }
          if (parsed.context_update) {
            extractedData = parsed.context_update.data_collected || {};
            confidence = parsed.context_update.confidence || 0.7;
          }
        } catch {
          // Not JSON, use plain text
          finalMessage = decodedText;
        }

        // 🔥 EXTRACT EMOTION from message (e.g., "[Happy] text" or "[Curious] text")
        let emotion = 'Neutral';
        const emotionMatch = finalMessage.match(/^\[([A-Za-z]+)\]/);
        if (emotionMatch) {
          emotion = emotionMatch[1];
        }

        // 🔥 CHECK IF RESEARCH NEEDED (if user mentioned a URL or website)
        let needsResearch = false;
        const urlRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(?:\/[^\s]*)?/g;
        const lastUserMessage = messages[messages.length - 1]?.content || '';
        if (typeof lastUserMessage === 'string' && urlRegex.test(lastUserMessage)) {
          needsResearch = true;
        }

        // 🔵 STEP 2: Send METADATA FIRST (supafriends.ai format)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'metadata',
          emotion,
          needsResearch,
          extractedData,
          confidence,
          emotionalState: emotion
        })}\n\n`));
        console.log('🔵 [Stream] Metadata sent:', { emotion, needsResearch });

        // 🔵 STEP 3: Send [SPLIT] marker
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'split'
        })}\n\n`));

        // 🔵 STEP 4: Stream message text in chunks (human-like typing)
        const chunkSize = 5;
        for (let i = 0; i < finalMessage.length; i += chunkSize) {
          const chunk = finalMessage.substring(i, i + chunkSize);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'chunk',
            content: chunk
          })}\n\n`));
          // Small delay for human-like typing effect
          await new Promise(resolve => setTimeout(resolve, 30));
        }

        // 🔵 STEP 5: Signal completion
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'done',
          message: finalMessage,
          extractedData,
          confidence,
          emotion
        })}\n\n`));
        console.log('🔵 [Stream] Stream completed successfully');
        controller.close();
        
      } catch (error: any) {
        console.error('Streaming error:', error);
        
        // Send error event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          message: error.message || 'An error occurred'
        })}\n\n`));
        controller.close();
      }
    }
  });

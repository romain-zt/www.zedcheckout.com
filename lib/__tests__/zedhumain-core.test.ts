/**
 * ZedHumAIn Core - Unit Tests
 * 
 * Tests for the intelligent conversation engine
 */

import { ZedHumAIn, createZedHumAIn, type Message } from '../zedhumain-core';

// Helper to create test messages
function createMessage(text: string, sender: 'user' | 'assistant' = 'user'): Message {
  return {
    id: `msg_${Date.now()}_${Math.random()}`,
    text,
    sender,
    timestamp: new Date().toISOString(),
  };
}

// Helper to wait for async operations
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('ZedHumAIn Core', () => {
  
  describe('Initialization', () => {
    it('should create instance with default context', () => {
      const engine = createZedHumAIn();
      const context = engine.getContext();
      
      expect(context.facts.size).toBe(0);
      expect(context.corrections).toEqual([]);
      expect(context.objectives).toEqual([]);
      expect(context.stage).toBe('initial');
    });
    
    it('should create instance with custom context', () => {
      const engine = createZedHumAIn({
        stage: 'qualification',
        objectives: ['boost_sales'],
      });
      
      const context = engine.getContext();
      expect(context.stage).toBe('qualification');
      expect(context.objectives).toContain('boost_sales');
    });
  });
  
  describe('Intent Detection', () => {
    it('should detect CORRECTION intent', async () => {
      const engine = createZedHumAIn();
      const responses: string[][] = [];
      
      engine.onResponse((msgs) => responses.push(msgs));
      
      await engine.processMessage(createMessage('non, pas coiffure, massages'));
      await wait(1500);
      
      expect(responses.length).toBeGreaterThan(0);
      expect(responses[0][0]).toContain('pardon');
    });
    
    it('should detect CONFIRMATION intent', async () => {
      const engine = createZedHumAIn();
      const responses: string[][] = [];
      
      engine.onResponse((msgs) => responses.push(msgs));
      
      await engine.processMessage(createMessage('oui'));
      await wait(1500);
      
      expect(responses.length).toBeGreaterThan(0);
      // Should contain positive acknowledgment
      expect(responses[0].join(' ').toLowerCase()).toMatch(/parfait|super|ok/);
    });
    
    it('should detect CLARIFICATION intent', async () => {
      const engine = createZedHumAIn();
      const responses: string[][] = [];
      
      engine.onResponse((msgs) => responses.push(msgs));
      
      await engine.processMessage(createMessage('je veux vendre'));
      await engine.processMessage(createMessage('et plus'));
      await wait(3000);
      
      expect(responses.length).toBeGreaterThan(0);
    });
  });
  
  describe('Message Batching', () => {
    it('should batch rapid messages', async () => {
      const engine = createZedHumAIn();
      let responseCalls = 0;
      
      engine.onResponse(() => responseCalls++);
      
      // Send 3 rapid messages
      await engine.processMessage(createMessage('je cherche'));
      await engine.processMessage(createMessage('à vendre'));
      await engine.processMessage(createMessage('mieux'));
      
      await wait(3000);
      
      // Should generate only 1 response for all 3 messages
      expect(responseCalls).toBe(1);
    });
    
    it('should process single message faster', async () => {
      const engine = createZedHumAIn();
      const timestamps: number[] = [];
      
      engine.onResponse(() => timestamps.push(Date.now()));
      
      const startTime = Date.now();
      await engine.processMessage(createMessage('oui'));
      await wait(1500);
      
      const responseTime = timestamps[0] - startTime;
      
      // Should respond within 1.5s
      expect(responseTime).toBeLessThan(1500);
    });
  });
  
  describe('Context Management', () => {
    it('should extract and store facts', async () => {
      const engine = createZedHumAIn();
      
      await engine.processMessage(createMessage('mon site est https://example.com'));
      await wait(2000);
      
      const context = engine.getContext();
      const facts = Array.from(context.facts.values());
      
      expect(facts.some(f => f.value.includes('example.com'))).toBe(true);
    });
    
    it('should track corrections', async () => {
      const engine = createZedHumAIn();
      
      await engine.processMessage(createMessage('je fais de la coiffure'));
      await wait(2000);
      
      await engine.processMessage(createMessage('non, pas coiffure, massages'));
      await wait(2000);
      
      const context = engine.getContext();
      expect(context.corrections.length).toBeGreaterThan(0);
    });
    
    it('should maintain message history window', async () => {
      const engine = createZedHumAIn();
      
      // Send 25 messages (more than window size of 20)
      for (let i = 0; i < 25; i++) {
        await engine.processMessage(createMessage(`message ${i}`));
      }
      
      await wait(3000);
      
      const context = engine.getContext();
      expect(context.messageHistory.length).toBeLessThanOrEqual(20);
    });
  });
  
  describe('Response Quality', () => {
    it('should not repeat questions', async () => {
      const engine = createZedHumAIn();
      const responses: string[][] = [];
      
      engine.onResponse((msgs) => responses.push(msgs));
      
      // Simulate a question being asked
      engine.updateFact('questions_asked', 'Quelle est votre plateforme ?', 1.0, 'test');
      
      await engine.processMessage(createMessage('je veux améliorer'));
      await wait(2000);
      
      const allResponses = responses.flat().join(' ');
      expect(allResponses.toLowerCase()).not.toContain('quelle est votre plateforme');
    });
    
    it('should limit consecutive bot messages', async () => {
      const engine = createZedHumAIn();
      const responses: string[][] = [];
      
      engine.onResponse((msgs) => responses.push(msgs));
      
      await engine.processMessage(createMessage('hello world with lots of info'));
      await wait(2000);
      
      // Should not exceed 3 messages
      expect(responses[0].length).toBeLessThanOrEqual(3);
    });
    
    it('should handle correction gracefully', async () => {
      const engine = createZedHumAIn();
      const responses: string[][] = [];
      
      engine.onResponse((msgs) => responses.push(msgs));
      
      await engine.processMessage(createMessage('non, pas ça, autre chose'));
      await wait(2000);
      
      const firstMessage = responses[0][0].toLowerCase();
      expect(firstMessage).toMatch(/pardon|désolé|mal compris/);
    });
  });
  
  describe('Context Export/Import', () => {
    it('should export context as JSON', () => {
      const engine = createZedHumAIn();
      engine.updateFact('website', 'https://example.com', 1.0, 'test');
      
      const exported = engine.exportContext();
      const parsed = JSON.parse(exported);
      
      expect(parsed.facts).toBeDefined();
      expect(Array.isArray(parsed.facts)).toBe(true);
    });
    
    it('should import context from JSON', () => {
      const engine1 = createZedHumAIn();
      engine1.updateFact('website', 'https://example.com', 1.0, 'test');
      
      const exported = engine1.exportContext();
      
      const engine2 = createZedHumAIn();
      engine2.importContext(exported);
      
      const context = engine2.getContext();
      expect(context.facts.has('website')).toBe(true);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      const engine = createZedHumAIn();
      let errorCaught = false;
      
      engine.onErrorCallback((error) => {
        errorCaught = true;
      });
      
      // This should not crash
      await engine.processMessage(createMessage(''));
      await wait(2000);
      
      // Engine should still be functional
      await engine.processMessage(createMessage('test'));
      await wait(2000);
    });
  });
  
  describe('Real Conversation Scenario', () => {
    it('should handle the massage vs coiffure scenario', async () => {
      const engine = createZedHumAIn();
      const responses: string[][] = [];
      
      engine.onResponse((msgs) => responses.push(msgs));
      
      // User says they have a coiffure salon (bot's mistake)
      await engine.processMessage(createMessage('hello'));
      await wait(2000);
      
      // Bot incorrectly assumes coiffure
      // User corrects
      await engine.processMessage(createMessage('non je fais des massages, pas de la coiffure'));
      await wait(2000);
      
      // Should have apology
      const allText = responses.flat().join(' ');
      expect(allText.toLowerCase()).toMatch(/pardon|désolé|mal compris/);
    });
    
    it('should handle rapid multiple messages', async () => {
      const engine = createZedHumAIn();
      let responseCount = 0;
      
      engine.onResponse(() => responseCount++);
      
      // Simulate the "C'est ça" + "je cherche à vendre mieux" + "et plus" scenario
      await engine.processMessage(createMessage("C'est ça"));
      await engine.processMessage(createMessage('je cherches a vendre mieux'));
      await engine.processMessage(createMessage('et plus'));
      
      await wait(3000);
      
      // Should batch into 1 response
      expect(responseCount).toBe(1);
    });
  });
});

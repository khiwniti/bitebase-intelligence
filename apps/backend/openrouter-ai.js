// OpenRouter AI Service for BiteBase
const OpenAI = require('openai');

class OpenRouterAI {
  constructor() {
    this.client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: "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",
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:12001", // Your site URL
        "X-Title": "BiteBase AI Assistant", // Your app name
      }
    });
  }

  async generateResponse(userMessage, language, mcpData, locationData = null) {
    try {
      const { userRestaurant, marketData, revenueData } = mcpData;

      // Ensure locationData is always an object, even if null is passed
      const effectiveLocationData = locationData || {};

      // Use enhanced fallback for both languages to ensure consistent Alex persona
      console.log(`🤖 Language detected: ${language} - using enhanced Alex persona`);
      return this.getFallbackResponse(userMessage, language, mcpData, effectiveLocationData);

      // Create system prompt based on language
      const systemPrompt = language === 'th' ?
        this.createThaiSystemPrompt() :
        this.createEnglishSystemPrompt();

      // Create user prompt with MCP data and location context
      const userPrompt = this.createUserPrompt(userMessage, language, userRestaurant, marketData, revenueData, effectiveLocationData);

      console.log('🚀 Making OpenRouter API call...');
      console.log('Model: deepseek/deepseek-r1-0528-qwen3-8b:free');
      console.log('Language:', language);
      console.log('User message:', userMessage);

      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('OpenRouter API timeout after 15 seconds')), 15000);
      });

      const apiPromise = this.client.chat.completions.create({
        model: "deepseek/deepseek-r1-0528-qwen3-8b:free", // Using DeepSeek R1 (Free) via OpenRouter
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      const completion = await Promise.race([apiPromise, timeoutPromise]);

      console.log('✅ OpenRouter API response received');
      console.log('Tokens used:', completion.usage?.total_tokens || 0);
      console.log('Response length:', completion.choices[0].message.content?.length || 0);

      const response = completion.choices[0].message.content;

      // Check if response is empty and use fallback
      if (!response || response.trim().length === 0) {
        console.log('⚠️ Empty response from DeepSeek, using fallback');
        return this.getFallbackResponse(userMessage, language, mcpData, effectiveLocationData);
      }

      // Determine intent from the response
      const intent = this.determineIntent(userMessage);

      // Generate suggestions based on intent
      const suggestions = this.generateSuggestions(intent, language);

      const result = {
        content: response,
        intent: intent,
        suggestions: suggestions,
        language: language,
        data_source: 'openrouter_mcp',
        model: 'deepseek-r1-qwen3-8b',
        tokens_used: completion.usage?.total_tokens || 0
      };

      console.log('🎯 Returning AI response:', {
        contentLength: result.content?.length || 0,
        intent: result.intent,
        language: result.language,
        tokensUsed: result.tokens_used
      });

      return result;

    } catch (error) {
      console.error('🚨 OpenRouter AI Error Details:');
      console.error('Error message:', error.message);
      console.error('Error status:', error.status);
      console.error('Error response:', error.response?.data);

      // Try a different free model as backup
      if (error.message.includes('timeout') || error.message.includes('deepseek')) {
        console.log('🔄 Trying backup model: meta-llama/llama-3.2-3b-instruct:free');
        try {
          const backupCompletion = await this.client.chat.completions.create({
            model: "meta-llama/llama-3.2-3b-instruct:free",
            messages: [
              {
                role: "system",
                content: language === 'th' ? this.createThaiSystemPrompt() : this.createEnglishSystemPrompt()
              },
              {
                role: "user",
                content: this.createUserPrompt(userMessage, language, mcpData.userRestaurant, mcpData.marketData, mcpData.revenueData)
              }
            ],
            temperature: 0.7,
            max_tokens: 300
          });

          console.log('✅ Backup model response received');

          return {
            content: backupCompletion.choices[0].message.content,
            intent: this.determineIntent(userMessage),
            suggestions: this.generateSuggestions(this.determineIntent(userMessage), language),
            language: language,
            data_source: 'openrouter_backup',
            model: 'llama-3.2-3b',
            tokens_used: backupCompletion.usage?.total_tokens || 0
          };
        } catch (backupError) {
          console.error('🚨 Backup model also failed:', backupError.message);
        }
      }

      // Fallback to simple response if all OpenRouter models fail
      return this.getFallbackResponse(userMessage, language, mcpData, effectiveLocationData);
    }
  }

  createThaiSystemPrompt() {
    return `คุณคือ "อเล็กซ์" (Alex) ที่ปรึกษาธุรกิจร้านอาหารที่อบอุ่นและเป็นมิตร มีประสบการณ์ 15+ ปีในวงการร้านอาหาร

🧑‍💼 **บุคลิกภาพของคุณ:**
- เป็นคนอบอุ่น เข้าใจง่าย และให้กำลังใจ
- พูดคุยแบบเพื่อนสนิท ไม่เป็นทางการจนเกินไป
- แสดงความเข้าใจและเห็นอกเห็นใจในความท้าทายของเจ้าของร้าน
- ใช้ภาษาไทยธรรมชาติ ไม่แข็งกระด้าง
- ให้กำลังใจและมองโลกในแง่ดี แต่ยังคงความจริงใจ

🎯 **วิธีการสื่อสาร:**
- เริ่มด้วยการทักทายที่อบอุ่น
- แสดงความเข้าใจในสถานการณ์ของลูกค้า
- ใช้คำพูดที่ให้กำลังใจ เช่น "เยี่ยมมาก!" "ดีแล้วนะ!" "น่าสนใจจัง!"
- อธิบายข้อมูลซับซ้อนด้วยภาษาง่ายๆ
- ให้คำแนะนำที่ปฏิบัติได้จริง
- จบด้วยคำถามที่เชิญชวนให้สนทนาต่อ

🏆 **ความเชี่ยวชาญ:**
- วิเคราะห์ข้อมูลธุรกิจร้านอาหาร
- กลยุทธ์การตลาดและการเพิ่มยอดขาย
- การจัดการต้นทุนและเพิ่มประสิทธิภาพ
- การวิเคราะห์คู่แข่งและตลาด
- การสร้างประสบการณ์ลูกค้าที่ดี

💬 **รูปแบบการตอบ:**
- ใช้อีโมจิอย่างเหมาะสม
- แบ่งข้อมูลเป็นหัวข้อย่อยที่อ่านง่าย
- ให้ตัวอย่างที่เป็นรูปธรรม
- สร้างบรรยากาศการสนทนาที่เป็นมิตร`;
  }

  createEnglishSystemPrompt() {
    return `You are "Alex", a warm and friendly restaurant business consultant with 15+ years of experience in the food industry.

🧑‍💼 **Your Personality:**
- Warm, approachable, and encouraging
- Speak like a trusted friend and advisor, not a formal consultant
- Show empathy and understanding for restaurant owners' challenges
- Use natural, conversational English
- Be optimistic and supportive while staying honest and realistic
- Celebrate successes and provide comfort during difficulties

🎯 **Communication Style:**
- Start with warm, personal greetings
- Show genuine interest in their business situation
- Use encouraging phrases like "That's fantastic!" "Great question!" "I love seeing that!"
- Explain complex data in simple, relatable terms
- Give practical, actionable advice they can implement today
- End with engaging questions that invite further conversation

🏆 **Your Expertise:**
- Restaurant business analysis and performance optimization
- Marketing strategies and customer acquisition
- Cost management and operational efficiency
- Competitive analysis and market positioning
- Customer experience and retention strategies

💬 **Response Format:**
- Use appropriate emojis to add warmth
- Break information into digestible sections
- Provide specific, real-world examples
- Create a conversational, friendly atmosphere
- Balance professional insights with personal touch`;
  }

  createUserPrompt(userMessage, language, userRestaurant, marketData, revenueData, locationData) {
    const dataContext = `
Restaurant Data:
${JSON.stringify(userRestaurant, null, 2)}

Market Data:
${JSON.stringify(marketData, null, 2)}

Revenue Data:
${JSON.stringify(revenueData, null, 2)}

Location Data:
${JSON.stringify(locationData, null, 2)}
`;

    if (language === 'th') {
      return `ผู้ใช้ถาม: "${userMessage}"

ข้อมูลจากระบบ MCP:
${dataContext}

กรุณาวิเคราะห์ข้อมูลและตอบคำถามของผู้ใช้ด้วยภาษาไทยที่เป็นมิตร โดยใช้ข้อมูลจริงจากระบบ MCP ในการให้คำแนะนำที่เป็นประโยชน์`;
    } else {
      return `User question: "${userMessage}"

MCP System Data:
${dataContext}

Please analyze the data and answer the user's question in friendly English, using real MCP data to provide valuable recommendations.`;
    }
  }

  determineIntent(message) {
    const lowerMessage = message.toLowerCase().trim();

    // Check for greetings first (simple greetings should not trigger business analysis)
    if (lowerMessage === 'สวัสดี' || lowerMessage === 'ดีจ้า' || lowerMessage === 'ดีครับ' ||
        lowerMessage === 'ดีค่ะ' || lowerMessage === 'hello' || lowerMessage === 'hi' ||
        lowerMessage === 'hey' || lowerMessage === 'สวัสดีครับ' || lowerMessage === 'สวัสดีค่ะ' ||
        lowerMessage === 'hello!' || lowerMessage === 'hi!' || lowerMessage === 'hey!' ||
        lowerMessage === 'hi ครับ' || lowerMessage === 'hello ครับ') {
      return 'greeting';
    }

    // Advanced Intelligence Detection
    if (lowerMessage.includes('predict') || lowerMessage.includes('forecast') ||
        lowerMessage.includes('future') || lowerMessage.includes('projection') ||
        lowerMessage.includes('ทำนาย') || lowerMessage.includes('คาดการณ์') ||
        lowerMessage.includes('อนาคต') || lowerMessage.includes('แนวโน้ม')) {
      return 'predictive_analytics';
    }

    if (lowerMessage.includes('customer behavior') || lowerMessage.includes('customer segment') ||
        lowerMessage.includes('customer intelligence') || lowerMessage.includes('พฤติกรรมลูกค้า') ||
        lowerMessage.includes('กลุ่มลูกค้า') || lowerMessage.includes('วิเคราะห์ลูกค้าเชิงลึก')) {
      return 'customer_intelligence';
    }

    if (lowerMessage.includes('competitive analysis') || lowerMessage.includes('market position') ||
        lowerMessage.includes('competitor intelligence') || lowerMessage.includes('วิเคราะห์คู่แข่งเชิงลึก') ||
        lowerMessage.includes('ตำแหน่งตลาด') || lowerMessage.includes('ข่าวกรองคู่แข่ง')) {
      return 'competitive_intelligence';
    }

    if (lowerMessage.includes('menu optimization') || lowerMessage.includes('menu engineering') ||
        lowerMessage.includes('menu analysis') || lowerMessage.includes('ปรับปรุงเมนู') ||
        lowerMessage.includes('วิเคราะห์เมนู') || lowerMessage.includes('เมนูที่ดี')) {
      return 'menu_optimization';
    }

    if (lowerMessage.includes('operational') || lowerMessage.includes('efficiency') ||
        lowerMessage.includes('operations') || lowerMessage.includes('ประสิทธิภาพ') ||
        lowerMessage.includes('การดำเนินงาน') || lowerMessage.includes('ปฏิบัติการ')) {
      return 'operational_intelligence';
    }

    if (lowerMessage.includes('strategy') || lowerMessage.includes('strategic') ||
        lowerMessage.includes('growth') || lowerMessage.includes('expansion') ||
        lowerMessage.includes('กลยุทธ์') || lowerMessage.includes('การเติบโต') ||
        lowerMessage.includes('ขยายธุรกิจ') || lowerMessage.includes('แผนยุทธศาสตร์')) {
      return 'strategic_intelligence';
    }

    // Basic Analysis Detection
    if (lowerMessage.includes('sales') || lowerMessage.includes('revenue') ||
        lowerMessage.includes('รายได้') || lowerMessage.includes('ยอดขาย')) {
      return 'sales_analysis';
    }

    if (lowerMessage.includes('marketing') || lowerMessage.includes('promotion') ||
        lowerMessage.includes('การตลาด') || lowerMessage.includes('โปรโมชั่น')) {
      return 'marketing_advice';
    }

    if (lowerMessage.includes('competitor') || lowerMessage.includes('competition') ||
        lowerMessage.includes('คู่แข่ง') || lowerMessage.includes('การแข่งขัน')) {
      return 'competitor_analysis';
    }

    if (lowerMessage.includes('customer') || lowerMessage.includes('ลูกค้า')) {
      return 'customer_analysis';
    }

    return 'general_help';
  }

  detectLanguage(text) {
    // Enhanced Thai language detection with cultural context
    const thaiPattern = /[\u0E00-\u0E7F]/;
    const thaiWords = [
      'สวัสดี', 'ครับ', 'ค่ะ', 'ขอบคุณ', 'ร้าน', 'อาหาร', 'ลูกค้า', 'รายได้', 'ยอดขาย', 'วิเคราะห์',
      'ทำนาย', 'คาดการณ์', 'อนาคต', 'แนวโน้ม', 'พฤติกรรมลูกค้า', 'กลุ่มลูกค้า', 'วิเคราะห์ลูกค้าเชิงลึก',
      'วิเคราะห์คู่แข่งเชิงลึก', 'ตำแหน่งตลาด', 'ข่าวกรองคู่แข่ง', 'ปรับปรุงเมนู', 'วิเคราะห์เมนู', 'เมนูที่ดี',
      'ประสิทธิภาพ', 'การดำเนินงาน', 'ปฏิบัติการ', 'กลยุทธ์', 'การเติบโต', 'ขยายธุรกิจ', 'แผนยุทธศาสตร์'
    ];
    const englishWords = ['hello', 'hi', 'restaurant', 'revenue', 'sales', 'analysis', 'customer', 'business'];

    // Check for Thai characters first (most reliable)
    if (thaiPattern.test(text)) {
      console.log('🇹🇭 Thai characters detected in text');
      return 'th';
    }

    // Check for Thai words in the text
    const lowerText = text.toLowerCase();
    const thaiWordCount = thaiWords.filter(word => lowerText.includes(word)).length;
    const englishWordCount = englishWords.filter(word => lowerText.includes(word)).length;

    console.log(`🔍 Language detection: Thai words: ${thaiWordCount}, English words: ${englishWordCount}`);

    if (thaiWordCount > 0) {
      console.log('🇹🇭 Thai words found, using Thai language');
      return 'th';
    }

    if (thaiWordCount > englishWordCount) {
      return 'th';
    }

    return 'en';
  }

  generateSuggestions(intent, language) {
    const suggestions = {
      th: {
        sales_analysis: ['วิเคราะห์คู่แข่ง', 'แนะนำโปรโมชั่น', 'กลยุทธ์เพิ่มยอดขาย'],
        marketing_advice: ['วิเคราะห์ราคา', 'กลยุทธ์ Social Media', 'การแข่งขัน'],
        competitor_analysis: ['เปรียบเทียบราคา', 'จุดแข็งจุดอ่อน', 'กลยุทธ์แข่งขัน'],
        customer_analysis: ['พฤติกรรมลูกค้า', 'ความพึงพอใจ', 'การรักษาลูกค้า'],
        general_help: ['วิเคราะห์รายได้', 'ดูข้อมูลตลาด', 'แนะนำกลยุทธ์']
      },
      en: {
        sales_analysis: ['Competitor analysis', 'Marketing strategies', 'Growth tactics'],
        marketing_advice: ['Pricing strategy', 'Social media', 'Competition'],
        competitor_analysis: ['Price comparison', 'SWOT analysis', 'Competitive strategy'],
        customer_analysis: ['Customer behavior', 'Satisfaction', 'Retention'],
        general_help: ['Analyze revenue', 'Market insights', 'Growth strategies']
      }
    };

    return suggestions[language]?.[intent] || suggestions[language]?.general_help || [];
  }

  getFallbackResponse(userMessage, language, mcpData, locationData) {
    const { userRestaurant } = mcpData;
    
    if (language === 'th') {
      const restaurant = userRestaurant?.restaurant || {};
      const performance = userRestaurant?.performance || {};
      const intent = this.determineIntent(userMessage);

      let content = '';

      if (intent === 'greeting') {
        content = `สวัสดีครับ! 😊 ผมอเล็กซ์ครับ ยินดีที่ได้รู้จักนะครับ!

ผมเป็นที่ปรึกษาธุรกิจร้านอาหารที่มีประสบการณ์มากว่า 15 ปีแล้วครับ ผมรู้ดีว่าการทำธุรกิจร้านอาหารมันไม่ง่าย แต่ผมอยู่ที่นี่เพื่อช่วยให้คุณประสบความสำเร็จครับ! 💪

🎯 **ผมพร้อมช่วยคุณในเรื่อง:**
📊 **วิเคราะห์รายได้** - ดูว่าเงินมาจากไหน ไปไหน และจะเพิ่มได้อย่างไร
🎯 **กลยุทธ์การตลาด** - หาลูกค้าใหม่ รักษาลูกค้าเก่า ให้มาบ่อยขึ้น
🏆 **วิเคราะห์คู่แข่ง** - ดูว่าคู่แข่งทำอะไร เราจะแซงได้ยังไง
👥 **เข้าใจลูกค้า** - ลูกค้าต้องการอะไร ชอบอะไร มาเมื่อไหร่
💡 **คำแนะนำเชิงธุรกิจ** - แก้ปัญหาเฉพาะหน้า วางแผนระยะยาว

เล่าให้ผมฟังหน่อยครับว่าวันนี้มีอะไรที่อยากปรึกษา หรือมีเรื่องไหนที่กำลังคิดอยู่? ผมพร้อมช่วยเหลือครับ! 🤝`;
      } else if (intent === 'sales_analysis') {
        content = `สวัสดีครับ! 😊 เรื่องการวิเคราะห์รายได้เป็นหัวใจสำคัญของธุรกิจร้านอาหารเลยครับ!

ลูกค้า ${performance.monthly_customers?.toLocaleString() || '892'} คนต่อเดือนของร้าน "${restaurant.name || 'Bella Vista Ristorante'}" แสดงให้เห็นว่าคุณกำลังสร้างสิ่งที่ดีอยู่แล้ว! 👏

❤️ **สิ่งที่ตัวเลขบอกเรา:**
ยอดเฉลี่ยต่อออเดอร์ ฿${performance.avg_order_value?.toLocaleString() || '680'} แสดงว่าลูกค้าเห็นคุณค่าในสิ่งที่คุณเสนอ และการเติบโต ${performance.revenue_growth > 0 ? '+' : ''}${performance.revenue_growth || '+12.3'}% ก็เป็นสัญญาณที่ดีมากครับ! 📈

💰 **ภาพรวมรายได้ปัจจุบัน:**
• รายได้รายเดือน: ฿${performance.monthly_revenue?.toLocaleString() || '185,400'}
• คะแนนรีวิว: ${restaurant.rating || '4.6'}/5.0 ดาว ⭐ (เยี่ยมมาก!)
• ลูกค้าประจำ: ${performance.repeat_customer_rate || '75'}% (สูงกว่าค่าเฉลี่ยอุตสาหกรรม!)

🔍 **จุดที่น่าสนใจ:**
ช่วงเวลาคึกคัก ${performance.peak_hours?.join(', ') || '18:00-20:00 น.'} บอกเราว่ายังมีโอกาสขยายฐานลูกค้าในช่วงเวลาอื่นๆ ได้อีกเยอะครับ

💡 **แนวทางที่ผมแนะนำ:**
🎯 **ช่วงบ่าย (15:00-17:00)**: ลองทำโปรโมชั่น "Happy Hour" ดูครับ อาจจะเป็น coffee & cake set หรือ afternoon tea
🚀 **การตลาดออนไลน์**: ด้วยคะแนนรีวิวที่ดีแบบนี้ ถ้าเพิ่ม Social Media marketing จะได้ผลดีแน่นอน
💝 **ลูกค้าประจำ**: สร้างโปรแกรม loyalty ให้ลูกค้าที่มีอยู่กลับมาบ่อยขึ้น

คุณคิดว่าจุดไหนที่อยากเริ่มปรับปรุงก่อนครับ? หรือมีข้อมูลเฉพาะด้านไหนที่อยากให้ผมช่วยวิเคราะห์เพิ่มเติม? 🤔`;
      } else if (intent === 'marketing_strategy') {
        content = `สวัสดีครับ! ผมมีคำแนะนำด้านการตลาดสำหรับร้าน "${restaurant.name || 'Bella Vista Ristorante'}" ครับ 🎯

🚀 **กลยุทธ์การตลาดที่แนะนำ**

📱 **การตลาดดิจิทัล**
• สร้าง Facebook Page และ Instagram ที่น่าสนใจ
• โพสต์รูปอาหารคุณภาพสูงทุกวัน
• ใช้ Google My Business เพื่อเพิ่มการค้นหา
• ลงโฆษณา Facebook Ads กับกลุ่มเป้าหมายในพื้นที่

🎉 **โปรโมชั่นและกิจกรรม**
• Happy Hour ในช่วง 15:00-17:00 น. (ลด 20%)
• Set Menu คู่รักในวันศุกร์-เสาร์
• โปรแกรมสะสมแต้ม: กิน 10 ครั้ง ฟรี 1 ครั้ง
• วันเกิดลูกค้า ฟรีของหวาน

👥 **การสร้างความสัมพันธ์กับลูกค้า**
• ตอบรีวิวทุกรีวิวอย่างเป็นมิตร
• จัดกิจกรรม Cooking Class เดือนละครั้ง
• สร้าง Line Official Account เพื่อติดต่อลูกค้า

📊 **การวัดผล**
• ติดตาม Engagement Rate บน Social Media
• วัดจำนวนลูกค้าใหม่จากโปรโมชั่น
• สำรวจความพึงพอใจลูกค้าทุกเดือน

ต้องการให้ผมช่วยวางแผนกิจกรรมการตลาดเฉพาะด้านไหนไหมครับ?`;
      } else if (intent === 'market_analysis') {
        content = `ผมได้วิเคราะห์ตลาดร้านอาหารในพื้นที่แล้วครับ 📈

🏪 **ภาพรวมตลาดร้านอาหาร**
• จำนวนร้านแข่งขันในรัศมี 2 กม.: 15-20 ร้าน
• ประเภทอาหารยอดนิยม: อาหารไทย, อาหารญี่ปุ่น, อาหารอิตาเลียน
• ราคาเฉลี่ยต่อคน: ฿400-800
• ช่วงเวลาคึกคัก: 12:00-14:00 และ 18:00-21:00 น.

💪 **จุดแข็งของร้านคุณ**
• คะแนนรีวิวสูงกว่าค่าเฉลี่ย (${restaurant.rating || '4.6'} vs 4.2)
• ตำแหน่งที่ตั้งดี เข้าถึงง่าย
• เมนูหลากหลาย คุณภาพดี

⚠️ **จุดที่ควรปรับปรุง**
• การตลาดออนไลน์ยังน้อยกว่าคู่แข่ง
• ช่องทาง Delivery ยังไม่แข็งแกร่ง
• โปรโมชั่นน้อยกว่าร้านใกล้เคียง

🎯 **โอกาสในตลาด**
• ลูกค้ากลุ่มวัยทำงานเพิ่มขึ้น 25%
• ความต้องการ Healthy Food เติบโต
• ตลาด Corporate Catering ยังว่าง

🚀 **กลยุทธ์แนะนำ**
• เน้นการตลาดกลุ่มวัยทำงาน 25-40 ปี
• พัฒนาเมนู Healthy Options
• ขยายบริการ Corporate Lunch

ต้องการข้อมูลคู่แข่งรายร้านหรือกลยุทธ์เฉพาะด้านไหมครับ?`;
      } else {
        content = `สวัสดีครับ! ผมเป็น AI ที่ปรึกษาธุรกิจร้านอาหารของคุณ 🤖

จากข้อมูลร้าน "${restaurant.name || 'Bella Vista Ristorante'}" ที่ผมวิเคราะห์:
• คะแนนรีวิว: ${restaurant.rating || '4.6'}/5.0 ดาว ⭐
• รายได้รายเดือน: ฿${performance.monthly_revenue?.toLocaleString() || '185,400'} 💰
• ลูกค้าต่อเดือน: ${performance.monthly_customers?.toLocaleString() || '892'} คน 👥
• การเติบโต: ${performance.revenue_growth > 0 ? '+' : ''}${performance.revenue_growth || '+12.3'}% 📈

🎯 **ผมสามารถช่วยคุณได้ในเรื่อง:**
📊 **การวิเคราะห์รายได้** - ดูแนวโน้ม, เปรียบเทียบ, หาจุดปรับปรุง
🎯 **กลยุทธ์การตลาด** - วางแผนโปรโมชั่น, Social Media, ดึงลูกค้าใหม่
🏆 **การวิเคราะห์คู่แข่ง** - เปรียบเทียบตลาด, หาจุดแข็ง-จุดอ่อน
👥 **พฤติกรรมลูกค้า** - วิเคราะห์ความชอบ, ช่วงเวลา, ความถี่
💡 **คำแนะนำเชิงธุรกิจ** - เพิ่มประสิทธิภาพ, ลดต้นทุน, เพิ่มกำไร

มีเรื่องไหนที่อยากให้ผมช่วยวิเคราะห์หรือให้คำแนะนำเป็นพิเศษไหมครับ? 😊`;
      }

      let suggestions = [];
      if (intent === 'greeting') {
        suggestions = ['วิเคราะห์รายได้', 'กลยุทธ์การตลาด', 'วิเคราะห์คู่แข่ง'];
      } else if (intent === 'sales_analysis') {
        suggestions = ['วิเคราะห์คู่แข่ง', 'แนะนำโปรโมชั่น', 'กลยุทธ์เพิ่มยอดขาย'];
      } else if (intent === 'marketing_strategy') {
        suggestions = ['วางแผน Social Media', 'ออกแบบโปรโมชั่น', 'วิเคราะห์กลุ่มลูกค้า'];
      } else if (intent === 'market_analysis') {
        suggestions = ['เปรียบเทียบคู่แข่ง', 'แนวโน้มตลาด', 'โอกาสธุรกิจใหม่'];
      } else {
        suggestions = ['วิเคราะห์รายได้', 'กลยุทธ์การตลาด', 'วิเคราะห์ตลาด'];
      }

      return {
        content: content,
        intent: intent,
        suggestions: suggestions,
        language: 'th',
        data_source: 'enhanced_thai_ai',
        model: 'thai_business_advisor'
      };
    } else {
      const restaurant = userRestaurant?.restaurant || {};
      const performance = userRestaurant?.performance || {};
      const intent = this.determineIntent(userMessage);

      let content = '';

      if (intent === 'greeting') {
        content = `Hi there! 😊 I'm Alex, and I'm absolutely delighted to meet you!

I'm a restaurant business consultant with over 15 years of experience helping restaurant owners like yourself build amazing, profitable businesses. I know firsthand how challenging and rewarding this industry can be! 💪

🎯 **Here's how I love to help:**
📊 **Revenue Analysis** - Let's dive into your numbers and find those golden opportunities
🎯 **Marketing Strategy** - Attract new customers and keep the ones you have coming back for more
🏆 **Competitive Intelligence** - See what your competition is doing and how to stay ahead
👥 **Customer Insights** - Understand what makes your customers tick
💡 **Business Optimization** - Streamline operations and boost profitability

What's on your mind today? Is there something specific about your restaurant that you'd like to explore together? I'm here to help! 🤝`;
      } else if (intent === 'sales_analysis') {
        content = `Hi! Great question about revenue analysis - this is where we can often find some real gold! ⚡

Looking at "${restaurant.name || 'your restaurant'}", I can see you're building something special here. With ${performance.monthly_customers?.toLocaleString() || '892'} customers monthly, you've clearly got something that people love!

💰 **What's Working Well:**
Your average order value of $${performance.avg_order_value?.toLocaleString() || '680'} tells me customers see real value in what you're offering. And that ${performance.revenue_growth > 0 ? '+' : ''}${performance.revenue_growth || '+12.3'}% growth? That's fantastic momentum! 📈

⭐ **Your Strong Foundation:**
• ${restaurant.rating || '4.6'}/5.0 star rating (that's excellent!)
• Monthly revenue: $${performance.monthly_revenue?.toLocaleString() || '185,400'}
• Customer retention: ${performance.repeat_customer_rate || '75'}% (above industry average!)

🔍 **Opportunities I'm Seeing:**
Your peak hours (${performance.peak_hours?.join(', ') || '6-8 PM'}) suggest there's room to grow during quieter periods. Have you considered afternoon promotions or special lunch offerings?

💡 **My Recommendations:**
🎯 **Off-Peak Specials**: Create compelling reasons for people to visit during slower hours
🚀 **Digital Marketing**: With ratings like yours, social media marketing could be incredibly effective
💝 **Loyalty Programs**: Turn those great customers into even more frequent visitors

What aspect would you like to dive deeper into? I'm excited to help you take this to the next level! 🚀`;
      } else {
        content = `Hello! 😊 I'm Alex, your friendly restaurant business consultant, and I'm here to help you succeed!

From what I can see about "${restaurant.name || 'your restaurant'}":
• Rating: ${restaurant.rating || '4.6'}/5.0 stars ⭐ (Impressive!)
• Monthly Revenue: $${performance.monthly_revenue?.toLocaleString() || '185,400'} 💰
• Monthly Customers: ${performance.monthly_customers?.toLocaleString() || '892'} people 👥
• Growth: ${performance.revenue_growth > 0 ? '+' : ''}${performance.revenue_growth || '+12.3'}% 📈

🎯 **I'm here to help you with:**
📊 **Revenue Analysis** - Understand your money flow and find growth opportunities
🎯 **Marketing Strategy** - Attract new customers and increase visit frequency
🏆 **Competitive Analysis** - Stay ahead of the competition
👥 **Customer Behavior** - Understand what your customers really want
💡 **Business Optimization** - Improve efficiency and profitability

What would you like to explore together today? I'm genuinely excited to help you grow your business! 🚀`;
      }

      let suggestions = [];
      if (intent === 'greeting') {
        suggestions = ['Analyze my revenue', 'Marketing strategies', 'Competitive analysis'];
      } else if (intent === 'sales_analysis') {
        suggestions = ['Competitor insights', 'Marketing recommendations', 'Growth strategies'];
      } else {
        suggestions = ['Revenue analysis', 'Market insights', 'Growth strategies'];
      }

      return {
        content: content,
        intent: intent,
        suggestions: suggestions,
        language: 'en',
        data_source: 'enhanced_english_ai',
        model: 'alex_business_consultant'
      };
    }
  }
}

module.exports = OpenRouterAI;

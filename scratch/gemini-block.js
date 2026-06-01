    if (geminiKey) {
      // Clean base64 prefix for Gemini API
      const base64Clean = base64Img.split(',')[1];
      const mimeType = base64Img.split(';')[0].split(':')[1];
      
      let parsedItems = null;
      let lastError = null;
      
      // Dynamic fallback list to support all API keys (old, new, restricted)
      const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      
      for (const model of models) {
        try {
          console.log("Attempting OCR with Gemini model:", model);
          const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{
                parts: [
                  {
                    text: "Analyze this image of a handwritten or printed list, bill, invoice, or slip (parchi) of hardware/construction materials.\nYour task is to act like a professional accountant and perform a highly accurate extraction of all line items.\n\nFor each item in the table/list, extract:\n1. \"desc\": The exact and complete name/description of the item (e.g., \"FIBER GLASS 2-1/2\\\"\", \"NAILS 4\\\" X 8 10 PKT/ CASE SPARK\"). Do not truncate or omit sizes/details.\n2. \"qty\": The numerical quantity (e.g., 37.40, 3.00, 100.00). Parse this as a clean number (remove any commas or non-numeric characters except decimal points).\n3. \"unit\": The unit of measurement (standardized to match one of: Pcs, Kgs, Bag, Pkt's, ROLL, Tin's, Drm, Jar, Dozen, Case, Mtr).\n4. \"price\": The exact unit price (e.g., 163.00, 1710.00, 2.70). Parse this as a clean number.\n\nRules:\n- Capture EVERY SINGLE line item listed on the paper. Do not skip any item. If there are 21 items, extract all 21 items.\n- Ensure 100% accuracy of quantities and prices. Double check that they match the original image exactly.\n- Do not include totals, taxes, headers, or signature lines as items. Only extract individual goods/services.\n- Ensure that the math is consistent: Amount = Qty * Price.\n- Format the response as a raw JSON array of objects with keys: \"desc\", \"qty\", \"unit\", \"price\". Do not wrap the JSON in markdown blocks or add any other text. Return ONLY the valid JSON array."
                  },
                  {
                    inlineData: {
                      mimeType: mimeType || "image/jpeg",
                      data: base64Clean
                    }
                  }
                ]
              }]
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            const textResult = data.candidates[0].content.parts[0].text.trim();
            console.log(`Success with model ${model}. Raw Result:`, textResult);
            
            let cleanJson = textResult.trim();
            if (cleanJson.startsWith('```')) {
              cleanJson = cleanJson.replace(/^\`\`\`(json)?/i, '').replace(/\`\`\`$/, '').trim();
            }
            const jsonStart = cleanJson.indexOf('[');
            const jsonEnd = cleanJson.lastIndexOf(']');
            if (jsonStart !== -1 && jsonEnd !== -1) {
              cleanJson = cleanJson.substring(jsonStart, jsonEnd + 1);
            }
            
            parsedItems = JSON.parse(cleanJson);
            break; // Success! Exit the fallback loop
          } else {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error?.message || `HTTP ${response.status}`;
            console.warn(`Model ${model} failed: ${errMsg}`);
            lastError = new Error(errMsg);
          }
        } catch (err) {
          console.warn(`Error trying model ${model}:`, err);
          lastError = err;
        }
      }
      
      if (!parsedItems) {
        throw lastError || new Error("Failed all Gemini models in the dynamic fallback list.");
      }
      
      items = parsedItems;
    }

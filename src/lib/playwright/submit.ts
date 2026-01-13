import { chromium, type Browser, type Page, type BrowserContext } from 'playwright';
import type { SubmissionResult } from '@/types';

// Human-like delay utilities
function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function humanDelay(min: number = 1000, max: number = 3000): Promise<void> {
  const delay = randomDelay(min, max);
  await new Promise(resolve => setTimeout(resolve, delay));
}

interface SubmitCodeOptions {
  problemSlug: string;
  code: string;
  language: string;
  sessionCookie: string;
  csrfToken?: string;
  headless?: boolean;
  onProgress?: (status: string) => void;
}

let browser: Browser | null = null;

async function getBrowser(headless: boolean = false): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      headless,
      slowMo: 50,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--no-sandbox',
      ],
    });
  }
  return browser;
}

export async function submitCodeToLeetCode(options: SubmitCodeOptions): Promise<SubmissionResult> {
  const {
    problemSlug,
    code,
    language,
    sessionCookie,
    csrfToken,
    headless = false,
    onProgress,
  } = options;

  const progress = (status: string) => {
    console.log(`[Submission] ${status}`);
    onProgress?.(status);
  };

  progress('Starting browser...');
  
  const browserInstance = await getBrowser(headless);
  const context: BrowserContext = await browserInstance.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
  });

  // Set cookies
  await context.addCookies([
    {
      name: 'LEETCODE_SESSION',
      value: sessionCookie,
      domain: '.leetcode.com',
      path: '/',
    },
    ...(csrfToken ? [{
      name: 'csrftoken',
      value: csrfToken,
      domain: '.leetcode.com',
      path: '/',
    }] : []),
  ]);

  const page: Page = await context.newPage();

  try {
    const problemUrl = `https://leetcode.com/problems/${problemSlug}/`;
    progress(`Navigating to ${problemUrl}...`);
    
    await page.goto(problemUrl, { waitUntil: 'networkidle' });
    await humanDelay(2000, 4000);

    // Check if logged in by looking for user avatar or sign-in button
    const signInBtn = await page.$('a[href="/accounts/login/"]');
    if (signInBtn) {
      throw new Error('Session expired. Please update your LeetCode session cookie.');
    }

    progress('Looking for code editor...');
    
    // Wait for the Monaco editor or CodeMirror to load
    await page.waitForSelector('.monaco-editor, .CodeMirror, [data-mode-id]', { timeout: 20000 });
    await humanDelay(1500, 2500);

    // Select language if needed
    progress(`Selecting language: ${language}...`);
    
    // Try different language selector patterns
    const langSelectors = [
      'button[id*="lang"]',
      '[data-cy="lang-select"]',
      'button:has-text("C++")',
      'button:has-text("Python")',
      '.ant-select-selector',
    ];
    
    for (const selector of langSelectors) {
      const langBtn = await page.$(selector);
      if (langBtn) {
        await langBtn.click();
        await humanDelay(500, 1000);
        
        // Try to find and click the language option
        const langOption = await page.$(`[data-value="${language}"], li:has-text("${language.toUpperCase()}")`);
        if (langOption) {
          await langOption.click();
          await humanDelay(500, 1000);
        }
        break;
      }
    }

    progress('Inserting code into editor...');
    
    // Use Monaco editor's JavaScript API to set the code directly
    // This is immune to focus changes from user interaction
    const codeInserted = await page.evaluate((codeText: string) => {
      try {
        // Try to find Monaco editor instance
        const monacoEditors = (window as any).monaco?.editor?.getModels();
        if (monacoEditors && monacoEditors.length > 0) {
          monacoEditors[0].setValue(codeText);
          return { success: true, method: 'monaco-model' };
        }
        
        // Try alternative Monaco access
        const editorInstances = (window as any).monaco?.editor?.getEditors?.();
        if (editorInstances && editorInstances.length > 0) {
          editorInstances[0].setValue(codeText);
          return { success: true, method: 'monaco-editor' };
        }
        
        // Try to find React/LeetCode specific editor
        const reactRoot = document.querySelector('[data-cy="code-editor"]') as any;
        if (reactRoot?.__reactFiber$) {
          // Traverse fiber tree to find editor
          let fiber = reactRoot.__reactFiber$;
          while (fiber) {
            if (fiber.memoizedState?.editor) {
              fiber.memoizedState.editor.setValue(codeText);
              return { success: true, method: 'react-fiber' };
            }
            fiber = fiber.return;
          }
        }
        
        return { success: false, method: 'none' };
      } catch (e) {
        return { success: false, error: String(e) };
      }
    }, code);
    
    if (codeInserted.success) {
      progress(`Code inserted via ${codeInserted.method}!`);
    } else {
      // Fallback: EXTREME human-like typing
      progress('Typing code like a human...');
      
      // Click on editor to focus
      const editorSelectors = ['.monaco-editor .view-line', '.CodeMirror-code', '[data-mode-id]', '.monaco-editor'];
      for (const sel of editorSelectors) {
        const editor = await page.$(sel);
        if (editor) {
          await editor.click({ force: true });
          break;
        }
      }
      await humanDelay(500, 1000);
      
      // Select all and delete
      const isMac = process.platform === 'darwin';
      const modifier = isMac ? 'Meta' : 'Control';
      
      await page.keyboard.down(modifier);
      await page.keyboard.press('a');
      await page.keyboard.up(modifier);
      await humanDelay(300, 600);
      await page.keyboard.press('Backspace');
      await humanDelay(800, 1500);
      
      // Human typing patterns
      const isCommonChar = (c: string) => 'aeioutsrnl '.includes(c.toLowerCase());
      const isSpecialChar = (c: string) => '{}[]()<>;:\'\".,!@#$%^&*'.includes(c);
      const isNumber = (c: string) => '0123456789'.includes(c);
      
      // Typing state (humans get faster then slower)
      let typingSpeed = 1.0; // Multiplier
      let charsSinceLastPause = 0;
      let linesSinceLastBigPause = 0;
      
      const lines = code.split('\n');
      
      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];
        
        // Re-focus editor periodically
        if (lineIdx % 3 === 0) {
          await page.click('.monaco-editor', { force: true }).catch(() => {});
        }
        
        // Big pause at start of new code blocks (like function definitions)
        if (line.includes('class ') || line.includes('def ') || line.includes('function ') || 
            line.includes('public ') || line.includes('private ')) {
          await humanDelay(500, 1200);
          progress(`Typing... ${Math.round((lineIdx / lines.length) * 100)}%`);
        }
        
        // Type each character
        for (let charIdx = 0; charIdx < line.length; charIdx++) {
          const char = line[charIdx];
          const prevChar = charIdx > 0 ? line[charIdx - 1] : '';
          
          // Calculate typing delay based on character type
          let baseDelay: number;
          
          if (isCommonChar(char)) {
            baseDelay = randomDelay(40, 80); // Fast for common letters
          } else if (isSpecialChar(char)) {
            baseDelay = randomDelay(80, 150); // Slower for special chars
          } else if (isNumber(char)) {
            baseDelay = randomDelay(60, 120); // Medium for numbers
          } else if (char === ' ') {
            baseDelay = randomDelay(30, 60); // Fast spacebar
          } else {
            baseDelay = randomDelay(50, 100); // Default
          }
          
          // Apply typing speed modifier (fatigue/burst)
          baseDelay = Math.round(baseDelay * typingSpeed);
          
          // Occasional burst typing (faster)
          if (Math.random() < 0.15 && charsSinceLastPause > 20) {
            baseDelay = Math.round(baseDelay * 0.6);
          }
          
          // Occasional slow down (thinking)
          if (Math.random() < 0.05) {
            baseDelay = randomDelay(200, 500);
          }
          
          // Extra delay after opening brackets (thinking about what to write)
          if (prevChar === '(' || prevChar === '{' || prevChar === '[') {
            await humanDelay(50, 200);
          }
          
          // TYPO SIMULATION (2% chance for non-special chars)
          if (Math.random() < 0.02 && !isSpecialChar(char) && char !== ' ') {
            // Type wrong character
            const nearbyChars: { [key: string]: string } = {
              'a': 'sqz', 'b': 'vngh', 'c': 'xdfv', 'd': 'serfcx', 'e': 'wrsd',
              'f': 'dgrtcv', 'g': 'fhtybv', 'h': 'gjuynb', 'i': 'uojk', 'j': 'hkuinm',
              'k': 'jlioum', 'l': 'kop', 'm': 'njk', 'n': 'bmhjk', 'o': 'iplk',
              'p': 'ol', 'q': 'wa', 'r': 'etdf', 's': 'awedxz', 't': 'ryfg',
              'u': 'yihj', 'v': 'cfgb', 'w': 'qeas', 'x': 'zsdc', 'y': 'tugh',
              'z': 'asx'
            };
            const wrongOptions = nearbyChars[char.toLowerCase()] || 'e';
            const wrongChar = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
            
            await page.keyboard.type(wrongChar, { delay: baseDelay });
            await humanDelay(150, 350); // Notice the mistake
            await page.keyboard.press('Backspace');
            await humanDelay(80, 180);
          }
          
          // Type the actual character
          await page.keyboard.type(char, { delay: baseDelay });
          charsSinceLastPause++;
          
          // Micro pause after typing several characters
          if (charsSinceLastPause > randomDelay(30, 60)) {
            await humanDelay(100, 300);
            charsSinceLastPause = 0;
            
            // Adjust typing speed (fatigue/focus)
            typingSpeed = 0.8 + Math.random() * 0.4; // 0.8x to 1.2x
          }
        }
        
        // Enter for new line (except last line)
        if (lineIdx < lines.length - 1) {
          await humanDelay(80, 200);
          await page.keyboard.press('Enter');
          
          // Pause at end of lines with semicolons or braces
          if (line.endsWith(';') || line.endsWith('{') || line.endsWith('}')) {
            await humanDelay(200, 500);
          }
          
          linesSinceLastBigPause++;
          
          // Occasional longer break (like thinking about next line)
          if (linesSinceLastBigPause > randomDelay(5, 12)) {
            await humanDelay(500, 1500);
            linesSinceLastBigPause = 0;
          }
        }
        
        // Progress update
        if (lineIdx % 5 === 0) {
          progress(`Typing... ${Math.round((lineIdx / lines.length) * 100)}%`);
        }
      }
      
      progress('Code typed successfully!');
    }
    
    await humanDelay(1000, 2000);

    progress('Clicking Submit button...');
    
    // Try different submit button selectors
    const submitSelectors = [
      'button[data-e2e-locator="console-submit-button"]',
      'button:has-text("Submit")',
      '[data-cy="submit-code-btn"]',
      'button[type="submit"]',
    ];
    
    let submitClicked = false;
    for (const selector of submitSelectors) {
      const submitBtn = await page.$(selector);
      if (submitBtn) {
        await submitBtn.click();
        submitClicked = true;
        break;
      }
    }
    
    if (!submitClicked) {
      // Take screenshot for debugging
      await page.screenshot({ path: '/tmp/leetcode-submit-error.png' });
      throw new Error('Submit button not found. Screenshot saved to /tmp/leetcode-submit-error.png');
    }

    progress('Waiting for results...');
    await humanDelay(3000, 5000);
    
    // Wait for result with multiple possible selectors
    const resultSelectors = [
      '[data-e2e-locator="submission-result"]',
      '[class*="result"]',
      '[class*="success"]',
      '[class*="accepted"]',
      '[class*="wrong"]',
      '[class*="error"]',
      'text=Accepted',
      'text=Wrong Answer',
      'text=Runtime Error',
      'text=Compile Error',
    ];
    
    let resultText = '';
    const startTime = Date.now();
    const timeout = 90000; // 90 seconds
    
    while (Date.now() - startTime < timeout) {
      // Check for various result indicators
      const pageText = await page.textContent('body') || '';
      
      if (pageText.includes('Accepted') && pageText.includes('ms') && pageText.includes('MB')) {
        resultText = 'Accepted';
        // Try to extract more details
        const detailsMatch = pageText.match(/Accepted.*?(\d+)\s*ms.*?(\d+\.?\d*)\s*MB/s);
        if (detailsMatch) {
          resultText = `Accepted ${detailsMatch[1]} ms ${detailsMatch[2]} MB`;
        }
        break;
      } else if (pageText.includes('Wrong Answer')) {
        resultText = 'Wrong Answer';
        const casesMatch = pageText.match(/(\d+)\s*\/\s*(\d+)\s*testcases/i);
        if (casesMatch) {
          resultText = `Wrong Answer ${casesMatch[1]}/${casesMatch[2]}`;
        }
        break;
      } else if (pageText.includes('Runtime Error')) {
        resultText = 'Runtime Error';
        break;
      } else if (pageText.includes('Compile Error') || pageText.includes('Compilation Error')) {
        resultText = 'Compile Error';
        break;
      } else if (pageText.includes('Time Limit Exceeded')) {
        resultText = 'Time Limit Exceeded';
        break;
      } else if (pageText.includes('Memory Limit Exceeded')) {
        resultText = 'Memory Limit Exceeded';
        break;
      }
      
      await humanDelay(2000, 3000);
    }
    
    if (!resultText) {
      await page.screenshot({ path: '/tmp/leetcode-result-timeout.png' });
      throw new Error('Timed out waiting for submission result. Screenshot saved.');
    }

    const result = parseSubmissionResult(resultText);
    progress(`Result: ${result.status}`);
    
    return result;

  } catch (error) {
    console.error('Submission error:', error);
    
    // Take screenshot for debugging
    try {
      await page.screenshot({ path: '/tmp/leetcode-error.png' });
    } catch {}
    
    return {
      status: 'Error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
      submittedAt: new Date().toISOString(),
    };
  } finally {
    await humanDelay(1000, 2000);
    await page.close();
    await context.close();
  }
}

function parseSubmissionResult(resultText: string): SubmissionResult {
  const text = resultText.toLowerCase();
  
  let status: SubmissionResult['status'] = 'Pending';
  
  if (text.includes('accepted')) {
    status = 'Accepted';
  } else if (text.includes('wrong answer')) {
    status = 'Wrong Answer';
  } else if (text.includes('runtime error')) {
    status = 'Runtime Error';
  } else if (text.includes('compile error') || text.includes('compilation error')) {
    status = 'Compile Error';
  } else if (text.includes('time limit')) {
    status = 'Time Limit Exceeded';
  } else if (text.includes('memory limit')) {
    status = 'Memory Limit Exceeded';
  }

  // Extract runtime and memory
  const runtimeMatch = resultText.match(/(\d+)\s*ms/);
  const memoryMatch = resultText.match(/(\d+\.?\d*)\s*MB/);
  
  // Extract test cases
  const testCasesMatch = resultText.match(/(\d+)\s*\/\s*(\d+)/);

  return {
    status,
    runtime: runtimeMatch ? `${runtimeMatch[1]} ms` : undefined,
    memory: memoryMatch ? `${memoryMatch[1]} MB` : undefined,
    testCasesPassed: testCasesMatch ? parseInt(testCasesMatch[1]) : undefined,
    totalTestCases: testCasesMatch ? parseInt(testCasesMatch[2]) : undefined,
    submittedAt: new Date().toISOString(),
  };
}

// Close browser when done
export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

document.getElementById('scrapeBtn').addEventListener('click', async () => {
    const statusDiv = document.getElementById('status');
    const btn = document.getElementById('scrapeBtn');
    
    // איפוס מצב
    statusDiv.textContent = 'קורא נתונים...';
    statusDiv.className = '';
    btn.disabled = true;
  
    try {
      // 1. קבלת הטאב הפעיל
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
      if (!tab.url.includes('linkedin.com/in/')) {
        throw new Error('אנא היכנס לפרופיל לינקדאין תקין');
      }
  
      // 2. הפעלת הסקריפט בדף
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: scrapeProfileData,
      });
  
      const data = result[0].result;
      
      if (!data || !data.name) {
        throw new Error('לא הצלחתי לחלץ נתונים. נסה לרענן את הדף.');
      }
  
      statusDiv.textContent = 'שולח לשרת...';
  
      // 3. שליחה לשרת שלך
      // וודא שהנתיב תואם ל-Route שיצרת בשרת!
      const response = await fetch('http://localhost:5000/api/hunting-pools/add', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'linkedin',
          name: data.name,
          profileUrl: tab.url,
          description: `${data.headline} | ${data.location}`,
          metadata: {
            role: data.headline,
            location: data.location,
            about: data.about
          }
        })
      });
  
      if (!response.ok) {
        throw new Error(`שגיאת שרת: ${response.status}`);
      }
  
      const resJson = await response.json();
      
      statusDiv.textContent = '✅ נשמר בהצלחה!';
      statusDiv.className = 'success';
  
    } catch (error) {
      console.error(error);
      statusDiv.textContent = '❌ ' + error.message;
      statusDiv.className = 'error';
    } finally {
      btn.disabled = false;
    }
  });
  
  // --- פונקציית ה-Scraping שרצה בתוך הדף של לינקדאין ---
  function scrapeProfileData() {
    try {
      // סלקטורים של לינקדאין (עשויים להשתנות, לכן נשתמש בכמה אופציות)
      const getName = () => {
        return document.querySelector('h1')?.innerText || 
               document.querySelector('.text-heading-xlarge')?.innerText;
      };
  
      const getHeadline = () => {
        return document.querySelector('.text-body-medium')?.innerText || 
               document.querySelector('[data-generated-suggestion-target]')?.innerText;
      };
  
      const getLocation = () => {
        return document.querySelector('.text-body-small.inline.t-black--light.break-words')?.innerText;
      };
  
      const getAbout = () => {
         // לפעמים ה-About נמצא בתוך אלמנט עם id="about"
         const aboutSection = document.getElementById('about')?.parentElement;
         return aboutSection?.querySelector('.inline-show-more-text span')?.innerText || '';
      };
  
      return {
        name: getName(),
        headline: getHeadline(),
        location: getLocation(),
        about: getAbout()
      };
    } catch (e) {
      return null;
    }
  }
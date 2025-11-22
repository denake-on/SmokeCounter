// Configuration for the smoking counter app
const config = {
  // Set to true if using backend database, false for localStorage
  useBackend: false,

  // Backend API endpoint (if using) - update this when deploying to your backend
  backendUrl: window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://your-deployment-url.com',

  // Local storage key
  localStorageKey: 'smokingCounterData',

  // Check interval for daily reset (in milliseconds)
  dailyResetCheckInterval: 60000, // 1 minute
};

// Smoking counter application
document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const countLabel1 = document.getElementById('countLabel1');
  const countLabel2 = document.getElementById('countLabel2');
  const smokeBox1 = document.getElementById('smokeBox1');
  const smokeBox2 = document.getElementById('smokeBox2');
  const dialogOverlay = document.getElementById('dialogOverlay');
  const dialog1 = document.getElementById('dialog1');
  const dialog2 = document.getElementById('dialog2');
  const dialogContent1 = document.getElementById('dialogContent1');
  const dialogContent2 = document.getElementById('dialogContent2');
  const dialogButtons1 = document.getElementById('dialogButtons1');
  const dialogButtons2 = document.getElementById('dialogButtons2');
  const yesBtn1 = document.getElementById('yesBtn1');
  const yesBtn2 = document.getElementById('yesBtn2');
  const noBtn1 = document.getElementById('noBtn1');
  const noBtn2 = document.getElementById('noBtn2');

  // Initialize counts
  let today = new Date();
  let todayString = today.toDateString();
  let countBox1 = 0; // Count for smoke box 1
  let countBox2 = 0; // Count for smoke box 2
  let totalCount = 0; // Total count of both boxes

  // Load data (either from backend or localStorage)
  loadData();

  // Update display
  updateDisplay();

  // Event listeners for smoke boxes
  smokeBox1.addEventListener('click', function() {
    showDialog(1);
  });

  smokeBox2.addEventListener('click', function() {
    showDialog(2);
  });

  // Yes button event listeners
  yesBtn1.addEventListener('click', function() {
    addSmoke(1);
    hideDialogs();
  });

  yesBtn2.addEventListener('click', function() {
    addSmoke(2);
    hideDialogs();
  });

  // No button event listeners
  noBtn1.addEventListener('click', function() {
    hideDialogs();
  });

  noBtn2.addEventListener('click', function() {
    hideDialogs();
  });

  // Close dialog when clicking on overlay
  dialogOverlay.addEventListener('click', function() {
    hideDialogs();
  });

  // Function to show dialog
  function showDialog(boxNumber) {
    // Show overlay
    dialogOverlay.style.display = 'block';

    // Hide both dialogs first
    dialog1.style.display = 'none';
    dialog2.style.display = 'none';
    dialogContent1.style.display = 'none';
    dialogContent2.style.display = 'none';
    dialogButtons1.style.display = 'none';
    dialogButtons2.style.display = 'none';

    // Show the appropriate dialog
    if (boxNumber === 1) {
      dialog1.style.display = 'block';
      dialogContent1.style.display = 'block';
      dialogButtons1.style.display = 'flex';
      // Position content and buttons correctly
      dialogContent1.style.position = 'fixed';
      dialogContent1.style.top = 'calc(50% - 100px)'; // Top positioned above center
    } else {
      dialog2.style.display = 'block';
      dialogContent2.style.display = 'block';
      dialogButtons2.style.display = 'flex';
      // Position content and buttons correctly
      dialogContent2.style.position = 'fixed';
      dialogContent2.style.top = 'calc(50% - 100px)'; // Top positioned above center
    }
  }

  // Function to hide dialogs
  function hideDialogs() {
    dialogOverlay.style.display = 'none';
    dialog1.style.display = 'none';
    dialog2.style.display = 'none';
    dialogContent1.style.display = 'none';
    dialogContent2.style.display = 'none';
    dialogButtons1.style.display = 'none';
    dialogButtons2.style.display = 'none';
  }

  // Function to add smoke count
  async function addSmoke(boxNumber) {
    if(boxNumber === 1) {
      countBox1++;
    } else {
      countBox2++;
    }
    totalCount = countBox1 + countBox2; // Update total
    updateDisplay();

    // Save to storage (either backend or localStorage)
    await saveData();
  }

  // Function to update display
  function updateDisplay() {
    if(countLabel1) countLabel1.textContent = countBox1; // Only show box1 count
    if(countLabel2) countLabel2.textContent = countBox2; // Only show box2 count
  }

  // Function to load data (from backend or localStorage)
  async function loadData() {
    if (config.useBackend) {
      // Load from backend API
      try {
        const response = await fetch(`${config.backendUrl}/counter`);
        if (response.ok) {
          const data = await response.json();
          if (data.date === todayString) {
            // For backward compatibility, if old format exists
            if(data.totalCount !== undefined) {
              totalCount = data.totalCount || 0;
              countBox1 = data.countBox1 || 0;
              countBox2 = data.countBox2 || 0;
            } else {
              totalCount = data.count || 0;
              countBox1 = Math.floor(totalCount / 2);
              countBox2 = totalCount - countBox1;
            }
          } else {
            // Reset count if it's a new day
            totalCount = 0;
            countBox1 = 0;
            countBox2 = 0;
          }
        } else {
          // If API fails, fallback to localStorage
          const savedData = localStorage.getItem(config.localStorageKey);
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (parsedData.date === todayString) {
              if(parsedData.totalCount !== undefined) {
                totalCount = parsedData.totalCount || 0;
                countBox1 = parsedData.countBox1 || 0;
                countBox2 = parsedData.countBox2 || 0;
              } else {
                totalCount = parsedData.count || 0;
                countBox1 = Math.floor(totalCount / 2);
                countBox2 = totalCount - countBox1;
              }
            } else {
              totalCount = 0;
              countBox1 = 0;
              countBox2 = 0;
            }
          }
        }
      } catch (error) {
        // If API fails, fallback to localStorage
        const savedData = localStorage.getItem(config.localStorageKey);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          if (parsedData.date === todayString) {
            if(parsedData.totalCount !== undefined) {
              totalCount = parsedData.totalCount || 0;
              countBox1 = parsedData.countBox1 || 0;
              countBox2 = parsedData.countBox2 || 0;
            } else {
              totalCount = parsedData.count || 0;
              countBox1 = Math.floor(totalCount / 2);
              countBox2 = totalCount - countBox1;
            }
          } else {
            totalCount = 0;
            countBox1 = 0;
            countBox2 = 0;
          }
        }
      }
    } else {
      // Load from localStorage only
      const savedData = localStorage.getItem(config.localStorageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.date === todayString) {
          if(parsedData.totalCount !== undefined) {
            totalCount = parsedData.totalCount || 0;
            countBox1 = parsedData.countBox1 || 0;
            countBox2 = parsedData.countBox2 || 0;
          } else {
            totalCount = parsedData.count || 0;
            countBox1 = Math.floor(totalCount / 2);
            countBox2 = totalCount - countBox1;
          }
        } else {
          totalCount = 0;
          countBox1 = 0;
          countBox2 = 0;
        }
      }
    }
  }

  // Function to save data (to backend or localStorage)
  async function saveData() {
    if (config.useBackend) {
      // Save to backend API
      try {
        const response = await fetch(`${config.backendUrl}/counter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: todayString,
            totalCount: totalCount,
            countBox1: countBox1,
            countBox2: countBox2
          })
        });

        if (!response.ok) {
          // If API fails, save to localStorage as backup
          localStorage.setItem(config.localStorageKey, JSON.stringify({
            date: todayString,
            totalCount: totalCount,
            countBox1: countBox1,
            countBox2: countBox2
          }));
        }
      } catch (error) {
        // If API fails, save to localStorage as backup
        localStorage.setItem(config.localStorageKey, JSON.stringify({
          date: todayString,
          totalCount: totalCount,
          countBox1: countBox1,
          countBox2: countBox2
        }));
      }
    } else {
      // Save to localStorage only
      localStorage.setItem(config.localStorageKey, JSON.stringify({
        date: todayString,
        totalCount: totalCount,
        countBox1: countBox1,
        countBox2: countBox2
      }));
    }
  }

  // Function to check if we need to reset the count for a new day
  function checkDailyReset() {
    const now = new Date();
    const currentDateString = now.toDateString();
    
    if (currentDateString !== todayString) {
      // It's a new day, reset the count
      count = 0;
      todayString = currentDateString;
      updateDisplay();
      saveData();
    }
  }

  // Set up daily reset check interval - check every minute
  setInterval(checkDailyReset, config.dailyResetCheckInterval);

  // Check for daily reset on initial load
  checkDailyReset();
});
// Configuration for the smoking counter app
const config = {
  // Using only localStorage (no backend)
  useBackend: false,

  // Local storage key
  localStorageKey: 'smokingCounterData',

  // Check interval for daily reset (in milliseconds)
  dailyResetCheckInterval: 60000, // 1 minute
};

// Smoking counter application with p5.js animation
document.addEventListener('DOMContentLoaded', function() {
  // Initialize global variables for fish
  let fish = [];
  let globalTotalCount = 0;

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
    
    // Occasionally add extra random fish when smoking
    if (Math.random() < 0.3) { // 30% chance to add an extra random fish
      if (typeof fish !== 'undefined' && fish && typeof window !== 'undefined') {
        fish.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          speedX: (Math.random() - 0.5) * 4, // Faster movement
          speedY: (Math.random() - 0.5) * 4, // Faster movement
          tOffset: Math.random() * Math.PI * 2 // Time offset for animation
        });
      }
    }
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
      countBox1 = 0;
      countBox2 = 0;
      totalCount = 0;
      todayString = currentDateString;
      updateDisplay();
      saveData();
    }
  }

  // Set up daily reset check interval - check every minute
  setInterval(checkDailyReset, config.dailyResetCheckInterval);

  // Update global total count after loading data
  function updateGlobalTotalCount() {
    globalTotalCount = countBox1 + countBox2;
  }
  updateGlobalTotalCount();

  // Check for daily reset on initial load
  checkDailyReset();
  
  // Update total count when the counter changes
  const originalAddSmoke = addSmoke;
  addSmoke = function(boxNumber) {
    originalAddSmoke(boxNumber);
    updateGlobalTotalCount();
  };

  // Update global fish count from inside the DOM event
  function updateGlobalTotalCount() {
    globalTotalCount = countBox1 + countBox2;
  }
});

// Global p5.js functions to be accessible outside the DOM event
let fish = [];
let globalTotalCount = 0;

// p5.js setup - defining globally so p5 can find it
function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');
  colorMode(RGB);
  noFill();
  stroke(120, 209, 209); // Blue color (RGB 0, 47, 167)
  strokeWeight(1);
  frameRate(30);
  
  // Initialize fish with random positions even if total count is 0
  // This creates a more interesting background effect
  for (let i = 0; i < 5; i++) { // Start with a few random fish
    fish.push({
      x: random(width),
      y: random(height),
      speedX: random(-3, 3) * 2, // Faster movement
      speedY: random(-3, 3) * 2, // Faster movement
      tOffset: random(TWO_PI) // Time offset for animation
    });
  }
}

// p5.js draw - defining globally so p5 can find it
function draw() {
  // Draw solid black background
  background(9);
  
  // Draw fish based on total count
  drawFish();
}

function drawFish() {
  // Randomly add new fish occasionally for more dynamic effect
  if (frameCount % 120 === 0 && fish.length < 30) { // Add a new random fish every 2 seconds
    if (random() < 0.7) { // 70% chance to add fish
      fish.push({
        x: random(width),
        y: random(height),
        speedX: random(-3, 3) * 2, // Faster movement
        speedY: random(-3, 3) * 2, // Faster movement
        tOffset: random(TWO_PI) // Time offset for animation
      });
    }
  }
  
  // Update fish count based on total count but with random variation
  const targetFishCount = Math.min(50, globalTotalCount + 5); // Add some baseline fish
  while (fish.length < targetFishCount) {
    fish.push({
      x: random(width),
      y: random(height),
      speedX: random(-3, 3) * 2, // Faster movement
      speedY: random(-3, 3) * 2, // Faster movement
      tOffset: random(TWO_PI) // Time offset for animation
    });
  }

  // Remove extra fish if count decreased
  while (fish.length > targetFishCount && fish.length > 5) { // Keep at least 5 random fish
    fish.splice(Math.floor(random(fish.length)), 1);
  }

  // Draw and update each fish using the exact original pattern
  for (let i = 0; i < fish.length; i++) {
    let f = fish[i];

    // Update position with faster movement
    f.x += f.speedX;
    f.y += f.speedY;

    // Bounce off edges
    if (f.x < 0 || f.x > width) f.speedX *= -1;
    if (f.y < 0 || f.y > height) f.speedY *= -1;

    // Keep fish within bounds
    f.x = constrain(f.x, 0, width);
    f.y = constrain(f.y, 0, height);

    // Draw each fish using the EXACT original p5 pattern at the fish's position
    push();
    translate(f.x, f.y);
    stroke(120, 209, 209); // Blue color
    noFill();

    // Use the EXACT original p5 pattern from the reference code
    let fishT = millis() / 2000 + f.tOffset; // Time for this fish's animation

    for (let j = 10000; j > 0; j--) {
      let x = j;
      let y = j / 235.0;

      let k = (4.0 + cos(y)) * cos(x / 4.0);
      let e = y / 8.0 - 20.0;
      let d = sqrt(k * k + e * e);

      let q = sin(k * 3.0) + sin(y / 19.0 + 9.0) * k * (6.0 + sin(e * 14.0 - d));
      let c = d - fishT; // Use fish-specific time

      // Calculate position with the EXACT same formula as original
      let px = q * cos(d / 8.0 + fishT / 4.0) + 50.0 * cos(c);
      let py = q * sin(c) + d * 7.0 * sin(c / 4.0);

      // Draw the point at the calculated position
      point(px, py);
    }

    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
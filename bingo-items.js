// encrypted globals 
const fileId = atob("MVdVUlkyS0xkUWF4dG9QTndvR1J5OEUyZFRrNkd5Wndi");
const baseURL = atob("aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J6NGExWkwwR0x0UkhvekVPMEFhSG9CRUtMNjdteXNsUkx4cDZiaDdBbE9tTWllZmJja2hESmxDVnlvQjhpWFk2a1QvZXhlYw==");
const loadingMask = document.getElementById('loadingMask');
const modal = document.getElementById("categoryModal");

// data holders
let jsonData = {};
let onButtons = [];
let itemList = [];

// array that the board populates from
const defaultActiveCategories = [3,5,6,8]; // Example: categories with IDs 1 and 2 are active by default
let bingoItems = [];

/** FETCH REMOTE DATA & RELATED FUNCTIONS ***************************************/


/** HANDLE BINGO ITEM FILTERS *****************************************/
readFileContent(fileId)
.then(data => { jsonData = JSON.parse(data);})
.catch(error => {
  //console.error("Error:", error);
})
.finally(() => {
  createCategoryButtons(); 
  loadingMask.style.display = 'none'; // Show loading mask
  showModal();
  updateGenerateBoardButtonState(); // Initial check to update the button state
});


// Function to read file content and return a promise with the content
function readFileContent(fileId) {
  return new Promise((resolve, reject) => {
    var url = baseURL + "?fileId=" + fileId;
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(data => resolve(data))
      .catch(error => reject(error));
  });
}

function showModal() {
  // Show the modal  
  modal.style.display = "block";

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }

  // Also close the modal if the user clicks outside of it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}

// Function to close the modal
function closeModal() {
  var modal = document.getElementById("categoryModal");
  modal.style.display = "none";
}

// Function to create category buttons
function createCategoryButtons() {
  const container = document.getElementById('categoryContainer');
  jsonData.categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'rounded-button';
    button.classList.add(defaultActiveCategories.includes(category.id) ? 'on' : 'off');
    button.innerHTML = category.name;
    button.onclick = function() {
      this.classList.toggle('on');
      this.classList.toggle('off');
      if (this.classList.contains('on')) {
        addItemsToBingo(category.hasItems);
      } else {
        removeItemsFromBingo(category.hasItems);
      }
      updateGenerateBoardButtonState();
    };
    container.appendChild(button);
    // If the category is active by default, add its items to bingoItems
    if (defaultActiveCategories.includes(category.id)) {
      addItemsToBingo(category.hasItems);
    }
  });
}

function updateGenerateBoardButtonState() {
  const generateBoardBtn = document.getElementById('generateBoardBtn');
  generateBoardBtn.disabled = bingoItems.length < 24;
}

function addItemsToBingo(itemIds) {
  const itemNamesToAdd = jsonData.items.filter(item => itemIds.includes(item.id)).map(item => item.name);
  bingoItems = [...new Set([...bingoItems, ...itemNamesToAdd])]; // Merge and ensure uniqueness
  updateGenerateBoardButtonState(); // Update button state
  console.log(bingoItems);
}

function removeItemsFromBingo(itemIds) {
  const itemNamesToRemove = jsonData.items.filter(item => itemIds.includes(item.id)).map(item => item.name);
  bingoItems = bingoItems.filter(name => !itemNamesToRemove.includes(name));
  updateGenerateBoardButtonState(); // Update button state
  console.log(bingoItems);
}

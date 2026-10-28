const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const resultsContainer = document.getElementById("results");
const statusText = document.getElementById("status");

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // Stop page reload
  
  const query = input.value.trim();
  if (!query) return; // Ignore empty searches

  statusText.textContent = "Loading images...";

  try {
    const url =
      "https://commons.wikimedia.org/w/api.php?action=query" +
      "&generator=search&gsrsearch=" + encodeURIComponent(query) +
      "&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*";

    const response = await fetch(url);
    if (!response.ok) throw new Error(response.status);

    const data = await response.json();

    // Check if pages were returned
    if (!data.query || !data.query.pages) {
      resultsContainer.innerHTML = "";
      statusText.textContent = `No results found for "${query}".`;
      return;
    }

    const items = Object.values(data.query.pages);
    
    // Enhancement: Display result count
    statusText.textContent = `Showing ${items.length} results for "${query}"`;
    
    render(items);
  } catch (error) {
    console.error("Fetch error:", error);
    statusText.textContent = "Failed to fetch images. Please try again.";
  }
});

function render(items) {
  // Clear previous search results
  resultsContainer.innerHTML = "";

  items.forEach((item) => {
    // Check if image URL exists from API
    const imageUrl = item.imageinfo && item.imageinfo[0] ? item.imageinfo[0].thumburl : null;
    if (!imageUrl) return;

    const card = document.createElement("article");
    card.className = "card";

    // Enhancement: Make image open full resolution in new tab
    const link = document.createElement("a");
    link.href = item.imageinfo[0].url;
    link.target = "_blank";

    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = item.title;

    const caption = document.createElement("p");
    // Remove "File:" prefix from Wikimedia titles for cleaner UI
    caption.textContent = item.title.replace("File:", "");

    link.appendChild(img);
    card.appendChild(link);
    card.appendChild(caption);
    resultsContainer.appendChild(card);
  });
}
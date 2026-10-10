// =========================================================
// BIkesphere Core Engine - JavaScript
// =========================================================

let allBikesData = [];
let compareList = [];

// 1. Fetch Data from bikes.json
document.addEventListener("DOMContentLoaded", () => {
    fetchBikesData();
    setupEventListeners();
});

async function fetchBikesData() {
    try {
        const response = await fetch("bikes.json");
        if (!response.ok) throw new Error("Failed to load bikes data");
        
        allBikesData = await response.json();
        renderBikes(allBikesData);
    } catch (error) {
        console.error("Error loading bikes:", error);
        document.getElementById("bikeGrid").innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--neon-orange); padding: 40px;">
                <h2><i class="fa-solid fa-triangle-exclamation"></i> Unable to load bike database!</h2>
                <p style="color: var(--text-muted); margin-top: 8px;">Please ensure 'bikes.json' is present in the same folder.</p>
            </div>
        `;
    }
}

// 2. Render Bike Cards Dynamically
function renderBikes(bikes) {
    const bikeGrid = document.getElementById("bikeGrid");
    
    if (bikes.length === 0) {
        bikeGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 50px;">
                <h3>No bikes found matching your criteria! 🏍️</h3>
            </div>
        `;
        return;
    }

    bikeGrid.innerHTML = bikes.map(bike => {
        const isCompared = compareList.includes(bike.id);
        
        return `
            <div class="bike-card" data-id="${bike.id}">
                <div class="card-badge">${bike.status}</div>
                
                <div class="card-img-box">
                    <img src="${bike.image}" alt="${bike.brand} ${bike.name}" loading="lazy">
                </div>

                <div class="card-content">
                    <div class="bike-brand">${bike.brand}</div>
                    <h3 class="bike-title">${bike.name}</h3>

                    <div class="specs-row">
                        <span>Engine: <b>${bike.specs.engine}</b></span>
                        <span>Power: <b>${bike.specs.power}</b></span>
                    </div>

                    <div class="specs-row">
                        <span>Mileage: <b>${bike.specs.mileage}</b></span>
                        <span>Weight: <b>${bike.specs.weight}</b></span>
                    </div>

                    <div class="price-section">
                        <div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); text-decoration: line-through;">${bike.pricing.originalPrice}</div>
                            <div class="current-price">${bike.pricing.currentPrice}</div>
                        </div>
                        <div class="discount-tag">${bike.pricing.discount}</div>
                    </div>

                    <div class="card-actions">
                        <button class="btn-action btn-details" onclick="openDetailsModal('${bike.id}')">
                            <i class="fa-solid fa-eye"></i> Specs
                        </button>
                        <button class="btn-action btn-360" onclick="toggleCompare('${bike.id}')" style="${isCompared ? 'background: var(--neon-orange); color: #fff;' : ''}">
                            <i class="fa-solid fa-code-compare"></i> ${isCompared ? 'Added' : 'Compare'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// 3. Setup Filter & Search Event Listeners
function setupEventListeners() {
    // Search Filter
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const filtered = allBikesData.filter(bike => 
                bike.name.toLowerCase().includes(searchTerm) ||
                bike.brand.toLowerCase().includes(searchTerm) ||
                bike.category.toLowerCase().includes(searchTerm)
            );
            renderBikes(filtered);
        });
    }

    // Category Filter Tabs
    const filterContainer = document.getElementById("filterContainer");
    if (filterContainer) {
        filterContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("filter-btn")) {
                document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
                e.target.classList.add("active");

                const category = e.target.getAttribute("data-filter");
                if (category === "all") {
                    renderBikes(allBikesData);
                } else {
                    const filtered = allBikesData.filter(bike => bike.category.toLowerCase() === category.toLowerCase());
                    renderBikes(filtered);
                }
            }
        });
    }
}

// 4. Compare List Manager
function toggleCompare(bikeId) {
    const index = compareList.indexOf(bikeId);
    if (index === -1) {
        if (compareList.length >= 3) {
            alert("You can compare up to 3 bikes at a time!");
            return;
        }
        compareList.push(bikeId);
    } else {
        compareList.splice(index, 1);
    }

    document.getElementById("compareCount").innerText = compareList.length;
    
    // Re-render current active filter view to update button states
    const activeFilter = document.querySelector(".filter-btn.active").getAttribute("data-filter");
    if (activeFilter === "all") {
        renderBikes(allBikesData);
    } else {
        renderBikes(allBikesData.filter(b => b.category.toLowerCase() === activeFilter.toLowerCase()));
    }
}

// 5. Open Detailed Specs Modal
function openDetailsModal(bikeId) {
    const bike = allBikesData.find(b => b.id === bikeId);
    if (!bike) return;

    alert(`
🏍️ ${bike.brand} ${bike.name}
━━━━━━━━━━━━━━━━━━━━━━
💰 Current Price: ${bike.pricing.currentPrice} (${bike.pricing.discount})
🔮 Future Projected Price: ${bike.pricing.projectedPrice}

📊 Key Specifications:
• Engine: ${bike.specs.engine}
• Power: ${bike.specs.power}
• Mileage: ${bike.specs.mileage}
• Weight: ${bike.specs.weight}

🎁 Exclusive Offers:
${bike.pricing.offers.map(o => "• " + o).join("\n")}
    `);
}


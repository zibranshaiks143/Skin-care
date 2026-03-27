const quizQuestions = [
    {
        step: 1,
        name: 'feeling'
    },
    {
        step: 2,
        name: 'concern'
    },
    {
        step: 3,
        name: 'sun'
    }
];

let currentStep = 1;
let answers = {
    oily: 0,
    dry: 0,
    combination: 0,
    sensitive: 0,
    aging: 0,
    dullness: 0,
    hydration: 0,
    texture: 0
};

const products = [
    {
        name: 'SHINE Hyaluronic Suspension',
        type: ['dry', 'combination', 'sensitive'],
        price: '₹1,499',
        img: 'assets/serum.png',
        url: 'serums.html'
    },
    {
        name: 'SHINE Silk Peptides',
        type: ['oily', 'combination', 'aging'],
        price: '₹1,699',
        img: 'assets/serum.png',
        url: 'serums.html'
    },
    {
        name: 'SHINE 24k Champagne Gold',
        type: ['dullness', 'dry', 'normal'],
        price: '₹1,999',
        img: 'assets/serum.png',
        url: 'serums.html'
    },
    {
        name: 'SHINE Velvet Moisture Cream',
        type: ['dry', 'sensitive'],
        price: '₹2,299',
        img: 'assets/cream.png',
        url: 'creams.html'
    },
    {
        name: 'SHINE Matte Balance Lotion',
        type: ['oily', 'combination'],
        price: '₹1,199',
        img: 'assets/lotions.png',
        url: 'lotions.html'
    }
];

function startQuiz() {
    document.getElementById('quiz-intro').style.display = 'none';
    document.getElementById('quiz-steps').style.display = 'block';
    updateProgress();
}

function nextStep(step, value) {
    // Record answer
    if (answers.hasOwnProperty(value)) {
        answers[value]++;
    }

    // Hide current step
    document.getElementById(`step-${step}`).classList.remove('active');
    
    if (step < 3) {
        currentStep = step + 1;
        document.getElementById(`step-${currentStep}`).classList.add('active');
        updateProgress();
    } else {
        showResults();
    }
}

function updateProgress() {
    const progress = (currentStep / 3) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

function showResults() {
    document.getElementById('quiz-steps').style.display = 'none';
    document.getElementById('results').style.display = 'block';

    // Determine skin type / primary concern
    let skinType = Object.keys(answers).reduce((a, b) => answers[a] > answers[b] ? a : b);
    
    // Fallback mapping if step-2 was the only thing answered or if it's the dominant trait
    let displayType = skinType;
    if (['aging', 'dullness', 'hydration', 'texture'].includes(skinType)) {
        // Map concerns to approximate skin types if needed, or just display them
        displayType = skinType;
    }

    // Display result
    const typeDisplay = document.getElementById('skin-type-display');
    const titleDisplay = document.getElementById('result-title');
    const descDisplay = document.getElementById('result-desc');

    typeDisplay.innerText = `Focus Area: ${displayType.toUpperCase()}`;
    
    switch(displayType) {
        case 'oily':
            titleDisplay.innerText = 'Radiance with Equilibrium';
            descDisplay.innerText = 'Your skin is naturally vibrant but needs balance. Our lightweight, non-comedogenic formulas will refine your pores without stripping essential moisture.';
            break;
        case 'dry':
            titleDisplay.innerText = 'Luminous Deep Hydration';
            descDisplay.innerText = 'Your skin craves moisture. Our ultra-nourishing suspension technology will deliver layers of hydration to restore your natural bounce and dewiness.';
            break;
        case 'combination':
            titleDisplay.innerText = 'Perfected Harmony';
            descDisplay.innerText = 'Your skin requires a dual approach. We suggest a targeted routine to hydrate dry areas while maintaining a soft matte finish in the T-zone.';
            break;
        case 'sensitive':
            titleDisplay.innerText = 'Gentle Ethereal Care';
            descDisplay.innerText = 'Your skin needs calming elegance. Our hypoallergenic botanicals and silk peptides will soothe any redness and reinforce your natural barrier.';
            break;
        case 'aging':
            titleDisplay.innerText = 'Timeless Restoration';
            descDisplay.innerText = 'Focusing on firming and lifting. Our silk peptide complexes and 24k gold help redefine contours and smooth fine lines for a youthful lift.';
            break;
        case 'dullness':
            titleDisplay.innerText = 'Infinite Luminosity';
            descDisplay.innerText = 'Targeting lack of glow. Our 24k Champagne Gold and Hyaluronic Suspension work together to brighten and reflect light for a red-carpet finish.';
            break;
        default:
            titleDisplay.innerText = 'Bespoke Radiance';
            descDisplay.innerText = 'Your skin is unique. We have curated a balanced selection of SHINE products to maintain your natural glow and prevent future concerns.';
    }

    // Filter products
    // A product matches if its "type" array contains the dominant trait OR 
    // if the trait is a general concern and the product addresses it.
    const recommended = products.filter(p => p.type.includes(displayType) || (displayType === 'hydration' && p.type.includes('dry')));
    const recGrid = document.getElementById('recommended-products');
    recGrid.innerHTML = '';

    recommended.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.img}" alt="${p.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.1rem;">${p.name}</h3>
            <div class="price" style="font-size: 1rem; margin-bottom: 1rem;">${p.price}</div>
            <a href="${p.url}" class="btn-primary" style="text-decoration: none; display: inline-block; width: 100%; text-align: center; font-size: 0.75rem; padding: 0.8rem;">Explore Product</a>
        `;
        recGrid.appendChild(card);
    });
}

function restartQuiz() {
    currentStep = 1;
    answers = { oily: 0, dry: 0, combination: 0, sensitive: 0 };
    
    document.getElementById('results').style.display = 'none';
    document.getElementById('quiz-intro').style.display = 'block';
    
    // Reset steps
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`step-${i}`).classList.remove('active');
    }
    document.getElementById('step-1').classList.add('active');
}

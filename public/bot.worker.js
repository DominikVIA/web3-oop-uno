self.onmessage = ({ data }) => {
    const { hand, legalIndices } = data
    
    if (legalIndices.length === 0) {
        self.postMessage({ action: "draw" })
        return;
    }
    
    const index = legalIndices[Math.floor(Math.random() * legalIndices.length)]

    const card = hand[index]
    
    let color

    if (card.type === 'WILD' || card.type === 'WILD DRAW') {
        const counts = {
            RED: 0,
            GREEN: 0,
            BLUE: 0,
            YELLOW: 0
        }

        for (const heldCard of hand) {
            if (heldCard.color) {
                counts[heldCard.color] += 1
            }
        }

        color = Object.keys(counts).reduce((best, current) =>
            counts[current] > counts[best] ? current : best
        )
    }

    self.postMessage({ action: 'play', index, color })
}
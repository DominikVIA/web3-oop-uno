self.onmessage = ({data}) => {
    const {hand, legalIndices, accusedIndex} = data

    if (accusedIndex !== undefined && accusedIndex !== null) {
        if (Math.random() < 0.9) {
            self.postMessage({action: "catch", accusedIndex})
            return;
        }
    }

    if (legalIndices.length === 0) {
        self.postMessage({action: "draw"})
        return;
    }

    const index = legalIndices[Math.floor(Math.random() * legalIndices.length)]
    const card = hand[index]
    let color

    if (card.type === 'WILD' || card.type === 'WILD DRAW') {
        const counts = {RED: 0, GREEN: 0, BLUE: 0, YELLOW: 0}
        for (const heldCard of hand) {
            if (heldCard.color) {
                counts[heldCard.color] += 1
            }
        }
        color = Object.keys(counts).reduce((best, current) =>
            counts[current] > counts[best] ? current : best
        )
    }

    let sayUno = false;
    if (hand.length === 2) {
        sayUno = Math.random() < 0.7;
    }

    self.postMessage({action: 'play', index, color, sayUno})
}
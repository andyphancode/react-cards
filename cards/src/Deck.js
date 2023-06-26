import React, { useEffect, useState, useRef } from "react";
import Card from "./Card";
import axios from "axios";
import "./Deck.css";

const API_BASE_URL = "http://deckofcardsapi.com/api/deck";

const Deck = () => {
    // states
    const [deck, setDeck] = useState(null);
    const [drawn, setDrawn] = useState([]);
    const [autoDraw, setAutoDraw] = useState(false);
    const timerRef = useRef(null);

    const toggleAutoDraw = () => {
        setAutoDraw(auto => !auto);
    }

    // initial deck at mount
    useEffect(() => {
        async function getDeck() {
            let d = await axios.get(`${API_BASE_URL}/new/shuffle`);
            setDeck(d.data);
        }
        getDeck();
    }, [setDeck])

    // card draw function
    useEffect(() => {
        // Draw card from API and then add to drawn state
        async function drawCard() {
            let { deck_id } = deck;
            try {
                let drawRes = await axios.get(`${API_BASE_URL}/${deck_id}/draw/`);

                if (drawRes.data.remaining === 0) {
                    setAutoDraw(false);
                    throw new Error("Error: no cards remaining!");
                }

                const card = drawRes.data.cards[0];

                setDrawn(draw => [
                    ...draw, {
                        id: card.code,
                        name: card.suit + " " + card.value,
                        image: card.image
                    }
                ]);
            } catch (err) {
                alert(err);
            }
        }

        // if autoDraw on and no current timer, begin timer that draws each second
        if (autoDraw && !timerRef.current) {
            timerRef.current = setInterval(async () => {
                await drawCard();
            }, 1000);
        }
      
        // clears timer useRef
        return () => {
            clearInterval(timerRef.current);
            timerRef.current = null;
        };

    }, [autoDraw, setAutoDraw, deck])

    // create cards from drawn state
    const cards = drawn.map(card => (
        <Card 
            key={card.id}
            name={card.name}
            image={card.image}
        />
    ));

    // return Deck component
    return (
        <div className="Deck">
            {deck ? (<button onClick={toggleAutoDraw}>{autoDraw ? "STOP" : "START"} DRAWING </button>) : null}
            <div className="Deck-cardarea">
                {cards}
            </div>
        </div>
    );
}

export default Deck;

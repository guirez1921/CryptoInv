import React, { useEffect } from 'react';

const CryptoMarquee = () => {
    useEffect(() => {
        const scriptUrl = "https://widgets.coingecko.com/gecko-coin-price-marquee-widget.js";
        if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
            const script = document.createElement('script');
            script.src = scriptUrl;
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    return (
        <gecko-coin-price-marquee-widget
            locale="en"
            dark-mode="true"
            transparent-background="true"
            outlined="false"
            coin-ids="bitcoin,dash,ethereum,bittensor,starknet,solana,linea"
            initial-currency="usd"
        ></gecko-coin-price-marquee-widget>
    );
};

export default CryptoMarquee;

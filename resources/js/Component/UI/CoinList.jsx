import React, { useEffect } from 'react';
import Card from './Card';

const CoinList = () => {
    useEffect(() => {
        const scriptUrl = "https://widgets.coingecko.com/gecko-coin-list-widget.js";
        if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
            const script = document.createElement('script');
            script.src = scriptUrl;
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    return (
        <Card>
            <gecko-coin-list-widget
                locale="en"
                dark-mode="true"
                transparent-background="true"
                coin-ids="aave,bitcoin,ethereum,solana,binancecoin"
                initial-currency="usd"
            ></gecko-coin-list-widget>
        </Card>
    );
};

export default CoinList;

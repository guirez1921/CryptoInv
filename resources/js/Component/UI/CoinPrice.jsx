import React, { useEffect } from 'react';
import Card from './Card';

const CoinPrice = ({ coinId = "bitcoin" }) => {
    useEffect(() => {
        const scriptUrl = "https://widgets.coingecko.com/gecko-coin-price-chart-widget.js";
        if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
            const script = document.createElement('script');
            script.src = scriptUrl;
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    return (
        <Card>
            <gecko-coin-price-chart-widget
                locale="en"
                dark-mode="true"
                transparent-background="true"
                coin-id={coinId}
                initial-currency="usd"
            ></gecko-coin-price-chart-widget>
        </Card>
    );
};

export default CoinPrice;

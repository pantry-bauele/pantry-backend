import { Item, VendorPrice } from '../pantry-shared/src/item';

export function findCheapestVendor(item: Item) {
    let vendorPrices = item.getVendorPrices();
    if (vendorPrices.length === 0) {
        return null;
    } else if (vendorPrices.length === 1) {
        return item.getVendorPrices();
    } else {
        let cheapestVendor: VendorPrice[] = new Array();
        cheapestVendor.push(item.getVendorPrices()[0]);
        let cheapestPrice = item.getVendorPrices()[0].price;

        // Skip first element in the array
        for (let i = 1; i < item.getVendorPrices().length; i++) {
            let data = item.getVendorPrices()[i];

            if (data.price < cheapestPrice) {
                // If there is a now lowest price, discard the array
                // and start over
                cheapestVendor = new Array();
                cheapestVendor.push(data);
                cheapestPrice = data.price;
            } else if (data.price === cheapestPrice) {
                // If the same lowest price is encountered, push it
                // to the current array
                cheapestVendor.push(data);
            }
        }

        return cheapestVendor;
    }
}

import { Item } from './item';

export class ItemBuilder {
    buildItem(jsonString: string): Item {
        let item = new Item();
        let jsonObject = JSON.parse(jsonString);

        if (jsonObject.id) {
            item.setId(jsonObject.id);
        }

        if (jsonObject.name) {
            item.setName(jsonObject.name);
        }

        if (jsonObject.brand) {
            item.setBrand(jsonObject.brand);
        }

        if (jsonObject.calories) {
            item.setCalories(Number.parseInt(jsonObject.calories));
        }

        if (jsonObject.vendorPrices) {
            jsonObject.vendorPrices.forEach(
                (jsonVendorPrice: { name: string; price: string }) => {
                    item.addVendorPrice(
                        jsonVendorPrice.name,
                        Number.parseFloat(jsonVendorPrice.price)
                    );
                }
            );
        }

        if (jsonObject.totalQuantity) {
            try {
                item.setTotalQuantity(
                    Number.parseInt(jsonObject.totalQuantity.amount),
                    jsonObject.totalQuantity.unit
                );
            } catch (error) {
                console.log('Attempted to set invalid quantity');
            }
        }

        if (jsonObject.servingSize) {
            try {
                item.setServingSize(
                    Number.parseInt(jsonObject.servingSize.amount),
                    jsonObject.servingSize.unit
                );
            } catch (error) {
                console.log('Attempted to set invalid quantity');
            }
        }

        return item;
    }
}

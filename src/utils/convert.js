// fee type
export const convertOrderCardFeeType = (feeType) => {
    switch (feeType) {
        case "0":
            return "Same price for everyone";
        case "1":
            return "Proportional to the amount";
        default:
            return "-";
    }
}

// status
export const convertOrderCardStatus = (status) => {
    switch (status) {
        case "0":
            return "Before Delivery";
        case "1":
            return "During Delivery";
        case "2":
            return "Delivered";
        default:
            return "-"
    }
}